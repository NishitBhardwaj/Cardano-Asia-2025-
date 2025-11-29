'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useUserStore } from '@/lib/store/userStore';
import Header from '@/components/Header';
import QRModal from '@/components/QRModal';

function MyCampaignsPageInner() {
    const router = useRouter();
    const { isAuthenticated, walletAddress, profile } = useAuth();
    const { campaigns, _hasHydrated } = useUserStore();
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
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

    const filteredCampaigns = campaigns.filter(c => {
        if (filter === 'all') return true;
        return c.status === filter;
    });

    const stats = {
        total: campaigns.length,
        active: campaigns.filter(c => c.status === 'active').length,
        completed: campaigns.filter(c => c.status === 'completed').length,
        totalRaised: campaigns.reduce((sum, c) => sum + c.raised, 0),
    };

    if (!mounted || !_hasHydrated || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-foreground/60">Loading campaigns...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-5xl font-bold mb-2">My Campaigns</h1>
                        <p className="text-xl text-foreground/70">Manage all your fundraising campaigns</p>
                    </div>
                    <Link
                        href="/create"
                        className="gradient-primary px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90"
                    >
                        + Create Campaign
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="glass p-6 rounded-xl">
                        <p className="text-foreground/60 text-sm">Total Campaigns</p>
                        <p className="text-4xl font-bold text-primary">{stats.total}</p>
                    </div>
                    <div className="glass p-6 rounded-xl">
                        <p className="text-foreground/60 text-sm">Active</p>
                        <p className="text-4xl font-bold text-green-500">{stats.active}</p>
                    </div>
                    <div className="glass p-6 rounded-xl">
                        <p className="text-foreground/60 text-sm">Completed</p>
                        <p className="text-4xl font-bold text-secondary">{stats.completed}</p>
                    </div>
                    <div className="glass p-6 rounded-xl">
                        <p className="text-foreground/60 text-sm">Total Raised</p>
                        <p className="text-4xl font-bold text-accent">{(stats.totalRaised / 1_000_000).toFixed(0)} ₳</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {(['all', 'active', 'completed'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                filter === f ? 'bg-primary text-white' : 'glass hover:bg-white/10'
                            }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Campaign List */}
                {filteredCampaigns.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCampaigns.map((campaign) => {
                            const progress = (campaign.raised / campaign.goal) * 100;
                            return (
                                <div key={campaign.id} className="glass rounded-xl overflow-hidden">
                                    <div className="h-32 gradient-primary flex items-center justify-center">
                                        <span className="text-5xl">{campaign.image || '📋'}</span>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                campaign.status === 'active' 
                                                    ? 'bg-green-500/20 text-green-500' 
                                                    : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {campaign.status}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{campaign.title}</h3>
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>{(campaign.raised / 1_000_000).toFixed(0)} ₳</span>
                                                <span className="text-foreground/60">of {(campaign.goal / 1_000_000).toFixed(0)} ₳</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full gradient-primary" 
                                                    style={{ width: `${Math.min(progress, 100)}%` }} 
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link 
                                                href={`/campaigns/${campaign.id}`}
                                                className="flex-1 text-center glass py-2 rounded-lg text-sm font-medium hover:bg-white/10"
                                            >
                                                View
                                            </Link>
                                            <Link 
                                                href={`/campaigns/${campaign.id}/edit`}
                                                className="flex-1 text-center glass py-2 rounded-lg text-sm font-medium hover:bg-white/10"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => setQrModal({ campaignId: campaign.id, title: campaign.title })}
                                                className="flex-1 glass py-2 rounded-lg text-sm font-medium hover:bg-white/10"
                                                title="Show QR Code"
                                            >
                                                QR
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="glass p-12 rounded-xl text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-2xl font-bold mb-2">No campaigns yet</h3>
                        <p className="text-foreground/60 mb-6">Create your first campaign and start raising funds</p>
                        <Link
                            href="/create"
                            className="gradient-primary px-8 py-3 rounded-lg font-semibold text-white inline-block"
                        >
                            Create Campaign
                        </Link>
                    </div>
                )}
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
            <MyCampaignsPageInner />
        </MeshProvider>
    );
}

