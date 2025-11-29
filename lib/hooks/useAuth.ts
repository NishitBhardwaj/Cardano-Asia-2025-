/**
 * Authentication Hook
 * 
 * Connects wallet authentication with user store
 * Provides unified auth interface for components
 * 
 * @module lib/hooks/useAuth
 */

'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useUserStore, type UserProfile } from '@/lib/store/userStore';
import { formatAddress } from '@/lib/cardano/wallet';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthState {
    // Connection State
    isConnected: boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
    
    // User Data
    walletAddress: string | null;
    profile: UserProfile | null;
    
    // Wallet Info
    walletName: string | null;
    walletIcon: string | null;
    balance: number; // in ADA
    
    // Available Wallets
    availableWallets: WalletInfo[];
}

export interface WalletInfo {
    name: string;
    icon: string;
    version: string;
}

export interface UseAuthReturn extends AuthState {
    // Actions
    connectWallet: (walletName: string) => Promise<void>;
    disconnectWallet: () => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    
    // Utilities
    formatWalletAddress: (length?: number) => string;
    refreshBalance: () => Promise<void>;
}

// Default state for SSR
const defaultAuthState: UseAuthReturn = {
    isConnected: false,
    isAuthenticated: false,
    isLoading: false,
    walletAddress: null,
    profile: null,
    walletName: null,
    walletIcon: null,
    balance: 0,
    availableWallets: [],
    connectWallet: async () => {},
    disconnectWallet: () => {},
    updateProfile: () => {},
    formatWalletAddress: () => '',
    refreshBalance: async () => {},
};

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useAuth(): UseAuthReturn {
    const [mounted, setMounted] = useState(false);
    const [meshLoaded, setMeshLoaded] = useState(false);
    const meshRef = useRef<{
        useWallet: any;
        BrowserWallet: any;
    } | null>(null);
    
    const {
        isAuthenticated,
        isLoading: storeLoading,
        profile,
        login,
        logout,
        updateProfile: storeUpdateProfile,
    } = useUserStore();

    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [walletName, setWalletName] = useState<string | null>(null);
    const [walletIcon, setWalletIcon] = useState<string | null>(null);
    const [balance, setBalance] = useState<number>(0);
    const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [walletState, setWalletState] = useState<{
        connected: boolean;
        wallet: any;
        connect: (name: string) => Promise<void>;
        disconnect: () => void;
    } | null>(null);

    // Load Mesh SDK on mount
    useEffect(() => {
        setMounted(true);
        
        // Only load Mesh SDK on client side
        if (typeof window !== 'undefined') {
            Promise.all([
                import('@meshsdk/react'),
                import('@meshsdk/core'),
            ]).then(([meshReact, meshCore]) => {
                meshRef.current = {
                    useWallet: meshReact.useWallet,
                    BrowserWallet: meshCore.BrowserWallet,
                };
                setMeshLoaded(true);
            }).catch(err => {
                console.error('Failed to load Mesh SDK:', err);
            });
        }
    }, []);

    // Get available wallets once Mesh is loaded
    useEffect(() => {
        if (meshLoaded && meshRef.current) {
            try {
                const wallets = meshRef.current.BrowserWallet.getInstalledWallets();
                setAvailableWallets(
                    wallets.map((w: any) => ({
                        name: w.name,
                        icon: w.icon,
                        version: w.version || '1.0.0',
                    }))
                );
            } catch (err) {
                console.error('Failed to get wallets:', err);
            }
        }
    }, [meshLoaded]);

    // Helper function to delay execution
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Connect wallet with retry logic
    const connectWallet = useCallback(async (name: string) => {
        if (!meshRef.current) {
            throw new Error('Mesh SDK not loaded');
        }

        setIsLoading(true);
        
        const maxRetries = 3;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Enable wallet connection
                const wallet = await meshRef.current.BrowserWallet.enable(name);
                
                // Small delay to let wallet stabilize (fixes "account changed" error)
                await delay(500);
                
                // Get wallet address with retry
                let address: string;
                try {
                    address = await wallet.getChangeAddress();
                } catch (addrError: any) {
                    // If "account changed" error, wait and retry
                    if (addrError?.message?.includes('account changed') || 
                        addrError?.toString()?.includes('account changed')) {
                        console.log(`Wallet state changed, retrying... (attempt ${attempt}/${maxRetries})`);
                        await delay(1000);
                        address = await wallet.getChangeAddress();
                    } else {
                        throw addrError;
                    }
                }
                
                setWalletAddress(address);
                setWalletName(name);
                
                // Get wallet icon
                const walletInfo = availableWallets.find((w) => w.name === name);
                setWalletIcon(walletInfo?.icon || null);
                
                // Get balance (with error handling)
                try {
                    const lovelace = await wallet.getLovelace();
                    setBalance(Number(lovelace) / 1_000_000);
                } catch (balanceError) {
                    console.warn('Could not fetch balance:', balanceError);
                    setBalance(0);
                }
                
                // Update wallet state
                setWalletState({
                    connected: true,
                    wallet,
                    connect: async () => {},
                    disconnect: () => {},
                });

                // Login to user store
                await login(address);
                
                // Success - exit retry loop
                setIsLoading(false);
                return;
                
            } catch (error: any) {
                lastError = error;
                console.warn(`Wallet connection attempt ${attempt}/${maxRetries} failed:`, error?.message || error);
                
                // Check if it's an "account changed" error
                const isAccountChanged = error?.message?.includes('account changed') || 
                                         error?.toString()?.includes('account changed');
                
                if (isAccountChanged && attempt < maxRetries) {
                    // Wait longer before retry for account change errors
                    await delay(1500 * attempt);
                    continue;
                }
                
                // For other errors or final attempt, break out
                if (attempt === maxRetries) {
                    break;
                }
                
                // Wait before retry
                await delay(1000);
            }
        }
        
        // All retries failed
        setIsLoading(false);
        
        // Provide user-friendly error message
        const errorMessage = lastError?.message?.includes('account changed')
            ? 'Wallet account changed during connection. Please try again or refresh the page.'
            : lastError?.message || 'Failed to connect wallet';
        
        throw new Error(errorMessage);
    }, [availableWallets, login]);

    // Disconnect wallet
    const disconnectWallet = useCallback(() => {
        logout();
        setWalletAddress(null);
        setWalletName(null);
        setWalletIcon(null);
        setBalance(0);
        setWalletState(null);
    }, [logout]);

    // Update profile
    const updateProfile = useCallback((updates: Partial<UserProfile>) => {
        storeUpdateProfile(updates);
    }, [storeUpdateProfile]);

    // Format wallet address
    const formatWalletAddress = useCallback((length = 12) => {
        if (!walletAddress) return '';
        return formatAddress(walletAddress, length);
    }, [walletAddress]);

    // Refresh balance
    const refreshBalance = useCallback(async () => {
        if (walletState?.wallet) {
            try {
                const lovelace = await walletState.wallet.getLovelace();
                setBalance(Number(lovelace) / 1_000_000);
            } catch (error) {
                console.error('Error refreshing balance:', error);
            }
        }
    }, [walletState]);

    // Return default state during SSR
    if (!mounted) {
        return defaultAuthState;
    }

    return {
        // Connection State
        isConnected: walletState?.connected || false,
        isAuthenticated,
        isLoading: isLoading || storeLoading,
        
        // User Data
        walletAddress,
        profile,
        
        // Wallet Info
        walletName,
        walletIcon,
        balance,
        
        // Available Wallets
        availableWallets,
        
        // Actions
        connectWallet,
        disconnectWallet,
        updateProfile,
        
        // Utilities
        formatWalletAddress,
        refreshBalance,
    };
}

export default useAuth;
