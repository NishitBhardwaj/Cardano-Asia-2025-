/**
 * Blockfrost API Integration for Cardano Blockchain
 * 
 * Comprehensive transaction handling with detailed fee and timing information
 * @module lib/api/blockfrost
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const BLOCKFROST_API_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || '';
const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'preprod';
const BASE_URL = NETWORK === 'mainnet'
    ? 'https://cardano-mainnet.blockfrost.io/api/v0'
    : 'https://cardano-preprod.blockfrost.io/api/v0';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Blockfrost API error response */
export interface BlockfrostError {
    status_code: number;
    error: string;
    message: string;
}

/** UTxO (Unspent Transaction Output) */
export interface UTxO {
    address: string;
    tx_hash: string;
    tx_index: number;
    output_index: number;
    amount: Asset[];
    block: string;
    data_hash: string | null;
    inline_datum: string | null;
    reference_script_hash: string | null;
}

/** Asset in a UTxO */
export interface Asset {
    unit: string;  // 'lovelace' or policy_id + asset_name
    quantity: string;
}

/** Transaction details */
export interface Transaction {
    hash: string;
    block: string;
    block_height: number;
    block_time: number;
    slot: number;
    index: number;
    output_amount: Asset[];
    fees: string;
    deposit: string;
    size: number;
    invalid_before: string | null;
    invalid_hereafter: string | null;
    utxo_count: number;
    withdrawal_count: number;
    mir_cert_count: number;
    delegation_count: number;
    stake_cert_count: number;
    pool_update_count: number;
    pool_retire_count: number;
    asset_mint_or_burn_count: number;
    redeemer_count: number;
    valid_contract: boolean;
}

/** Transaction UTxOs */
export interface TransactionUtxos {
    hash: string;
    inputs: TransactionInput[];
    outputs: TransactionOutput[];
}

export interface TransactionInput {
    address: string;
    amount: Asset[];
    tx_hash: string;
    output_index: number;
    data_hash: string | null;
    inline_datum: string | null;
    reference_script_hash: string | null;
    collateral: boolean;
    reference: boolean;
}

export interface TransactionOutput {
    address: string;
    amount: Asset[];
    output_index: number;
    data_hash: string | null;
    inline_datum: string | null;
    collateral: boolean;
    reference_script_hash: string | null;
}

/** Block information */
export interface Block {
    time: number;
    height: number;
    hash: string;
    slot: number;
    epoch: number;
    epoch_slot: number;
    slot_leader: string;
    size: number;
    tx_count: number;
    output: string;
    fees: string;
    block_vrf: string;
    op_cert: string;
    op_cert_counter: string;
    previous_block: string;
    next_block: string | null;
    confirmations: number;
}

/** Protocol parameters for fee calculation */
export interface ProtocolParameters {
    epoch: number;
    min_fee_a: number;
    min_fee_b: number;
    max_block_size: number;
    max_tx_size: number;
    max_block_header_size: number;
    key_deposit: string;
    pool_deposit: string;
    e_max: number;
    n_opt: number;
    a0: number;
    rho: number;
    tau: number;
    decentralisation_param: number;
    extra_entropy: null;
    protocol_major_ver: number;
    protocol_minor_ver: number;
    min_utxo: string;
    min_pool_cost: string;
    nonce: string;
    cost_models: CostModels;
    price_mem: number;
    price_step: number;
    max_tx_ex_mem: string;
    max_tx_ex_steps: string;
    max_block_ex_mem: string;
    max_block_ex_steps: string;
    max_val_size: string;
    collateral_percent: number;
    max_collateral_inputs: number;
    coins_per_utxo_size: string;
    coins_per_utxo_word: string;
}

export interface CostModels {
    PlutusV1: Record<string, number>;
    PlutusV2: Record<string, number>;
    PlutusV3?: Record<string, number>;
}

/** Address information */
export interface AddressInfo {
    address: string;
    amount: Asset[];
    stake_address: string | null;
    type: 'byron' | 'shelley';
    script: boolean;
}

/** Transaction metadata */
export interface TransactionMetadata {
    label: string;
    json_metadata: any;
    cbor_metadata: string | null;
}

/** Script information */
export interface Script {
    script_hash: string;
    type: 'timelock' | 'plutusV1' | 'plutusV2' | 'plutusV3';
    serialised_size: number;
}

/** Network information */
export interface NetworkInfo {
    supply: {
        max: string;
        total: string;
        circulating: string;
        locked: string;
        treasury: string;
        reserves: string;
    };
    stake: {
        live: string;
        active: string;
    };
}

/** Transaction status for monitoring */
export interface TransactionStatus {
    hash: string;
    status: 'pending' | 'confirmed' | 'failed';
    confirmations: number;
    block_height: number | null;
    block_time: number | null;
    fees: string | null;
    error?: string;
}

/** Fee estimation result */
export interface FeeEstimate {
    estimatedFee: number;
    minFee: number;
    maxFee: number;
    breakdown: {
        baseFee: number;
        sizeFee: number;
        scriptFee: number;
    };
    parameters: {
        minFeeA: number;
        minFeeB: number;
        pricePerByte: number;
    };
}

/** Transaction timing information */
export interface TransactionTiming {
    submittedAt: Date;
    confirmedAt: Date | null;
    estimatedConfirmationTime: number; // seconds
    slot: number;
    ttl: number;
    currentSlot: number;
    slotDuration: number; // seconds
}

// ============================================================================
// API REQUEST HELPERS
// ============================================================================

/**
 * Generic Blockfrost API request wrapper with error handling
 */
async function blockfrostRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (!BLOCKFROST_API_KEY) {
        throw new Error('Blockfrost API key not configured. Set NEXT_PUBLIC_BLOCKFROST_API_KEY in .env.local');
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'project_id': BLOCKFROST_API_KEY,
            ...options?.headers,
        },
    });

    if (!response.ok) {
        let errorMessage = `Blockfrost API Error (${response.status})`;
        try {
            const error: BlockfrostError = await response.json();
            errorMessage = `Blockfrost API Error: ${error.message} (${error.status_code})`;
        } catch {
            errorMessage = `Blockfrost API Error: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    return response.json();
}

/**
 * POST request helper for binary data (CBOR)
 */
async function blockfrostPostCbor<T>(endpoint: string, cborHex: string): Promise<T> {
    if (!BLOCKFROST_API_KEY) {
        throw new Error('Blockfrost API key not configured');
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'project_id': BLOCKFROST_API_KEY,
            'Content-Type': 'application/cbor',
        },
        body: Buffer.from(cborHex, 'hex'),
    });

    if (!response.ok) {
        let errorMessage = `Blockfrost API Error (${response.status})`;
        try {
            const error: BlockfrostError = await response.json();
            errorMessage = error.message;
        } catch {
            errorMessage = response.statusText;
        }
        throw new Error(errorMessage);
    }

    return response.json();
}

// ============================================================================
// ADDRESS QUERIES
// ============================================================================

/**
 * Get detailed information about an address
 */
export async function getAddressInfo(address: string): Promise<AddressInfo> {
    return blockfrostRequest<AddressInfo>(`/addresses/${address}`);
}

/**
 * Get all UTxOs at a specific address
 */
export async function getAddressUtxos(address: string): Promise<UTxO[]> {
    return blockfrostRequest<UTxO[]>(`/addresses/${address}/utxos`);
}

/**
 * Get UTxOs at address with specific asset
 */
export async function getAddressUtxosWithAsset(address: string, asset: string): Promise<UTxO[]> {
    return blockfrostRequest<UTxO[]>(`/addresses/${address}/utxos/${asset}`);
}

/**
 * Get all transactions for an address with pagination
 */
export async function getAddressTransactions(
    address: string, 
    options?: { page?: number; count?: number; order?: 'asc' | 'desc' }
): Promise<{ tx_hash: string; tx_index: number; block_height: number; block_time: number }[]> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.count) params.append('count', options.count.toString());
    if (options?.order) params.append('order', options.order);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return blockfrostRequest(`/addresses/${address}/transactions${query}`);
}

/**
 * Get total ADA balance at address
 */
export async function getAddressBalance(address: string): Promise<{ lovelace: bigint; assets: Asset[] }> {
    const info = await getAddressInfo(address);
    const lovelaceAsset = info.amount.find(a => a.unit === 'lovelace');
    const lovelace = BigInt(lovelaceAsset?.quantity || '0');
    const assets = info.amount.filter(a => a.unit !== 'lovelace');
    return { lovelace, assets };
}

// ============================================================================
// TRANSACTION QUERIES
// ============================================================================

/**
 * Get detailed transaction information by hash
 */
export async function getTransaction(txHash: string): Promise<Transaction> {
    return blockfrostRequest<Transaction>(`/txs/${txHash}`);
}

/**
 * Get transaction UTxOs (inputs and outputs)
 */
export async function getTransactionUtxos(txHash: string): Promise<TransactionUtxos> {
    return blockfrostRequest<TransactionUtxos>(`/txs/${txHash}/utxos`);
}

/**
 * Get transaction metadata
 */
export async function getTransactionMetadata(txHash: string): Promise<TransactionMetadata[]> {
    return blockfrostRequest<TransactionMetadata[]>(`/txs/${txHash}/metadata`);
}

/**
 * Get transaction redeemers (for smart contract interactions)
 */
export async function getTransactionRedeemers(txHash: string): Promise<any[]> {
    return blockfrostRequest<any[]>(`/txs/${txHash}/redeemers`);
}

// ============================================================================
// BLOCK QUERIES
// ============================================================================

/**
 * Get latest block information
 */
export async function getLatestBlock(): Promise<Block> {
    return blockfrostRequest<Block>('/blocks/latest');
}

/**
 * Get block by hash or number
 */
export async function getBlock(hashOrNumber: string | number): Promise<Block> {
    return blockfrostRequest<Block>(`/blocks/${hashOrNumber}`);
}

/**
 * Get current slot number
 */
export async function getCurrentSlot(): Promise<number> {
    const block = await getLatestBlock();
    return block.slot;
}

/**
 * Get current epoch
 */
export async function getCurrentEpoch(): Promise<number> {
    const block = await getLatestBlock();
    return block.epoch;
}

// ============================================================================
// PROTOCOL PARAMETERS
// ============================================================================

/**
 * Get current protocol parameters
 */
export async function getProtocolParameters(): Promise<ProtocolParameters> {
    return blockfrostRequest<ProtocolParameters>('/epochs/latest/parameters');
}

/**
 * Get protocol parameters for specific epoch
 */
export async function getEpochParameters(epoch: number): Promise<ProtocolParameters> {
    return blockfrostRequest<ProtocolParameters>(`/epochs/${epoch}/parameters`);
}

// ============================================================================
// TRANSACTION SUBMISSION & EVALUATION
// ============================================================================

/**
 * Submit a signed transaction to the blockchain
 * @param txCbor - CBOR-encoded signed transaction (hex string)
 * @returns Transaction hash
 */
export async function submitTransaction(txCbor: string): Promise<string> {
    return blockfrostPostCbor<string>('/tx/submit', txCbor);
}

/**
 * Evaluate a transaction to get execution units
 * Useful for estimating script costs before submission
 */
export async function evaluateTransaction(txCbor: string): Promise<{
    result: {
        EvaluationResult: Record<string, { memory: number; steps: number }>;
    } | {
        EvaluationFailure: string;
    };
}> {
    return blockfrostPostCbor('/utils/txs/evaluate', txCbor);
}

/**
 * Evaluate transaction with additional UTxOs (for testing)
 */
export async function evaluateTransactionWithUtxos(
    txCbor: string, 
    additionalUtxos: any[]
): Promise<any> {
    const response = await fetch(`${BASE_URL}/utils/txs/evaluate/utxos`, {
        method: 'POST',
        headers: {
            'project_id': BLOCKFROST_API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            cbor: txCbor,
            additionalUtxoSet: additionalUtxos,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Evaluation failed: ${error.message}`);
    }

    return response.json();
}

// ============================================================================
// FEE ESTIMATION
// ============================================================================

/**
 * Estimate transaction fee based on size
 * Formula: fee = min_fee_a * tx_size + min_fee_b
 */
export async function estimateTransactionFee(txSizeBytes: number): Promise<FeeEstimate> {
    const params = await getProtocolParameters();
    
    const baseFee = params.min_fee_b;
    const sizeFee = params.min_fee_a * txSizeBytes;
    const totalFee = baseFee + sizeFee;
    
    return {
        estimatedFee: totalFee,
        minFee: totalFee,
        maxFee: Math.ceil(totalFee * 1.2), // 20% buffer
        breakdown: {
            baseFee: baseFee,
            sizeFee: sizeFee,
            scriptFee: 0, // Added separately for Plutus scripts
        },
        parameters: {
            minFeeA: params.min_fee_a,
            minFeeB: params.min_fee_b,
            pricePerByte: params.min_fee_a,
        },
    };
}

/**
 * Estimate fee for Plutus script execution
 */
export async function estimateScriptFee(
    memoryUnits: number, 
    cpuUnits: number
): Promise<number> {
    const params = await getProtocolParameters();
    
    const memCost = Math.ceil(memoryUnits * params.price_mem);
    const cpuCost = Math.ceil(cpuUnits * params.price_step);
    
    return memCost + cpuCost;
}

/**
 * Get comprehensive fee estimate for a transaction
 */
export async function getFullFeeEstimate(
    txSizeBytes: number,
    scriptExecution?: { memory: number; steps: number }
): Promise<FeeEstimate> {
    const baseFeeEstimate = await estimateTransactionFee(txSizeBytes);
    
    if (scriptExecution) {
        const scriptFee = await estimateScriptFee(
            scriptExecution.memory, 
            scriptExecution.steps
        );
        baseFeeEstimate.breakdown.scriptFee = scriptFee;
        baseFeeEstimate.estimatedFee += scriptFee;
        baseFeeEstimate.maxFee += Math.ceil(scriptFee * 1.2);
    }
    
    return baseFeeEstimate;
}

// ============================================================================
// TRANSACTION TIMING
// ============================================================================

/** Cardano slot configuration */
const SLOT_CONFIG = {
    preprod: {
        zeroTime: 1654041600000, // Unix timestamp for slot 0 (preprod)
        slotLength: 1000, // 1 second per slot in ms
    },
    mainnet: {
        zeroTime: 1596059091000, // Unix timestamp for slot 0 (mainnet)
        slotLength: 1000,
    },
};

/**
 * Convert POSIX timestamp to slot number
 */
export function posixTimeToSlot(posixTime: number): number {
    const config = SLOT_CONFIG[NETWORK as keyof typeof SLOT_CONFIG] || SLOT_CONFIG.preprod;
    return Math.floor((posixTime - config.zeroTime) / config.slotLength);
}

/**
 * Convert slot number to POSIX timestamp
 */
export function slotToPosixTime(slot: number): number {
    const config = SLOT_CONFIG[NETWORK as keyof typeof SLOT_CONFIG] || SLOT_CONFIG.preprod;
    return config.zeroTime + (slot * config.slotLength);
}

/**
 * Calculate TTL (Time-To-Live) for transaction
 * @param validityMinutes - How long the transaction should be valid (default: 20 minutes)
 */
export async function calculateTTL(validityMinutes: number = 20): Promise<{
    slot: number;
    ttl: number;
    expiresAt: Date;
}> {
    const currentSlot = await getCurrentSlot();
    const slotsPerMinute = 60; // 1 slot per second
    const ttl = currentSlot + (validityMinutes * slotsPerMinute);
    
    return {
        slot: currentSlot,
        ttl,
        expiresAt: new Date(slotToPosixTime(ttl)),
    };
}

/**
 * Get estimated confirmation time
 * Average Cardano block time is ~20 seconds
 */
export function getEstimatedConfirmationTime(): {
    averageSeconds: number;
    minSeconds: number;
    maxSeconds: number;
} {
    return {
        averageSeconds: 20,
        minSeconds: 10,
        maxSeconds: 60,
    };
}

// ============================================================================
// TRANSACTION MONITORING
// ============================================================================

/**
 * Check transaction status
 */
export async function getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    try {
        const tx = await getTransaction(txHash);
        const block = await getBlock(tx.block);
        
        return {
            hash: txHash,
            status: 'confirmed',
            confirmations: block.confirmations,
            block_height: tx.block_height,
            block_time: tx.block_time,
            fees: tx.fees,
        };
    } catch (error: any) {
        if (error.message.includes('404') || error.message.includes('not found')) {
            return {
                hash: txHash,
                status: 'pending',
                confirmations: 0,
                block_height: null,
                block_time: null,
                fees: null,
            };
        }
        return {
            hash: txHash,
            status: 'failed',
            confirmations: 0,
            block_height: null,
            block_time: null,
            fees: null,
            error: error.message,
        };
    }
}

/**
 * Wait for transaction confirmation with polling
 */
export async function waitForConfirmation(
    txHash: string,
    options?: {
        timeout?: number;      // Max wait time in ms (default: 5 minutes)
        pollInterval?: number; // Poll interval in ms (default: 5 seconds)
        minConfirmations?: number; // Min confirmations required (default: 1)
        onStatusChange?: (status: TransactionStatus) => void;
    }
): Promise<TransactionStatus> {
    const timeout = options?.timeout || 5 * 60 * 1000;
    const pollInterval = options?.pollInterval || 5000;
    const minConfirmations = options?.minConfirmations || 1;
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
        const status = await getTransactionStatus(txHash);
        
        options?.onStatusChange?.(status);
        
        if (status.status === 'confirmed' && status.confirmations >= minConfirmations) {
            return status;
        }
        
        if (status.status === 'failed') {
            throw new Error(`Transaction failed: ${status.error}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error(`Transaction confirmation timeout after ${timeout / 1000} seconds`);
}

/**
 * Get detailed transaction timing information
 */
export async function getTransactionTiming(txHash: string): Promise<TransactionTiming | null> {
    try {
        const tx = await getTransaction(txHash);
        const currentSlot = await getCurrentSlot();
        
        return {
            submittedAt: new Date(tx.block_time * 1000),
            confirmedAt: new Date(tx.block_time * 1000),
            estimatedConfirmationTime: 0, // Already confirmed
            slot: tx.slot,
            ttl: parseInt(tx.invalid_hereafter || '0'),
            currentSlot,
            slotDuration: 1,
        };
    } catch {
        return null;
    }
}

// ============================================================================
// SCRIPT QUERIES
// ============================================================================

/**
 * Get script information by hash
 */
export async function getScript(scriptHash: string): Promise<Script> {
    return blockfrostRequest<Script>(`/scripts/${scriptHash}`);
}

/**
 * Get script CBOR
 */
export async function getScriptCbor(scriptHash: string): Promise<{ cbor: string }> {
    return blockfrostRequest<{ cbor: string }>(`/scripts/${scriptHash}/cbor`);
}

/**
 * Get script JSON (for native scripts)
 */
export async function getScriptJson(scriptHash: string): Promise<{ json: any }> {
    return blockfrostRequest<{ json: any }>(`/scripts/${scriptHash}/json`);
}

/**
 * Get all UTxOs at a script address
 */
export async function getScriptUtxos(scriptHash: string): Promise<UTxO[]> {
    const scriptInfo = await getScript(scriptHash);
    // Script address would need to be derived from the hash
    // This is a placeholder - actual implementation needs address derivation
    return [];
}

// ============================================================================
// NETWORK INFORMATION
// ============================================================================

/**
 * Get network information
 */
export async function getNetworkInfo(): Promise<NetworkInfo> {
    return blockfrostRequest<NetworkInfo>('/network');
}

/**
 * Check if Blockfrost API is available
 */
export async function healthCheck(): Promise<boolean> {
    try {
        await blockfrostRequest<{ is_healthy: boolean }>('/health');
        return true;
    } catch {
        return false;
    }
}

/**
 * Get API usage metrics
 */
export async function getApiUsage(): Promise<{
    calls_made: number;
    calls_remaining: number;
}> {
    // This would require checking response headers
    // Returning placeholder for now
    return {
        calls_made: 0,
        calls_remaining: 50000,
    };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert lovelace to ADA
 */
export function lovelaceToAda(lovelace: number | string | bigint): number {
    return Number(lovelace) / 1_000_000;
}

/**
 * Convert ADA to lovelace
 */
export function adaToLovelace(ada: number): number {
    return Math.floor(ada * 1_000_000);
}

/**
 * Format lovelace as ADA string
 */
export function formatAda(lovelace: number | string | bigint, decimals: number = 6): string {
    const ada = lovelaceToAda(lovelace);
    return `${ada.toLocaleString(undefined, { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: decimals 
    })} ₳`;
}

/**
 * Shorten transaction hash for display
 */
export function shortenTxHash(hash: string, chars: number = 8): string {
    if (hash.length <= chars * 2) return hash;
    return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

/**
 * Get Cardanoscan URL for transaction
 */
export function getCardanoscanUrl(txHash: string): string {
    const baseUrl = NETWORK === 'mainnet' 
        ? 'https://cardanoscan.io' 
        : 'https://preprod.cardanoscan.io';
    return `${baseUrl}/transaction/${txHash}`;
}

/**
 * Get Cardanoscan URL for address
 */
export function getAddressExplorerUrl(address: string): string {
    const baseUrl = NETWORK === 'mainnet' 
        ? 'https://cardanoscan.io' 
        : 'https://preprod.cardanoscan.io';
    return `${baseUrl}/address/${address}`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { NETWORK, BASE_URL, BLOCKFROST_API_KEY };
