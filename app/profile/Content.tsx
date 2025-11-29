'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useUserStore } from '@/lib/store/userStore';
import Header from '@/components/Header';

function ProfilePageInner() {
    const router = useRouter();
    const { isAuthenticated, profile, walletAddress, balance, disconnectWallet } = useAuth();
    const { stats, transactions, campaigns, supportedCampaigns, _hasHydrated } = useUserStore();
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'campaigns' | 'settings'>('overview');

    // Redirect if not authenticated (only after hydration completes)
    useEffect(() => {
        // Wait for store to hydrate before checking auth
        if (_hasHydrated && !isAuthenticated) {
            router.push('/auth');
        }
    }, [isAuthenticated, _hasHydrated, router]);

    // Show loading while hydrating or authenticating
    if (!_hasHydrated || (!isAuthenticated && !profile)) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-foreground/60">Loading profile...</p>
                </div>
            </div>
        );
    }

    // If hydrated but not authenticated, show brief loading (redirect will happen)
    if (!isAuthenticated || !profile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-foreground/60">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-6 py-12">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                    <div className="text-8xl">{profile.avatar}</div>
                    <div className="flex-1">
                        <h1 className="text-5xl font-bold mb-2">{profile.displayName}</h1>
                        <p className="text-foreground/60 font-mono text-sm mb-4">
                            {walletAddress?.slice(0, 20)}...{walletAddress?.slice(-10)}
                        </p>
                        <div className="flex gap-4">
                            <div className="glass px-4 py-2 rounded-lg">
                                <span className="text-foreground/60 text-sm">Balance</span>
                                <p className="text-xl font-bold text-primary">{balance.toFixed(2)} ₳</p>
                            </div>
                            <div className="glass px-4 py-2 rounded-lg">
                                <span className="text-foreground/60 text-sm">Rank</span>
                                <p className="text-xl font-bold text-secondary">#{stats.rank}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-border">
                    {(['overview', 'transactions', 'campaigns', 'settings'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-medium transition-colors border-b-2 -mb-[2px] ${
                                activeTab === tab
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-foreground/60 hover:text-foreground'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass p-6 rounded-xl">
                            <p className="text-foreground/60 text-sm mb-2">Total Donated</p>
                            <p className="text-3xl font-bold text-primary">{(stats.totalDonated / 1_000_000).toFixed(0)} ₳</p>
                        </div>
                        <div className="glass p-6 rounded-xl">
                            <p className="text-foreground/60 text-sm mb-2">Campaigns Supported</p>
                            <p className="text-3xl font-bold text-secondary">{stats.campaignsSupported}</p>
                        </div>
                        <div className="glass p-6 rounded-xl">
                            <p className="text-foreground/60 text-sm mb-2">Votes Cast</p>
                            <p className="text-3xl font-bold text-accent">{stats.votesCount}</p>
                        </div>
                        <div className="glass p-6 rounded-xl">
                            <p className="text-foreground/60 text-sm mb-2">Donation Streak</p>
                            <p className="text-3xl font-bold">{stats.donationStreak} 🔥</p>
                        </div>
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div className="glass p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-6">Transaction History</h3>
                        {transactions.length > 0 ? (
                            <div className="space-y-4">
                                {transactions.slice(0, 10).map((tx, i) => (
                                    <div key={i} className="flex justify-between items-center py-4 border-b border-border last:border-0">
                                        <div>
                                            <p className="font-medium">{tx.type}</p>
                                            <p className="text-sm text-foreground/60">{new Date(tx.timestamp).toLocaleDateString()}</p>
                                        </div>
                                        <p className="font-bold">{(tx.amount / 1_000_000).toFixed(2)} ₳</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-foreground/60 py-8">No transactions yet</p>
                        )}
                    </div>
                )}

                {/* Campaigns Tab */}
                {activeTab === 'campaigns' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass p-6 rounded-xl">
                            <h3 className="text-xl font-bold mb-4">My Campaigns ({campaigns.length})</h3>
                            {campaigns.length > 0 ? (
                                <div className="space-y-4">
                                    {campaigns.map((c, i) => (
                                        <Link key={i} href={`/campaigns/${c.id}`} className="block p-4 bg-white/5 rounded-lg hover:bg-white/10">
                                            <p className="font-medium">{c.title}</p>
                                            <p className="text-sm text-foreground/60">{(c.raised / 1_000_000).toFixed(0)} / {(c.goal / 1_000_000).toFixed(0)} ₳</p>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-foreground/60 mb-4">No campaigns created yet</p>
                                    <Link href="/create" className="text-primary hover:underline">Create your first campaign →</Link>
                                </div>
                            )}
                        </div>
                        <div className="glass p-6 rounded-xl">
                            <h3 className="text-xl font-bold mb-4">Supported Campaigns ({supportedCampaigns.length})</h3>
                            {supportedCampaigns.length > 0 ? (
                                <div className="space-y-4">
                                    {supportedCampaigns.map((c, i) => (
                                        <Link key={i} href={`/campaigns/${c.id}`} className="block p-4 bg-white/5 rounded-lg hover:bg-white/10">
                                            <p className="font-medium">{c.title}</p>
                                            <p className="text-sm text-foreground/60">Donated: {((c.myDonation || 0) / 1_000_000).toFixed(2)} ₳</p>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-foreground/60 mb-4">No campaigns supported yet</p>
                                    <Link href="/campaigns" className="text-primary hover:underline">Explore campaigns →</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="glass p-6 rounded-xl max-w-xl">
                        <h3 className="text-xl font-bold mb-6">Settings</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm text-foreground/60 mb-2">Display Name</label>
                                <p className="glass px-4 py-3 rounded-lg">{profile.displayName}</p>
                            </div>
                            <div>
                                <label className="block text-sm text-foreground/60 mb-2">Wallet Address</label>
                                <p className="glass px-4 py-3 rounded-lg font-mono text-sm break-all">{walletAddress}</p>
                            </div>
                            <button
                                onClick={disconnectWallet}
                                className="w-full bg-red-500/20 border border-red-500/50 text-red-500 px-6 py-3 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
                            >
                                Disconnect Wallet
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Content() {
    return (
        <MeshProvider>
            <ProfilePageInner />
        </MeshProvider>
    );
}

