'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import ThemeToggle from './ThemeToggle';

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

    const [showMobileMenu, setShowMobileMenu] = useState(false);

    return (
        <header className="border-b border-white/5 glass sticky top-0 z-50 backdrop-blur-xl">
            <nav className="container mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 gradient-primary-animated rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                        <span className="text-white font-bold text-lg sm:text-xl">₳</span>
                    </div>
                    <div className="hidden xs:block">
                        <h1 className="text-lg sm:text-2xl font-bold group-hover:text-gradient transition-all">DonateDAO</h1>
                        <p className="text-[8px] sm:text-[10px] text-foreground/40 -mt-1 hidden sm:block">Cardano Donations</p>
                    </div>
                </Link>

                {/* Mobile Menu Button */}
                {showNav && variant === 'default' && (
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="md:hidden p-2 rounded-lg hover:bg-white/5"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {showMobileMenu ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                )}

                {/* Desktop Navigation */}
                {showNav && variant === 'default' && (
                    <div className="hidden md:flex items-center gap-1 lg:gap-2">
                        <Link href="/campaigns" className="px-3 lg:px-4 py-2 rounded-lg hover:bg-white/5 hover:text-primary transition-all text-sm lg:text-base font-medium">
                            Campaigns
                        </Link>
                        {!isAuthenticated && (
                            <Link 
                                href="/campaigns" 
                                className="btn-primary px-3 lg:px-4 py-2 text-xs lg:text-sm"
                            >
                                💝 Donate
                            </Link>
                        )}
                        <Link href="/governance" className="px-3 lg:px-4 py-2 rounded-lg hover:bg-white/5 hover:text-primary transition-all text-sm lg:text-base font-medium">
                            Governance
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link href="/my-campaigns" className="px-3 lg:px-4 py-2 rounded-lg hover:bg-white/5 hover:text-primary transition-all text-sm lg:text-base font-medium">
                                    My Campaigns
                                </Link>
                                <Link href="/dashboard" className="px-3 lg:px-4 py-2 rounded-lg hover:bg-white/5 hover:text-primary transition-all text-sm lg:text-base font-medium">
                                    Dashboard
                                </Link>
                                <Link href="/create" className="ml-1 lg:ml-2 btn-primary px-3 lg:px-4 py-2 text-xs lg:text-sm flex items-center gap-1">
                                    <span>+</span> Create
                                </Link>
                            </>
                        )}
                    </div>
                )}

                {/* Auth Section */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Theme Toggle */}
                    <ThemeToggle />
                    
                    {isAuthenticated && profile ? (
                        // Authenticated User Menu
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-3 glass-hover px-3 py-2 rounded-xl"
                            >
                                <div className="relative">
                                    <span className="text-2xl">{profile.avatar}</span>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent border-2 border-background" />
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-semibold">{profile.displayName}</p>
                                    <p className="text-xs text-primary font-medium">{balance.toFixed(2)} ₳</p>
                                </div>
                                <svg
                                    className={`w-4 h-4 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Profile Dropdown */}
                            {showProfileMenu && (
                                <div className="absolute right-0 mt-3 w-64 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-scale-in">
                                    <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{profile.avatar}</span>
                                            <div>
                                                <p className="font-bold">{profile.displayName}</p>
                                                <p className="text-xs text-foreground/50 font-mono">
                                                    {formatWalletAddress(12)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="badge badge-primary text-xs">{balance.toFixed(2)} ₳</span>
                                            <span className="badge badge-accent text-xs">Verified</span>
                                        </div>
                                    </div>
                                    
                                    <div className="py-2">
                                        {[
                                            { href: '/profile', icon: '👤', label: 'My Profile', color: 'primary' },
                                            { href: '/dashboard', icon: '📊', label: 'Dashboard', color: 'secondary' },
                                            { href: '/my-campaigns', icon: '🎯', label: 'My Campaigns', color: 'accent' },
                                            { href: '/profile?tab=transactions', icon: '📜', label: 'Transactions', color: 'primary' },
                                            { href: '/create', icon: '✨', label: 'Create Campaign', color: 'accent', highlight: true },
                                        ].map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-all group ${item.highlight ? 'bg-accent/10' : ''}`}
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                                                <span className={`font-medium ${item.highlight ? 'text-accent' : ''}`}>{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="border-t border-white/5 py-2">
                                        <Link
                                            href="/profile?tab=settings"
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-all group"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <span className="text-lg group-hover:animate-spin-slow">⚙️</span>
                                            <span className="font-medium">Settings</span>
                                        </Link>
                                        <button
                                            onClick={handleDisconnect}
                                            className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-red-500/10 transition-all text-red-400 group"
                                        >
                                            <span className="text-lg group-hover:translate-x-1 transition-transform">🚪</span>
                                            <span className="font-medium">Disconnect</span>
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
                                    className="btn-primary px-5 py-2.5 flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                            Connect Wallet
                                        </>
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
                                    <div className="absolute right-0 mt-3 w-72 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-scale-in">
                                        <div className="p-4 bg-gradient-to-br from-primary/10 to-transparent border-b border-white/5">
                                            <p className="font-bold">Select Your Wallet</p>
                                            <p className="text-xs text-foreground/50 mt-1">Make sure your wallet is unlocked</p>
                                        </div>
                                        <div className="py-2">
                                            {availableWallets.map((wallet) => (
                                                <button
                                                    key={wallet.name}
                                                    onClick={() => handleConnect(wallet.name)}
                                                    disabled={isLoading}
                                                    className="flex items-center gap-4 px-4 py-3 w-full hover:bg-white/5 transition-all disabled:opacity-50 group"
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                                                        <img
                                                            src={wallet.icon}
                                                            alt={wallet.name}
                                                            className="w-8 h-8"
                                                        />
                                                    </div>
                                                    <div className="text-left flex-1">
                                                        <p className="font-semibold capitalize">{wallet.name}</p>
                                                        <p className="text-xs text-foreground/50">v{wallet.version}</p>
                                                    </div>
                                                    <svg className="w-5 h-5 text-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {showWalletMenu && availableWallets.length === 0 && !connectionError && (
                                    <div className="absolute right-0 mt-3 w-72 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-scale-in">
                                        <div className="p-4 bg-gradient-to-br from-warning/10 to-transparent border-b border-white/5">
                                            <p className="font-bold flex items-center gap-2">
                                                <span>⚠️</span> No Wallet Found
                                            </p>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <p className="text-sm text-foreground/60">
                                                Install a Cardano wallet to continue:
                                            </p>
                                            {[
                                                { name: 'Nami', url: 'https://namiwallet.io', desc: 'Simple & Fast' },
                                                { name: 'Eternl', url: 'https://eternl.io', desc: 'Advanced Features' },
                                            ].map((w) => (
                                                <a
                                                    key={w.name}
                                                    href={w.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                                                >
                                                    <div>
                                                        <p className="font-semibold">{w.name}</p>
                                                        <p className="text-xs text-foreground/50">{w.desc}</p>
                                                    </div>
                                                    <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/auth"
                                className="hidden sm:flex items-center gap-2 glass-hover px-4 py-2.5 rounded-xl font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile Navigation Menu */}
            {showNav && variant === 'default' && showMobileMenu && (
                <div className="md:hidden glass border-t border-white/5 animate-slide-down">
                    <div className="container mx-auto px-4 py-4 space-y-2">
                        <Link 
                            href="/campaigns" 
                            className="block px-4 py-3 rounded-lg hover:bg-white/5 font-medium"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            📋 Campaigns
                        </Link>
                        <Link 
                            href="/governance" 
                            className="block px-4 py-3 rounded-lg hover:bg-white/5 font-medium"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            🗳️ Governance
                        </Link>
                        {isAuthenticated ? (
                            <>
                                <Link 
                                    href="/my-campaigns" 
                                    className="block px-4 py-3 rounded-lg hover:bg-white/5 font-medium"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    🎯 My Campaigns
                                </Link>
                                <Link 
                                    href="/dashboard" 
                                    className="block px-4 py-3 rounded-lg hover:bg-white/5 font-medium"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    📊 Dashboard
                                </Link>
                                <Link 
                                    href="/create" 
                                    className="block px-4 py-3 rounded-lg bg-primary text-white font-medium text-center mt-2"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    ✨ Create Campaign
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link 
                                    href="/campaigns" 
                                    className="block px-4 py-3 rounded-lg bg-primary text-white font-medium text-center"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    💝 Donate Now
                                </Link>
                                <Link 
                                    href="/auth" 
                                    className="block px-4 py-3 rounded-lg glass text-center font-medium"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Click outside to close menus */}
            {(showWalletMenu || showProfileMenu || showMobileMenu) && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => {
                        setShowWalletMenu(false);
                        setShowProfileMenu(false);
                        setShowMobileMenu(false);
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

