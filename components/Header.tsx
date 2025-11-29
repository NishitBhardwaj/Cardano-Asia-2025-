'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';

interface HeaderProps {
    showNav?: boolean;
    variant?: 'default' | 'minimal';
}

function HeaderContent({ showNav = true, variant = 'default' }: HeaderProps) {
    const router = useRouter();
    const {
        isConnected,
        isAuthenticated,
        isLoading,
        profile,
        balance,
        availableWallets,
        connectWallet,
        disconnectWallet,
        formatWalletAddress,
    } = useAuth();

    const [showWalletMenu, setShowWalletMenu] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const handleConnect = async (walletName: string) => {
        setConnectionError(null);
        try {
            await connectWallet(walletName);
            setShowWalletMenu(false);
        } catch (error: any) {
            console.error('Failed to connect:', error);
            const errorMessage = error?.message || 'Failed to connect wallet';
            setConnectionError(errorMessage);
            
            // Auto-clear error after 5 seconds
            setTimeout(() => setConnectionError(null), 5000);
        }
    };

    const handleDisconnect = () => {
        disconnectWallet();
        setShowProfileMenu(false);
        router.push('/');
    };

    return (
        <header className="border-b border-border glass sticky top-0 z-50">
            <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">₳</span>
                    </div>
                    <h1 className="text-2xl font-bold">DonateDAO</h1>
                </Link>

                {/* Navigation */}
                {showNav && variant === 'default' && (
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/campaigns" className="hover:text-primary transition-colors">
                            Campaigns
                        </Link>
                        <Link href="/governance" className="hover:text-primary transition-colors">
                            Governance
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link href="/my-campaigns" className="hover:text-primary transition-colors">
                                    My Campaigns
                                </Link>
                                <Link href="/dashboard" className="hover:text-primary transition-colors">
                                    Dashboard
                                </Link>
                                <Link href="/create" className="hover:text-primary transition-colors font-semibold text-accent">
                                    + Create
                                </Link>
                            </>
                        )}
                    </div>
                )}

                {/* Auth Section */}
                <div className="flex items-center gap-4">
                    {isAuthenticated && profile ? (
                        // Authenticated User Menu
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-3 glass px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <span className="text-xl">{profile.avatar}</span>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium">{profile.displayName}</p>
                                    <p className="text-xs text-foreground/60">{balance.toFixed(2)} ₳</p>
                                </div>
                                <svg
                                    className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Profile Dropdown */}
                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-56 glass rounded-xl overflow-hidden shadow-xl">
                                    <div className="p-4 border-b border-border">
                                        <p className="font-medium">{profile.displayName}</p>
                                        <p className="text-sm text-foreground/60 font-mono">
                                            {formatWalletAddress(12)}
                                        </p>
                                    </div>
                                    
                                    <div className="py-2">
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <span>👤</span>
                                            <span>My Profile</span>
                                        </Link>
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <span>📊</span>
                                            <span>Dashboard</span>
                                        </Link>
                                        <Link
                                            href="/my-campaigns"
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <span>🎯</span>
                                            <span>My Campaigns</span>
                                        </Link>
                                        <Link
                                            href="/profile?tab=transactions"
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <span>📜</span>
                                            <span>Transaction History</span>
                                        </Link>
                                        <Link
                                            href="/create"
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <span>➕</span>
                                            <span>Create Campaign</span>
                                        </Link>
                                    </div>

                                    <div className="border-t border-border py-2">
                                        <Link
                                            href="/profile?tab=settings"
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <span>⚙️</span>
                                            <span>Settings</span>
                                        </Link>
                                        <button
                                            onClick={handleDisconnect}
                                            className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-white/10 transition-colors text-red-400"
                                        >
                                            <span>🚪</span>
                                            <span>Disconnect</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : isConnected ? (
                        // Connected but not fully authenticated
                        <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm">{formatWalletAddress()}</span>
                        </div>
                    ) : (
                        // Not connected - Show login buttons
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                                    disabled={isLoading}
                                    className="gradient-primary px-6 py-2.5 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Connecting...
                                        </span>
                                    ) : (
                                        'Connect Wallet'
                                    )}
                                </button>

                                {/* Connection Error Message */}
                                {connectionError && (
                                    <div className="absolute right-0 mt-2 w-72 bg-red-500/10 border border-red-500/30 rounded-xl p-4 shadow-xl">
                                        <div className="flex items-start gap-2">
                                            <span className="text-red-400">⚠️</span>
                                            <div>
                                                <p className="text-sm text-red-400 font-medium">Connection Failed</p>
                                                <p className="text-xs text-red-300/80 mt-1">{connectionError}</p>
                                                <button
                                                    onClick={() => setConnectionError(null)}
                                                    className="text-xs text-red-400 hover:underline mt-2"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Wallet Selection Dropdown */}
                                {showWalletMenu && availableWallets.length > 0 && !connectionError && (
                                    <div className="absolute right-0 mt-2 w-64 glass rounded-xl overflow-hidden shadow-xl">
                                        <div className="p-3 border-b border-border">
                                            <p className="text-sm font-medium">Select Wallet</p>
                                            <p className="text-xs text-foreground/50 mt-1">Make sure your wallet is unlocked</p>
                                        </div>
                                        <div className="py-2">
                                            {availableWallets.map((wallet) => (
                                                <button
                                                    key={wallet.name}
                                                    onClick={() => handleConnect(wallet.name)}
                                                    disabled={isLoading}
                                                    className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/10 transition-colors disabled:opacity-50"
                                                >
                                                    <img
                                                        src={wallet.icon}
                                                        alt={wallet.name}
                                                        className="w-8 h-8 rounded-lg"
                                                    />
                                                    <div className="text-left">
                                                        <p className="font-medium capitalize">{wallet.name}</p>
                                                        <p className="text-xs text-foreground/50">v{wallet.version}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {showWalletMenu && availableWallets.length === 0 && !connectionError && (
                                    <div className="absolute right-0 mt-2 w-64 glass rounded-xl p-4 shadow-xl">
                                        <p className="text-sm text-foreground/70 mb-3">
                                            No wallet found. Install one to continue:
                                        </p>
                                        <div className="space-y-2">
                                            <a
                                                href="https://namiwallet.io"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-sm text-primary hover:underline"
                                            >
                                                → Nami Wallet
                                            </a>
                                            <a
                                                href="https://eternl.io"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-sm text-primary hover:underline"
                                            >
                                                → Eternl Wallet
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/auth"
                                className="hidden sm:block glass px-4 py-2.5 rounded-lg font-medium hover:bg-white/10 transition-colors"
                            >
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Click outside to close menus */}
            {(showWalletMenu || showProfileMenu) && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => {
                        setShowWalletMenu(false);
                        setShowProfileMenu(false);
                    }}
                />
            )}
        </header>
    );
}

export default function Header(props: HeaderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Show loading header until mounted
    if (!mounted) {
        return (
            <header className="border-b border-border glass sticky top-0 z-50">
                <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">₳</span>
                        </div>
                        <h1 className="text-2xl font-bold">DonateDAO</h1>
                    </Link>
                    <div className="glass px-6 py-3 rounded-lg animate-pulse">
                        <span className="text-sm">Loading...</span>
                    </div>
                </nav>
            </header>
        );
    }

    return (
        <MeshProvider>
            <HeaderContent {...props} />
        </MeshProvider>
    );
}

