'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useUserStore } from '@/lib/store/userStore';
import Header from '@/components/Header';
import Link from 'next/link';
import QRModal from '@/components/QRModal';

function DashboardPageInner() {
    const router = useRouter();
    const { isAuthenticated, profile, walletAddress, balance } = useAuth();
    const { stats, transactions, campaigns, supportedCampaigns, _hasHydrated } = useUserStore();
    const [mounted, setMounted] = useState(false);
    const [qrModal, setQrModal] = useState<{ campaignId: string; title: string } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && _hasHydrated && !isAuthenticated) {
            router.push('/auth');
        }
    }, [isAuthenticated, router, mounted, _hasHydrated]);

    if (!mounted || !_hasHydrated || !isAuthenticated || !profile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-foreground/60">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-6 py-12">
                {/* Welcome Header */}
                <div className="flex items-center gap-6 mb-12">
                    <div className="text-6xl">{profile.avatar}</div>
                    <div>
                        <h1 className="text-4xl font-bold">Welcome, {profile.displayName}!</h1>
                        <p className="text-foreground/60">Your personal DonateDAO dashboard</p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="glass p-6 rounded-xl">
                        <p className="text-foreground/60 text-sm mb-2">Wallet Balance</p>
                        <p className="text-3xl font-bold text-primary">{balance.toFixed(2)} ₳</p>
                    </div>
                    <div className="glass p-6 rounded-xl">
                        <p className="text-foreground/60 text-sm mb-2">Total Donated</p>
                        <p className="text-3xl font-bold text-secondary">{(stats.totalDonated / 1_000_000).toFixed(0)} ₳</p>
                    </div>
                    <div className="glass p-6 rounded-xl">
                        <p className="text-foreground/60 text-sm mb-2">My Campaigns</p>
                        <p className="text-3xl font-bold text-accent">{campaigns.length}</p>
                    </div>
                    <div className="glass p-6 rounded-xl">
                        <p className="text-foreground/60 text-sm mb-2">Voting Power</p>
                        <p className="text-3xl font-bold">{(stats.votingPower / 1_000_000).toFixed(0)}</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Link href="/create" className="glass p-6 rounded-xl hover:bg-white/10 transition-colors">
                        <div className="text-4xl mb-4">🚀</div>
                        <h3 className="text-xl font-bold mb-2">Create Campaign</h3>
                        <p className="text-foreground/60 text-sm">Launch a new fundraising campaign</p>
                    </Link>
                    <Link href="/campaigns" className="glass p-6 rounded-xl hover:bg-white/10 transition-colors">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold mb-2">Explore Campaigns</h3>
                        <p className="text-foreground/60 text-sm">Discover and support causes</p>
                    </Link>
                    <Link href="/governance" className="glass p-6 rounded-xl hover:bg-white/10 transition-colors">
                        <div className="text-4xl mb-4">🗳️</div>
                        <h3 className="text-xl font-bold mb-2">Vote on Proposals</h3>
                        <p className="text-foreground/60 text-sm">Participate in governance</p>
                    </Link>
                </div>

                {/* My Campaigns */}
                <div className="glass p-6 rounded-xl mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">My Campaigns</h2>
                        <Link href="/my-campaigns" className="text-primary hover:underline text-sm">View all →</Link>
                    </div>
                    {campaigns.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {campaigns.slice(0, 3).map((c) => (
                                <div key={c.id} className="p-4 bg-white/5 rounded-lg hover:bg-white/10">
                                    <h4 className="font-bold mb-1">{c.title}</h4>
                                    <p className="text-sm text-foreground/60">{(c.raised / 1_000_000).toFixed(0)} / {(c.goal / 1_000_000).toFixed(0)} ₳</p>
                                    <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full gradient-primary" style={{ width: `${Math.min((c.raised / c.goal) * 100, 100)}%` }} />
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <Link 
                                            href={`/campaigns/${c.id}`}
                                            className="flex-1 text-center glass py-2 rounded-lg text-sm font-medium hover:bg-white/10"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() => setQrModal({ campaignId: c.id, title: c.title })}
                                            className="flex-1 glass py-2 rounded-lg text-sm font-medium hover:bg-white/10"
                                        >
                                            Show QR
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-foreground/60 mb-4">You haven't created any campaigns yet</p>
                            <Link href="/create" className="gradient-primary px-6 py-2 rounded-lg text-white font-medium">
                                Create your first campaign
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="glass p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Recent Activity</h2>
                        <Link href="/profile" className="text-primary hover:underline text-sm">View all →</Link>
                    </div>
                    {transactions.length > 0 ? (
                        <div className="space-y-3">
                            {transactions.slice(0, 5).map((tx, i) => (
                                <div key={i} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                                    <div>
                                        <p className="font-medium">{tx.type}</p>
                                        <p className="text-sm text-foreground/60">{new Date(tx.timestamp).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`font-bold ${tx.type === 'donation' ? 'text-red-400' : 'text-green-400'}`}>
                                        {tx.type === 'donation' ? '-' : '+'}{(tx.amount / 1_000_000).toFixed(2)} ₳
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-foreground/60 py-8">No recent activity</p>
                    )}
                </div>
            </div>

            {/* QR Modal */}
            {qrModal && (
                <QRModal
                    campaignId={qrModal.campaignId}
                    campaignTitle={qrModal.title}
                    isOpen={!!qrModal}
                    onClose={() => setQrModal(null)}
                />
            )}
        </div>
    );
}

export default function Content() {
    return (
        <MeshProvider>
            <DashboardPageInner />
        </MeshProvider>
    );
}

