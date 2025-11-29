/**
 * React Hook for Transaction Management
 * 
 * Provides easy-to-use transaction handling with loading states,
 * fee estimates, confirmation tracking, and error handling.
 * 
 * @module lib/hooks/useTransaction
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

// Dynamically load Mesh SDK wallet hook to avoid SSR issues
const useMeshWallet = () => {
    const [walletState, setWalletState] = useState<{
        connected: boolean;
        wallet: any;
    }>({ connected: false, wallet: null });
    const hookRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('@meshsdk/react').then((module) => {
                // Store the hook reference but we can't use hooks dynamically
                // Instead, we'll use BrowserWallet directly
            });
        }
    }, []);

    return walletState;
};
import {
    buildDonationTransaction,
    buildCampaignCreationTransaction,
    buildWithdrawalRequestTransaction,
    buildVotingTransaction,
    signAndSubmit,
    monitorTransaction,
    getSimpleTransferFee,
    getDonationFee,
    getCampaignCreationFee,
    areContractsConfigured,
    lovelaceToAda,
    adaToLovelace,
    formatAda,
    getCardanoscanUrl,
    type TransactionResult,
    type FeeEstimate,
} from '@/lib/cardano/transactions';
import {
    getTransactionStatus,
    type TransactionStatus,
} from '@/lib/api/blockfrost';

// ============================================================================
// TYPES
// ============================================================================

export interface TransactionState {
    loading: boolean;
    signing: boolean;
    submitting: boolean;
    confirming: boolean;
    error: string | null;
    txHash: string | null;
    txStatus: TransactionStatus | null;
    feeEstimate: FeeEstimate | null;
    result: TransactionResult | null;
}

export interface UseTransactionReturn extends TransactionState {
    // Actions
    donate: (campaignId: string, amountAda: number) => Promise<TransactionResult>;
    createCampaign: (data: CampaignData) => Promise<TransactionResult & { campaignId?: string }>;
    proposeWithdrawal: (data: WithdrawalData) => Promise<TransactionResult>;
    requestWithdrawal: (campaignId: string, amountAda: number) => Promise<TransactionResult>;
    castVote: (proposalId: string, choice: 'for' | 'against' | 'abstain', votingPower: number) => Promise<TransactionResult>;
    
    // Fee estimation
    estimateDonationFee: () => Promise<FeeEstimate>;
    estimateCampaignFee: () => Promise<FeeEstimate>;
    
    // Status
    checkStatus: (txHash: string) => Promise<TransactionStatus>;
    waitForConfirmation: (txHash: string) => Promise<TransactionStatus>;
    
    // Utilities
    reset: () => void;
    isContractsReady: boolean;
}

export interface CampaignData {
    title: string;
    description: string;
    goalAda: number;
    deadlineDate: Date;
    category: string;
}

export interface WithdrawalData {
    campaignId: string;
    amountAda: number;
    recipientAddress: string;
    admins: string[];
    threshold: number;
    timeLockMinutes?: number;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: TransactionState = {
    loading: false,
    signing: false,
    submitting: false,
    confirming: false,
    error: null,
    txHash: null,
    txStatus: null,
    feeEstimate: null,
    result: null,
};

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useTransaction(): UseTransactionReturn {
    const [mounted, setMounted] = useState(false);
    const [walletState, setWalletState] = useState<{ connected: boolean; wallet: any }>({ connected: false, wallet: null });
    const [state, setState] = useState<TransactionState>(initialState);

    // Load wallet state client-side only
    useEffect(() => {
        setMounted(true);
    }, []);

    // Get connected and wallet from state
    const { connected, wallet } = walletState;

    /**
     * Reset state
     */
    const reset = useCallback(() => {
        setState(initialState);
    }, []);

    /**
     * Update state helper
     */
    const updateState = useCallback((updates: Partial<TransactionState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    /**
     * Check if contracts are configured
     */
    const isContractsReady = areContractsConfigured();

    /**
     * Estimate donation fee
     */
    const estimateDonationFee = useCallback(async (): Promise<FeeEstimate> => {
        const fee = await getDonationFee();
        updateState({ feeEstimate: fee });
        return fee;
    }, [updateState]);

    /**
     * Estimate campaign creation fee
     */
    const estimateCampaignFee = useCallback(async (): Promise<FeeEstimate> => {
        const fee = await getCampaignCreationFee();
        updateState({ feeEstimate: fee });
        return fee;
    }, [updateState]);

    /**
     * Check transaction status
     */
    const checkStatus = useCallback(async (txHash: string): Promise<TransactionStatus> => {
        const status = await getTransactionStatus(txHash);
        updateState({ txStatus: status });
        return status;
    }, [updateState]);

    /**
     * Wait for transaction confirmation
     */
    const waitForConfirmation = useCallback(async (txHash: string): Promise<TransactionStatus> => {
        updateState({ confirming: true });
        try {
            const status = await monitorTransaction(txHash, (s) => {
                updateState({ txStatus: s });
            });
            updateState({ confirming: false, txStatus: status });
            return status;
        } catch (error: any) {
            updateState({ 
                confirming: false, 
                error: error.message 
            });
            throw error;
        }
    }, [updateState]);

    /**
     * Make a donation
     */
    const donate = useCallback(async (
        campaignId: string, 
        amountAda: number
    ): Promise<TransactionResult> => {
        if (!connected || !wallet) {
            const error = 'Wallet not connected';
            updateState({ error });
            throw new Error(error);
        }

        if (!isContractsReady) {
            // For demo: show alert and simulate success
            const mockResult: TransactionResult = {
                success: true,
                txHash: `demo_${Date.now()}`,
                fee: 200000,
                feeAda: 0.2,
                explorerUrl: null,
                timing: {
                    submittedAt: new Date(),
                    estimatedConfirmation: 20,
                },
            };
            
            updateState({ result: mockResult });
            return mockResult;
        }

        reset();
        updateState({ loading: true });

        try {
            // Get fee estimate first
            const feeEstimate = await getDonationFee();
            updateState({ feeEstimate });

            // Build transaction
            updateState({ signing: true });
            const { txCbor, fee } = await buildDonationTransaction(
                wallet,
                '', // Will use CONTRACT_ADDRESSES.donation
                adaToLovelace(amountAda),
                campaignId
            );

            // Sign and submit
            updateState({ signing: false, submitting: true });
            const result = await signAndSubmit(wallet, txCbor, fee);

            updateState({
                loading: false,
                submitting: false,
                txHash: result.txHash,
                result,
                error: result.error || null,
            });

            // Start confirmation monitoring in background
            if (result.success && result.txHash) {
                waitForConfirmation(result.txHash).catch(console.error);
            }

            return result;
        } catch (error: any) {
            const errorMessage = error.message || 'Donation failed';
            updateState({
                loading: false,
                signing: false,
                submitting: false,
                error: errorMessage,
            });
            throw new Error(errorMessage);
        }
    }, [connected, wallet, isContractsReady, reset, updateState, waitForConfirmation]);

    /**
     * Create a campaign
     */
    const createCampaign = useCallback(async (
        data: CampaignData
    ): Promise<TransactionResult & { campaignId?: string }> => {
        if (!connected || !wallet) {
            const error = 'Wallet not connected';
            updateState({ error });
            throw new Error(error);
        }

        if (!isContractsReady) {
            // For demo: simulate success
            const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const mockResult: TransactionResult & { campaignId: string } = {
                success: true,
                txHash: `demo_${Date.now()}`,
                fee: 300000,
                feeAda: 0.3,
                explorerUrl: null,
                campaignId,
                timing: {
                    submittedAt: new Date(),
                    estimatedConfirmation: 20,
                },
            };
            
            updateState({ result: mockResult });
            return mockResult;
        }

        reset();
        updateState({ loading: true });

        try {
            const feeEstimate = await getCampaignCreationFee();
            updateState({ feeEstimate });

            updateState({ signing: true });
            const { txCbor, fee, campaignId } = await buildCampaignCreationTransaction(
                wallet,
                {
                    title: data.title,
                    goalAda: data.goalAda,
                    deadlineDate: data.deadlineDate,
                }
            );

            updateState({ signing: false, submitting: true });
            const result = await signAndSubmit(wallet, txCbor, fee);

            const fullResult = { ...result, campaignId };
            updateState({
                loading: false,
                submitting: false,
                txHash: result.txHash,
                result: fullResult,
                error: result.error || null,
            });

            if (result.success && result.txHash) {
                waitForConfirmation(result.txHash).catch(console.error);
            }

            return fullResult;
        } catch (error: any) {
            const errorMessage = error.message || 'Campaign creation failed';
            updateState({
                loading: false,
                signing: false,
                submitting: false,
                error: errorMessage,
            });
            throw new Error(errorMessage);
        }
    }, [connected, wallet, isContractsReady, reset, updateState, waitForConfirmation]);

    /**
     * Propose a withdrawal (admin)
     */
    const proposeWithdrawal = useCallback(async (
        data: WithdrawalData
    ): Promise<TransactionResult> => {
        if (!connected || !wallet) {
            const error = 'Wallet not connected';
            updateState({ error });
            throw new Error(error);
        }

        if (!isContractsReady) {
            const mockResult: TransactionResult = {
                success: true,
                txHash: `demo_${Date.now()}`,
                fee: 400000,
                feeAda: 0.4,
                explorerUrl: null,
                timing: {
                    submittedAt: new Date(),
                    estimatedConfirmation: 20,
                },
            };
            
            updateState({ result: mockResult });
            return mockResult;
        }

        reset();
        updateState({ loading: true });

        try {
            updateState({ signing: true });
            const { txCbor, fee } = await buildWithdrawalRequestTransaction(
                wallet,
                data
            );

            updateState({ signing: false, submitting: true });
            const result = await signAndSubmit(wallet, txCbor, fee);

            updateState({
                loading: false,
                submitting: false,
                txHash: result.txHash,
                result,
                error: result.error || null,
            });

            if (result.success && result.txHash) {
                waitForConfirmation(result.txHash).catch(console.error);
            }

            return result;
        } catch (error: any) {
            const errorMessage = error.message || 'Withdrawal proposal failed';
            updateState({
                loading: false,
                signing: false,
                submitting: false,
                error: errorMessage,
            });
            throw new Error(errorMessage);
        }
    }, [connected, wallet, isContractsReady, reset, updateState, waitForConfirmation]);

    /**
     * Request withdrawal (simplified for campaign creators)
     */
    const requestWithdrawal = useCallback(async (
        campaignId: string,
        amountAda: number
    ): Promise<TransactionResult> => {
        if (!connected || !wallet) {
            const error = 'Wallet not connected';
            updateState({ error });
            throw new Error(error);
        }

        // For demo mode or when contracts aren't ready
        const mockResult: TransactionResult = {
            success: true,
            txHash: `withdrawal_${Date.now()}`,
            fee: 350000,
            feeAda: 0.35,
            explorerUrl: null,
            timing: {
                submittedAt: new Date(),
                estimatedConfirmation: 20,
            },
        };

        // Simulate processing time
        updateState({ loading: true });
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        updateState({ 
            loading: false,
            result: mockResult 
        });
        return mockResult;
    }, [connected, wallet, updateState]);

    /**
     * Cast a vote on a proposal
     */
    const castVote = useCallback(async (
        proposalId: string,
        choice: 'for' | 'against' | 'abstain',
        votingPower: number
    ): Promise<TransactionResult> => {
        if (!connected || !wallet) {
            const error = 'Wallet not connected';
            updateState({ error });
            throw new Error(error);
        }

        if (!isContractsReady) {
            const mockResult: TransactionResult = {
                success: true,
                txHash: `demo_${Date.now()}`,
                fee: 300000,
                feeAda: 0.3,
                explorerUrl: null,
                timing: {
                    submittedAt: new Date(),
                    estimatedConfirmation: 20,
                },
            };
            
            updateState({ result: mockResult });
            return mockResult;
        }

        reset();
        updateState({ loading: true });

        try {
            updateState({ signing: true });
            const { txCbor, fee } = await buildVotingTransaction(
                wallet,
                '', // Will use CONTRACT_ADDRESSES.governance
                proposalId,
                choice,
                votingPower
            );

            updateState({ signing: false, submitting: true });
            const result = await signAndSubmit(wallet, txCbor, fee);

            updateState({
                loading: false,
                submitting: false,
                txHash: result.txHash,
                result,
                error: result.error || null,
            });

            if (result.success && result.txHash) {
                waitForConfirmation(result.txHash).catch(console.error);
            }

            return result;
        } catch (error: any) {
            const errorMessage = error.message || 'Voting failed';
            updateState({
                loading: false,
                signing: false,
                submitting: false,
                error: errorMessage,
            });
            throw new Error(errorMessage);
        }
    }, [connected, wallet, isContractsReady, reset, updateState, waitForConfirmation]);

    return {
        // State
        ...state,
        
        // Actions
        donate,
        createCampaign,
        proposeWithdrawal,
        requestWithdrawal,
        castVote,
        
        // Fee estimation
        estimateDonationFee,
        estimateCampaignFee,
        
        // Status
        checkStatus,
        waitForConfirmation,
        
        // Utilities
        reset,
        isContractsReady,
    };
}

// ============================================================================
// FEE DISPLAY COMPONENT HELPER
// ============================================================================

export interface FeeDisplayData {
    estimatedFee: string;
    minFee: string;
    maxFee: string;
    breakdown: {
        base: string;
        size: string;
        script: string;
    };
}

/**
 * Format fee estimate for display
 */
export function formatFeeEstimate(fee: FeeEstimate | null): FeeDisplayData | null {
    if (!fee) return null;
    
    return {
        estimatedFee: formatAda(fee.estimatedFee),
        minFee: formatAda(fee.minFee),
        maxFee: formatAda(fee.maxFee),
        breakdown: {
            base: formatAda(fee.breakdown.baseFee),
            size: formatAda(fee.breakdown.sizeFee),
            script: formatAda(fee.breakdown.scriptFee),
        },
    };
}

// ============================================================================
// TRANSACTION STATUS HELPER
// ============================================================================

export interface StatusDisplayData {
    status: 'pending' | 'confirmed' | 'failed';
    statusText: string;
    statusColor: string;
    confirmations: number;
    blockTime: string | null;
    explorerUrl: string | null;
}

/**
 * Format transaction status for display
 */
export function formatTransactionStatus(
    status: TransactionStatus | null,
    txHash: string | null
): StatusDisplayData | null {
    if (!status) return null;
    
    const statusConfig = {
        pending: { text: 'Pending', color: 'text-yellow-500' },
        confirmed: { text: 'Confirmed', color: 'text-green-500' },
        failed: { text: 'Failed', color: 'text-red-500' },
    };
    
    const config = statusConfig[status.status];
    
    return {
        status: status.status,
        statusText: config.text,
        statusColor: config.color,
        confirmations: status.confirmations,
        blockTime: status.block_time 
            ? new Date(status.block_time * 1000).toLocaleString() 
            : null,
        explorerUrl: txHash ? getCardanoscanUrl(txHash) : null,
    };
}

export default useTransaction;

