/**
 * Transaction Building Utilities for Cardano Donation DApp
 * 
 * Integrates with Mesh SDK and Blockfrost for comprehensive transaction handling
 * @module lib/cardano/transactions
 */

import {
    getProtocolParameters,
    getAddressUtxos,
    estimateTransactionFee,
    getFullFeeEstimate,
    calculateTTL,
    submitTransaction as blockfrostSubmit,
    evaluateTransaction,
    waitForConfirmation,
    getTransactionStatus,
    lovelaceToAda,
    adaToLovelace,
    formatAda,
    getCardanoscanUrl,
    type UTxO,
    type ProtocolParameters,
    type FeeEstimate,
    type TransactionStatus,
} from '@/lib/api/blockfrost';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Campaign datum for on-chain storage */
export interface CampaignDatumFields {
    campaignId: string;
    creator: string;
    title: string;
    goalLovelace: number;
    deadlineEpoch: number;
    totalRaised: number;
    status: 'Active' | 'Completed' | 'Cancelled';
}

/** Donation datum for on-chain storage */
export interface DonationDatumFields {
    campaignId: string;
    donor: string;
    amountLovelace: number;
    timestampPosix: number;
    votingPower: number;
}

/** Withdrawal datum for multi-sig */
export interface WithdrawalDatumFields {
    admins: string[];
    threshold: number;
    timeLock: number | null;
    request: {
        campaignId: string;
        amountLovelace: number;
        recipient: string;
        proposedAt: number;
        signatures: string[];
    };
}

/** Voting datum for governance */
export interface VotingDatumFields {
    proposalId: string;
    voter: string;
    voteChoice: 'for' | 'against' | 'abstain';
    votingPower: number;
}

/** Transaction result with comprehensive info */
export interface TransactionResult {
    success: boolean;
    txHash: string | null;
    fee: number;
    feeAda: number;
    explorerUrl: string | null;
    error?: string;
    timing: {
        submittedAt: Date;
        estimatedConfirmation: number; // seconds
    };
}

/** Transaction build options */
export interface TransactionBuildOptions {
    changeAddress?: string;
    ttlMinutes?: number;
    metadata?: Record<string, any>;
    collateral?: UTxO[];
}

// ============================================================================
// CONTRACT ADDRESSES (Configure after deployment)
// ============================================================================

export const CONTRACT_ADDRESSES = {
    campaign: process.env.NEXT_PUBLIC_CAMPAIGN_SCRIPT_ADDRESS || '',
    donation: process.env.NEXT_PUBLIC_DONATION_SCRIPT_ADDRESS || '',
    multisig: process.env.NEXT_PUBLIC_MULTISIG_SCRIPT_ADDRESS || '',
    governance: process.env.NEXT_PUBLIC_GOVERNANCE_SCRIPT_ADDRESS || '',
};

export const SCRIPT_HASHES = {
    campaign: process.env.NEXT_PUBLIC_CAMPAIGN_SCRIPT_HASH || '',
    donation: process.env.NEXT_PUBLIC_DONATION_SCRIPT_HASH || '',
    multisig: process.env.NEXT_PUBLIC_MULTISIG_SCRIPT_HASH || '',
    governance: process.env.NEXT_PUBLIC_GOVERNANCE_SCRIPT_HASH || '',
};

/**
 * Check if contracts are configured
 */
export function areContractsConfigured(): boolean {
    return Boolean(
        CONTRACT_ADDRESSES.campaign &&
        CONTRACT_ADDRESSES.donation &&
        CONTRACT_ADDRESSES.multisig &&
        CONTRACT_ADDRESSES.governance
    );
}

// ============================================================================
// DATUM CONSTRUCTORS (Plutus Data format)
// ============================================================================

/**
 * Create campaign datum in Plutus Data format
 */
export function createCampaignDatum(
    campaignId: string,
    creator: string,
    title: string,
    goalLovelace: number,
    deadlineEpoch: number
): { fields: any[] } {
    return {
        fields: [
            { bytes: stringToHex(campaignId) },
            { bytes: creator }, // Already hex
            { bytes: stringToHex(title) },
            { int: goalLovelace },
            { int: deadlineEpoch },
            { int: 0 }, // total_raised starts at 0
            { constructor: 0, fields: [] }, // status: Active
        ],
    };
}

/**
 * Create donation datum in Plutus Data format
 */
export function createDonationDatum(
    campaignId: string,
    donor: string,
    amountLovelace: number,
    timestamp: number
): { fields: any[] } {
    return {
        fields: [
            { bytes: stringToHex(campaignId) },
            { bytes: donor },
            { int: amountLovelace },
            { int: timestamp },
            { int: amountLovelace }, // voting_power = donation amount
        ],
    };
}

/**
 * Create withdrawal datum for multi-sig
 */
export function createWithdrawalDatum(
    admins: string[],
    threshold: number,
    campaignId: string,
    amount: number,
    recipient: string,
    timeLock?: number
): { fields: any[] } {
    return {
        fields: [
            { list: admins.map(admin => ({ bytes: admin })) },
            { int: threshold },
            timeLock 
                ? { constructor: 0, fields: [{ int: timeLock }] } // Some(timeLock)
                : { constructor: 1, fields: [] }, // None
            {
                fields: [
                    { bytes: stringToHex(campaignId) },
                    { int: amount },
                    { bytes: recipient },
                    { int: Date.now() },
                    { list: [] }, // Empty signatures initially
                ],
            },
        ],
    };
}

/**
 * Create voting datum for governance
 */
export function createVotingDatum(
    proposalId: string,
    voter: string,
    voteChoice: 'for' | 'against' | 'abstain',
    votingPower: number
): { fields: any[] } {
    const choiceConstructor = 
        voteChoice === 'for' ? 0 : 
        voteChoice === 'against' ? 1 : 2;

    return {
        fields: [
            { bytes: stringToHex(proposalId) },
            { bytes: voter },
            { constructor: choiceConstructor, fields: [] },
            { int: votingPower },
        ],
    };
}

// ============================================================================
// REDEEMER CONSTRUCTORS
// ============================================================================

export const CampaignRedeemers = {
    CreateCampaign: { constructor: 0, fields: [] },
    UpdateCampaign: { constructor: 1, fields: [] },
    CancelCampaign: { constructor: 2, fields: [] },
    CompleteCampaign: { constructor: 3, fields: [] },
};

export const DonationRedeemers = {
    Donate: { constructor: 0, fields: [] },
    Withdraw: { constructor: 1, fields: [] },
    ClaimRefund: { constructor: 2, fields: [] },
};

export const MultiSigRedeemers = {
    ProposeWithdrawal: { constructor: 0, fields: [] },
    SignWithdrawal: { constructor: 1, fields: [] },
    ExecuteWithdrawal: { constructor: 2, fields: [] },
    CancelWithdrawal: { constructor: 3, fields: [] },
};

export const GovernanceRedeemers = {
    CreateProposal: { constructor: 0, fields: [] },
    CastVote: (choice: 'for' | 'against' | 'abstain', power: number) => ({
        constructor: 1,
        fields: [
            { constructor: choice === 'for' ? 0 : choice === 'against' ? 1 : 2, fields: [] },
            { int: power },
        ],
    }),
    ExecuteProposal: { constructor: 2, fields: [] },
    CancelProposal: { constructor: 3, fields: [] },
};

// ============================================================================
// TRANSACTION BUILDERS (Mesh SDK Integration)
// ============================================================================

/**
 * Build a simple ADA transfer transaction
 */
export async function buildSimpleTransfer(
    wallet: any,
    recipientAddress: string,
    amountLovelace: number,
    options?: TransactionBuildOptions
): Promise<{ txCbor: string; fee: FeeEstimate }> {
    // Get wallet UTxOs
    const walletAddress = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();
    
    if (!utxos || utxos.length === 0) {
        throw new Error('No UTxOs available in wallet');
    }

    // Calculate TTL
    const { ttl } = await calculateTTL(options?.ttlMinutes || 20);

    // Build transaction using Mesh SDK
    const tx = await wallet.createTx();
    
    tx.sendLovelace(recipientAddress, amountLovelace.toString());
    
    if (options?.metadata) {
        tx.setMetadata(674, options.metadata);
    }

    // Set TTL
    tx.setTimeToExpire(ttl.toString());

    // Build and get fee estimate
    const unsignedTx = await tx.build();
    
    // Estimate fee based on transaction size
    const txSize = unsignedTx.length / 2; // hex string to bytes
    const feeEstimate = await estimateTransactionFee(txSize);

    return {
        txCbor: unsignedTx,
        fee: feeEstimate,
    };
}

/**
 * Build campaign creation transaction
 */
export async function buildCampaignCreationTransaction(
    wallet: any,
    campaignData: {
        title: string;
        goalAda: number;
        deadlineDate: Date;
    },
    options?: TransactionBuildOptions
): Promise<{ txCbor: string; fee: FeeEstimate; campaignId: string }> {
    if (!CONTRACT_ADDRESSES.campaign) {
        throw new Error('Campaign contract address not configured. Deploy smart contracts first.');
    }

    const walletAddress = await wallet.getChangeAddress();
    
    // Generate unique campaign ID
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create datum
    const datum = createCampaignDatum(
        campaignId,
        walletAddress,
        campaignData.title,
        adaToLovelace(campaignData.goalAda),
        campaignData.deadlineDate.getTime()
    );

    const { ttl } = await calculateTTL(options?.ttlMinutes || 20);

    // Build transaction
    const tx = await wallet.createTx();
    
    // Lock 2 ADA with campaign datum at script address
    tx.sendLovelace(
        CONTRACT_ADDRESSES.campaign,
        '2000000', // 2 ADA minimum UTxO
        { datum }
    );
    
    tx.setTimeToExpire(ttl.toString());
    tx.setRequiredSigners([walletAddress]);

    const unsignedTx = await tx.build();
    const txSize = unsignedTx.length / 2;
    const feeEstimate = await estimateTransactionFee(txSize);

    return {
        txCbor: unsignedTx,
        fee: feeEstimate,
        campaignId,
    };
}

/**
 * Build donation transaction
 */
export async function buildDonationTransaction(
    wallet: any,
    campaignAddress: string,
    amountLovelace: number,
    campaignId: string,
    options?: TransactionBuildOptions
): Promise<{ txCbor: string; fee: FeeEstimate }> {
    if (!CONTRACT_ADDRESSES.donation) {
        throw new Error('Donation contract address not configured. Deploy smart contracts first.');
    }

    const walletAddress = await wallet.getChangeAddress();
    
    // Create donation datum
    const datum = createDonationDatum(
        campaignId,
        walletAddress,
        amountLovelace,
        Date.now()
    );

    const { ttl } = await calculateTTL(options?.ttlMinutes || 20);

    // Build transaction
    const tx = await wallet.createTx();
    
    // Send donation to campaign/donation script
    tx.sendLovelace(
        CONTRACT_ADDRESSES.donation,
        amountLovelace.toString(),
        { datum }
    );
    
    // Add metadata with donation info
    tx.setMetadata(674, {
        msg: ['DonateDAO Donation'],
        campaign: campaignId,
        amount: lovelaceToAda(amountLovelace),
    });
    
    tx.setTimeToExpire(ttl.toString());
    tx.setRequiredSigners([walletAddress]);

    const unsignedTx = await tx.build();
    const txSize = unsignedTx.length / 2;
    const feeEstimate = await estimateTransactionFee(txSize);

    return {
        txCbor: unsignedTx,
        fee: feeEstimate,
    };
}

/**
 * Build withdrawal request transaction (multi-sig)
 */
export async function buildWithdrawalRequestTransaction(
    wallet: any,
    withdrawalData: {
        campaignId: string;
        amountAda: number;
        recipientAddress: string;
        admins: string[];
        threshold: number;
        timeLockMinutes?: number;
    },
    options?: TransactionBuildOptions
): Promise<{ txCbor: string; fee: FeeEstimate }> {
    if (!CONTRACT_ADDRESSES.multisig) {
        throw new Error('Multi-sig contract address not configured. Deploy smart contracts first.');
    }

    const walletAddress = await wallet.getChangeAddress();
    
    // Calculate time lock if specified
    const timeLock = withdrawalData.timeLockMinutes 
        ? Date.now() + (withdrawalData.timeLockMinutes * 60 * 1000)
        : undefined;
    
    // Create withdrawal datum
    const datum = createWithdrawalDatum(
        withdrawalData.admins,
        withdrawalData.threshold,
        withdrawalData.campaignId,
        adaToLovelace(withdrawalData.amountAda),
        withdrawalData.recipientAddress,
        timeLock
    );

    const { ttl } = await calculateTTL(options?.ttlMinutes || 30);

    // Build transaction
    const tx = await wallet.createTx();
    
    tx.sendLovelace(
        CONTRACT_ADDRESSES.multisig,
        '2000000', // Minimum UTxO
        { 
            datum,
            redeemer: MultiSigRedeemers.ProposeWithdrawal,
        }
    );
    
    tx.setTimeToExpire(ttl.toString());
    tx.setRequiredSigners([walletAddress]);

    const unsignedTx = await tx.build();
    const txSize = unsignedTx.length / 2;
    const feeEstimate = await estimateTransactionFee(txSize);

    return {
        txCbor: unsignedTx,
        fee: feeEstimate,
    };
}

/**
 * Build voting transaction
 */
export async function buildVotingTransaction(
    wallet: any,
    governanceAddress: string,
    proposalId: string,
    voteChoice: 'for' | 'against' | 'abstain',
    votingPower: number,
    options?: TransactionBuildOptions
): Promise<{ txCbor: string; fee: FeeEstimate }> {
    if (!CONTRACT_ADDRESSES.governance) {
        throw new Error('Governance contract address not configured. Deploy smart contracts first.');
    }

    const walletAddress = await wallet.getChangeAddress();
    
    // Create vote datum
    const datum = createVotingDatum(
        proposalId,
        walletAddress,
        voteChoice,
        votingPower
    );

    const { ttl } = await calculateTTL(options?.ttlMinutes || 20);

    // Build transaction
    const tx = await wallet.createTx();
    
    tx.sendLovelace(
        CONTRACT_ADDRESSES.governance,
        '2000000', // Minimum UTxO
        {
            datum,
            redeemer: GovernanceRedeemers.CastVote(voteChoice, votingPower),
        }
    );
    
    tx.setMetadata(674, {
        msg: ['DonateDAO Vote'],
        proposal: proposalId,
        choice: voteChoice,
        power: votingPower,
    });
    
    tx.setTimeToExpire(ttl.toString());
    tx.setRequiredSigners([walletAddress]);

    const unsignedTx = await tx.build();
    const txSize = unsignedTx.length / 2;
    const feeEstimate = await estimateTransactionFee(txSize);

    return {
        txCbor: unsignedTx,
        fee: feeEstimate,
    };
}

// ============================================================================
// TRANSACTION SIGNING & SUBMISSION
// ============================================================================

/**
 * Sign a transaction with the wallet
 */
export async function signTransaction(
    wallet: any, 
    txCbor: string, 
    partialSign: boolean = false
): Promise<string> {
    try {
        const signedTx = await wallet.signTx(txCbor, partialSign);
        return signedTx;
    } catch (error: any) {
        throw new Error(`Transaction signing failed: ${error.message || error}`);
    }
}

/**
 * Submit a signed transaction
 */
export async function submitTransaction(
    wallet: any, 
    signedTxCbor: string
): Promise<string> {
    try {
        // Try submitting through wallet first (better UX)
        const txHash = await wallet.submitTx(signedTxCbor);
        return txHash;
    } catch (walletError) {
        // Fallback to Blockfrost submission
        try {
            const txHash = await blockfrostSubmit(signedTxCbor);
            return txHash;
        } catch (blockfrostError: any) {
            throw new Error(`Transaction submission failed: ${blockfrostError.message}`);
        }
    }
}

/**
 * Sign and submit transaction with full result
 */
export async function signAndSubmit(
    wallet: any,
    txCbor: string,
    feeEstimate: FeeEstimate
): Promise<TransactionResult> {
    const submittedAt = new Date();
    
    try {
        // Sign
        const signedTx = await signTransaction(wallet, txCbor);
        
        // Submit
        const txHash = await submitTransaction(wallet, signedTx);
        
        return {
            success: true,
            txHash,
            fee: feeEstimate.estimatedFee,
            feeAda: lovelaceToAda(feeEstimate.estimatedFee),
            explorerUrl: getCardanoscanUrl(txHash),
            timing: {
                submittedAt,
                estimatedConfirmation: 20, // ~20 seconds average
            },
        };
    } catch (error: any) {
        return {
            success: false,
            txHash: null,
            fee: feeEstimate.estimatedFee,
            feeAda: lovelaceToAda(feeEstimate.estimatedFee),
            explorerUrl: null,
            error: error.message,
            timing: {
                submittedAt,
                estimatedConfirmation: 0,
            },
        };
    }
}

// ============================================================================
// TRANSACTION MONITORING
// ============================================================================

/**
 * Monitor transaction until confirmed
 */
export async function monitorTransaction(
    txHash: string,
    onUpdate?: (status: TransactionStatus) => void
): Promise<TransactionStatus> {
    return waitForConfirmation(txHash, {
        timeout: 5 * 60 * 1000, // 5 minutes
        pollInterval: 3000, // 3 seconds
        minConfirmations: 1,
        onStatusChange: onUpdate,
    });
}

/**
 * Quick check if transaction is confirmed
 */
export async function isTransactionConfirmed(txHash: string): Promise<boolean> {
    const status = await getTransactionStatus(txHash);
    return status.status === 'confirmed';
}

// ============================================================================
// FEE HELPERS
// ============================================================================

/**
 * Get fee estimate for a simple transfer
 */
export async function getSimpleTransferFee(amountAda: number): Promise<FeeEstimate> {
    // Average simple transfer is ~250 bytes
    return estimateTransactionFee(250);
}

/**
 * Get fee estimate for donation
 */
export async function getDonationFee(): Promise<FeeEstimate> {
    // Donation with datum is ~400 bytes
    return estimateTransactionFee(400);
}

/**
 * Get fee estimate for campaign creation
 */
export async function getCampaignCreationFee(): Promise<FeeEstimate> {
    // Campaign creation with larger datum ~500 bytes
    return estimateTransactionFee(500);
}

/**
 * Get fee estimate for script interaction
 */
export async function getScriptInteractionFee(
    txSizeBytes: number,
    executionUnits?: { memory: number; steps: number }
): Promise<FeeEstimate> {
    return getFullFeeEstimate(txSizeBytes, executionUnits);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert string to hex
 */
export function stringToHex(str: string): string {
    return Buffer.from(str, 'utf8').toString('hex');
}

/**
 * Convert hex to string
 */
export function hexToString(hex: string): string {
    return Buffer.from(hex, 'hex').toString('utf8');
}

/**
 * Generate unique ID
 */
export function generateUniqueId(prefix: string = ''): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * Validate Cardano address
 */
export function isValidAddress(address: string): boolean {
    // Basic validation - should start with addr (Shelley) or DdzFF (Byron)
    if (!address) return false;
    
    // Shelley addresses
    if (address.startsWith('addr1') || address.startsWith('addr_test1')) {
        return address.length >= 50;
    }
    
    // Byron addresses
    if (address.startsWith('DdzFF') || address.startsWith('Ae2')) {
        return address.length >= 50;
    }
    
    return false;
}

/**
 * Get minimum UTxO value
 */
export async function getMinUtxoValue(): Promise<number> {
    const params = await getProtocolParameters();
    // Minimum is typically around 1-2 ADA
    return 2_000_000; // 2 ADA default
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    lovelaceToAda,
    adaToLovelace,
    formatAda,
    getCardanoscanUrl,
};

// Re-export types from blockfrost
export type { FeeEstimate, TransactionStatus } from '@/lib/api/blockfrost';
