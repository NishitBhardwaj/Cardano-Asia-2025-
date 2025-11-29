/**
 * Cardano Wallet Integration Utilities
 * 
 * Provides utility functions for wallet interactions using Mesh SDK
 * @module lib/cardano/wallet
 */

// ============================================================================
// ADDRESS UTILITIES
// ============================================================================

/**
 * Format address for display (truncated)
 */
export function formatAddress(address: string, length = 12): string {
    if (!address) return '';
    if (address.length <= length) return address;
    const start = address.slice(0, length / 2);
    const end = address.slice(-length / 2);
    return `${start}...${end}`;
}

/**
 * Check if address is valid Cardano address
 */
export function isValidCardanoAddress(address: string): boolean {
    if (!address) return false;
    
    // Shelley mainnet
    if (address.startsWith('addr1')) {
        return address.length >= 50 && address.length <= 120;
    }
    
    // Shelley testnet
    if (address.startsWith('addr_test1')) {
        return address.length >= 50 && address.length <= 120;
    }
    
    // Byron addresses
    if (address.startsWith('DdzFF') || address.startsWith('Ae2')) {
        return address.length >= 50;
    }
    
    return false;
}

/**
 * Get network from address
 */
export function getNetworkFromAddress(address: string): 'mainnet' | 'testnet' | null {
    if (address.startsWith('addr1')) return 'mainnet';
    if (address.startsWith('addr_test1')) return 'testnet';
    if (address.startsWith('DdzFF')) return 'mainnet'; // Byron mainnet
    if (address.startsWith('Ae2')) return 'testnet'; // Byron testnet
    return null;
}

// ============================================================================
// VALUE CONVERSIONS
// ============================================================================

/**
 * Convert lovelace to ADA for display
 */
export function lovelaceToAda(lovelace: string | number | bigint): number {
    return Number(lovelace) / 1_000_000;
}

/**
 * Convert ADA to lovelace
 */
export function adaToLovelace(ada: number): string {
    return Math.floor(ada * 1_000_000).toString();
}

/**
 * Format ADA amount for display
 */
export function formatAda(lovelace: string | number | bigint, decimals: number = 6): string {
    const ada = lovelaceToAda(lovelace);
    return `${ada.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    })} ₳`;
}

/**
 * Format ADA with symbol (compact)
 */
export function formatAdaCompact(lovelace: string | number | bigint): string {
    const ada = lovelaceToAda(lovelace);
    
    if (ada >= 1_000_000) {
        return `${(ada / 1_000_000).toFixed(2)}M ₳`;
    }
    if (ada >= 1_000) {
        return `${(ada / 1_000).toFixed(2)}K ₳`;
    }
    return `${ada.toFixed(2)} ₳`;
}

// ============================================================================
// WALLET INTERACTIONS
// ============================================================================

/**
 * Get wallet balance in ADA
 */
export async function getWalletBalance(wallet: any): Promise<{
    lovelace: bigint;
    ada: number;
    formatted: string;
}> {
    try {
        const balance = await wallet.getBalance();
        const lovelaceAmount = BigInt(balance);
        const adaAmount = Number(lovelaceAmount) / 1_000_000;
        
        return {
            lovelace: lovelaceAmount,
            ada: adaAmount,
            formatted: formatAda(lovelaceAmount),
        };
    } catch (error) {
        return {
            lovelace: BigInt(0),
            ada: 0,
            formatted: '0 ₳',
        };
    }
}

/**
 * Get all used addresses from wallet
 */
export async function getWalletAddresses(wallet: any): Promise<string[]> {
    try {
        return await wallet.getUsedAddresses();
    } catch (error) {
        return [];
    }
}

/**
 * Get change address from wallet
 */
export async function getChangeAddress(wallet: any): Promise<string | null> {
    try {
        return await wallet.getChangeAddress();
    } catch (error) {
        return null;
    }
}

/**
 * Get reward address (staking) from wallet
 */
export async function getRewardAddress(wallet: any): Promise<string | null> {
    try {
        const addresses = await wallet.getRewardAddresses();
        return addresses?.[0] || null;
    } catch (error) {
        return null;
    }
}

// ============================================================================
// TRANSACTION SIGNING
// ============================================================================

/**
 * Sign a transaction with the wallet
 * @param wallet - Wallet instance from useWallet() hook
 * @param txCbor - Unsigned transaction CBOR (hex string)
 * @param partialSign - Allow partial signing (for multi-sig)
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
        // Handle user rejection
        if (error.code === 2 || error.message?.includes('rejected')) {
            throw new Error('Transaction was rejected by user');
        }
        throw new Error(`Transaction signing failed: ${error.message || error}`);
    }
}

/**
 * Submit a signed transaction through the wallet
 * @param wallet - Wallet instance from useWallet() hook
 * @param signedTxCbor - Signed transaction CBOR (hex string)
 */
export async function submitTransaction(
    wallet: any, 
    signedTxCbor: string
): Promise<string> {
    try {
        const txHash = await wallet.submitTx(signedTxCbor);
        return txHash;
    } catch (error: any) {
        throw new Error(`Transaction submission failed: ${error.message || error}`);
    }
}

/**
 * Sign and submit transaction in one call
 */
export async function signAndSubmitTransaction(
    wallet: any,
    txCbor: string,
    partialSign: boolean = false
): Promise<string> {
    const signedTx = await signTransaction(wallet, txCbor, partialSign);
    return submitTransaction(wallet, signedTx);
}

// ============================================================================
// UTXO UTILITIES
// ============================================================================

/**
 * Get UTxOs from wallet
 */
export async function getWalletUtxos(wallet: any): Promise<any[]> {
    try {
        const utxos = await wallet.getUtxos();
        return utxos || [];
    } catch (error) {
        return [];
    }
}

/**
 * Get collateral UTxOs (for Plutus scripts)
 */
export async function getCollateral(wallet: any): Promise<any[]> {
    try {
        const collateral = await wallet.getCollateral();
        return collateral || [];
    } catch (error) {
        return [];
    }
}

/**
 * Check if wallet has sufficient balance
 */
export async function hasSufficientBalance(
    wallet: any, 
    requiredLovelace: bigint
): Promise<boolean> {
    const { lovelace } = await getWalletBalance(wallet);
    return lovelace >= requiredLovelace;
}

// ============================================================================
// DATA SIGNING (CIP-8)
// ============================================================================

/**
 * Sign arbitrary data with wallet (for authentication, etc.)
 */
export async function signData(
    wallet: any,
    address: string,
    payload: string
): Promise<{ signature: string; key: string }> {
    try {
        const result = await wallet.signData(address, payload);
        return result;
    } catch (error: any) {
        if (error.code === 2 || error.message?.includes('rejected')) {
            throw new Error('Data signing was rejected by user');
        }
        throw new Error(`Data signing failed: ${error.message || error}`);
    }
}

// ============================================================================
// NETWORK UTILITIES
// ============================================================================

/**
 * Get current network ID from wallet
 */
export async function getNetworkId(wallet: any): Promise<number> {
    try {
        return await wallet.getNetworkId();
    } catch (error) {
        return 0; // Testnet by default
    }
}

/**
 * Check if wallet is on testnet
 */
export async function isTestnet(wallet: any): Promise<boolean> {
    const networkId = await getNetworkId(wallet);
    return networkId === 0;
}

/**
 * Check if wallet is on mainnet
 */
export async function isMainnet(wallet: any): Promise<boolean> {
    const networkId = await getNetworkId(wallet);
    return networkId === 1;
}

// ============================================================================
// WALLET INFO
// ============================================================================

export interface WalletInfo {
    name: string;
    icon: string;
    version: string;
    isEnabled: boolean;
}

/**
 * Get installed wallet extensions
 */
export function getInstalledWallets(): WalletInfo[] {
    if (typeof window === 'undefined') return [];
    
    const cardano = (window as any).cardano;
    if (!cardano) return [];
    
    const walletKeys = Object.keys(cardano).filter(key => {
        const wallet = cardano[key];
        return wallet && typeof wallet.enable === 'function';
    });
    
    return walletKeys.map(key => ({
        name: key,
        icon: cardano[key].icon || '',
        version: cardano[key].apiVersion || '0.0.0',
        isEnabled: false,
    }));
}

// ============================================================================
// TIME UTILITIES
// ============================================================================

/**
 * Convert POSIX time to slot (Cardano time)
 */
export function posixTimeToSlot(posixTimeMs: number, network: 'mainnet' | 'preprod' = 'preprod'): number {
    const config = network === 'mainnet'
        ? { zeroTime: 1596059091000, slotLength: 1000 }
        : { zeroTime: 1654041600000, slotLength: 1000 };
    
    return Math.floor((posixTimeMs - config.zeroTime) / config.slotLength);
}

/**
 * Convert slot to POSIX time
 */
export function slotToPosixTime(slot: number, network: 'mainnet' | 'preprod' = 'preprod'): number {
    const config = network === 'mainnet'
        ? { zeroTime: 1596059091000, slotLength: 1000 }
        : { zeroTime: 1654041600000, slotLength: 1000 };
    
    return config.zeroTime + (slot * config.slotLength);
}

// ============================================================================
// ERROR HELPERS
// ============================================================================

/**
 * Check if error is user rejection
 */
export function isUserRejection(error: any): boolean {
    return error?.code === 2 || 
           error?.message?.includes('rejected') ||
           error?.message?.includes('cancelled') ||
           error?.message?.includes('User declined');
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
    if (isUserRejection(error)) {
        return 'Transaction was cancelled';
    }
    
    if (error?.message?.includes('insufficient')) {
        return 'Insufficient funds for this transaction';
    }
    
    if (error?.message?.includes('network')) {
        return 'Network error. Please check your connection';
    }
    
    return error?.message || 'An unknown error occurred';
}
