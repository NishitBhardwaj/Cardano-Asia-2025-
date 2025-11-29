'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useUserStore } from '@/lib/store/userStore';

function AuthPageInner() {
    const router = useRouter();
    const {
        isConnected,
        isAuthenticated,
        isLoading,
        availableWallets,
        walletAddress,
        profile,
        balance,
        connectWallet,
        formatWalletAddress,
    } = useAuth();
    const { _hasHydrated } = useUserStore();

    const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(3);
    const [justConnected, setJustConnected] = useState(false);

    // Redirect to profile if already authenticated (only after just connecting or hydration)
    useEffect(() => {
        // Only redirect if:
        // 1. User just connected their wallet, OR
        // 2. Store has hydrated and user is already authenticated
        const shouldRedirect = isAuthenticated && profile && (justConnected || _hasHydrated);
        
        if (shouldRedirect) {
            setShowWelcome(true);
            
            // Start countdown
            const countdownInterval = setInterval(() => {
                setRedirectCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Redirect after countdown
            const redirectTimer = setTimeout(() => {
                window.location.href = '/profile';
            }, 2500);

            return () => {
                clearInterval(countdownInterval);
                clearTimeout(redirectTimer);
            };
        }
    }, [isAuthenticated, profile, justConnected, _hasHydrated]);

    const handleConnect = async (walletName: string) => {
        setSelectedWallet(walletName);
        setError(null);
        
        try {
            await connectWallet(walletName);
            setJustConnected(true); // Mark that we just connected
        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet');
            setSelectedWallet(null);
        }
    };

    // Manual redirect function - use window.location for reliability
    const handleManualRedirect = () => {
        window.location.href = '/profile';
    };

    // Show welcome screen after successful login
    if (showWelcome && profile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-6 animate-fade-in">
                    <div className="text-8xl mb-4">{profile.avatar}</div>
                    <h1 className="text-4xl font-bold">Welcome back!</h1>
                    <p className="text-xl text-foreground/70">{profile.displayName}</p>
                    <p className="text-foreground/50">
                        {redirectCountdown > 0 
                            ? `Redirecting in ${redirectCountdown}...` 
                            : 'Redirecting...'}
                    </p>
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    
                    {/* Fallback button if auto-redirect fails */}
                    <button
                        onClick={handleManualRedirect}
                        className="mt-4 px-6 py-2 text-sm text-primary hover:underline"
                    >
                        Click here if not redirected →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative border-b border-border glass">
                <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">₳</span>
                        </div>
                        <h1 className="text-2xl font-bold">DonateDAO</h1>
                    </Link>
                </nav>
            </header>

            {/* Main Content */}
            <div className="relative container mx-auto px-6 py-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
                <div className="w-full max-w-md">
                    <div className="glass p-8 rounded-2xl space-y-8">
                        {/* Title */}
                        <div className="text-center">
                            <h2 className="text-3xl font-bold mb-2">Connect Your Wallet</h2>
                            <p className="text-foreground/70">
                                Sign in securely using your Cardano wallet
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
                            <div className="text-center">
                                <div className="text-2xl mb-1">🔐</div>
                                <p className="text-xs text-foreground/60">Secure</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl mb-1">⚡</div>
                                <p className="text-xs text-foreground/60">Instant</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl mb-1">🌐</div>
                                <p className="text-xs text-foreground/60">Decentralized</p>
                            </div>
                        </div>

                        {/* Wallet Options */}
                        <div className="space-y-3">
                            {availableWallets.length > 0 ? (
                                availableWallets.map((wallet) => (
                                    <button
                                        key={wallet.name}
                                        onClick={() => handleConnect(wallet.name)}
                                        disabled={isLoading}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                            selectedWallet === wallet.name
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:border-primary/50 hover:bg-white/5'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <img
                                            src={wallet.icon}
                                            alt={wallet.name}
                                            className="w-10 h-10 rounded-lg"
                                        />
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold capitalize">{wallet.name}</p>
                                            <p className="text-xs text-foreground/50">
                                                v{wallet.version}
                                            </p>
                                        </div>
                                        {selectedWallet === wallet.name && isLoading ? (
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <span className="text-foreground/50">→</span>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">🔌</div>
                                    <p className="font-semibold mb-2">No Wallet Found</p>
                                    <p className="text-sm text-foreground/60 mb-4">
                                        Install a Cardano wallet to continue
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <a
                                            href="https://namiwallet.io"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline text-sm"
                                        >
                                            Get Nami Wallet →
                                        </a>
                                        <a
                                            href="https://eternl.io"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline text-sm"
                                        >
                                            Get Eternl Wallet →
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                                <p className="text-red-500 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Connected State */}
                        {isConnected && walletAddress && !isAuthenticated && (
                            <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                                <p className="text-green-500 font-semibold">Connected!</p>
                                <p className="text-sm text-foreground/70 mt-1">
                                    {formatWalletAddress(16)}
                                </p>
                                <p className="text-sm text-foreground/70">
                                    Balance: {balance.toFixed(2)} ₳
                                </p>
                            </div>
                        )}

                        {/* Info */}
                        <div className="text-center text-xs text-foreground/50 space-y-2">
                            <p>
                                By connecting, you agree to our{' '}
                                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                            </p>
                            <p>Your wallet address serves as your unique identifier</p>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 text-center">
                        <p className="text-foreground/60 text-sm">
                            New to Cardano?{' '}
                            <a 
                                href="https://cardano.org" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                Learn more →
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthContent() {
    return (
        <MeshProvider>
            <AuthPageInner />
        </MeshProvider>
    );
}

