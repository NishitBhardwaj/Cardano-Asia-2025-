'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useCampaignStore, categoryEmojis } from '@/lib/store/campaignStore';
import { useUserStore } from '@/lib/store/userStore';
import Header from '@/components/Header';
import AdminManagement from '@/components/AdminManagement';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { hydraGateway } from '@/lib/hydra/hydraGateway';

function CampaignDetailInner() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const { isAuthenticated, walletAddress, profile } = useAuth();
    const { getCampaign, addDonation, initializeWithMockData, updateCampaign } = useCampaignStore();
    const { addSupportedCampaign, recordDonation } = useUserStore();

    const [donationAmount, setDonationAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [campaign, setCampaign] = useState<any>(null);
    const [hydraStats, setHydraStats] = useState<{ totalAmount: number; donationCount: number; lastDonationAt?: string } | null>(null);
    const isHydraMode = campaign?.campaignMode === 'hydra-event';

    // Update Hydra stats function
    const updateHydraStats = useCallback(async () => {
        if (!isHydraMode) return;
        const stats = await hydraGateway.getRealTimeStats(campaignId);
        setHydraStats(stats);
        
        // Update campaign raised amount from Hydra stats
        if (stats.totalAmount > 0) {
            const c = getCampaign(campaignId);
            if (c && c.raised !== stats.totalAmount) {
                // Update campaign store with Hydra total
                updateCampaign(campaignId, { raised: stats.totalAmount });
            }
        }
    }, [campaignId, isHydraMode, getCampaign, updateCampaign]);

    // Initialize mock data
    useEffect(() => {
        initializeWithMockData();
    }, [initializeWithMockData]);

    // Load campaign
    useEffect(() => {
        const c = getCampaign(campaignId);
        setCampaign(c);
        
        // Initialize Hydra Head if Hydra mode
        if (c?.campaignMode === 'hydra-event') {
            hydraGateway.initializeHydraHead(campaignId).then(() => {
                updateHydraStats();
            });
        }
    }, [campaignId, getCampaign, updateHydraStats]);

    // Real-time updates for Hydra campaigns
    useEffect(() => {
        if (!isHydraMode) return;

        const interval = setInterval(() => {
            updateHydraStats();
        }, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, [campaignId, isHydraMode, updateHydraStats]);

    const handleDonate = async () => {
        if (!donationAmount || !walletAddress || !campaign) return;

        setIsSubmitting(true);
        try {
            const amount = parseFloat(donationAmount) * 1_000_000;
            let txHash: string;
            let donationStatus: 'pending' | 'confirmed' | 'failed' = 'confirmed';

            // Check if Hydra mode
            if (campaign.campaignMode === 'hydra-event') {
                // Process through Hydra Gateway
                const hydraDonation = await hydraGateway.processDonation(
                    campaignId,
                    walletAddress,
                    amount
                );
                txHash = hydraDonation.id; // Use Hydra donation ID
                donationStatus = 'confirmed'; // Hydra confirmations are near-instant
                
                // Update real-time stats
                await updateHydraStats();
            } else {
                // Normal L1 transaction
                txHash = `tx_${Date.now()}`;
            }

            // Add donation to campaign
            addDonation(campaignId, {
                donorAddress: walletAddress,
                donorName: profile?.displayName,
                amount,
                txHash,
                timestamp: new Date().toISOString(),
                status: donationStatus,
            });

            // Record in user store
            addSupportedCampaign({
                id: campaign.id,
                title: campaign.title,
                myDonation: amount,
                raised: campaign.raised + amount,
                goal: campaign.goal,
                deadline: campaign.deadline,
                status: campaign.status,
                createdAt: campaign.createdAt,
            });

            recordDonation({
                campaignId: campaign.id,
                campaignTitle: campaign.title,
                amount,
                txHash,
                timestamp: new Date().toISOString(),
            });

            alert(campaign.campaignMode === 'hydra-event' 
                ? '⚡ Donation confirmed via Hydra! (Near-instant)' 
                : 'Donation successful!');
            setDonationAmount('');
            
            // Refresh campaign
            const updated = getCampaign(campaignId);
            setCampaign(updated);
        } catch (error) {
            console.error('Donation error:', error);
            alert('Failed to donate: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!campaign) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-6 py-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h1 className="text-3xl font-bold mb-4">Campaign Not Found</h1>
                    <p className="text-foreground/60 mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
                    <Link href="/campaigns" className="gradient-primary px-6 py-3 rounded-lg text-white font-medium">
                        Browse Campaigns
                    </Link>
                </div>
            </div>
        );
    }

    const progress = (campaign.raised / campaign.goal) * 100;
    const isCreator = walletAddress && campaign.creatorAddress === walletAddress;
    const isCreatorByUsername = profile?.username?.toLowerCase() === campaign.creatorUsername?.toLowerCase();
    const canManage = isCreator || isCreatorByUsername;

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-6 py-12">
                {/* Back Link */}
                <Link href="/campaigns" className="text-primary hover:underline mb-6 inline-block">
                    ← Back to Campaigns
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Hero */}
                        <div className="glass rounded-2xl overflow-hidden">
                            <div className="h-64 gradient-primary flex items-center justify-center overflow-hidden">
                                {campaign.image && campaign.image.startsWith('data:image') ? (
                                    <img 
                                        src={campaign.image} 
                                        alt={campaign.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-9xl">{campaign.image || categoryEmojis[campaign.category] || '📋'}</span>
                                )}
                            </div>
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-4 flex-wrap">
                                    <span className="px-3 py-1 text-sm rounded-full bg-white/10">
                                        {categoryEmojis[campaign.category]} {campaign.category}
                                    </span>
                                    <span className={`px-3 py-1 text-sm rounded-full ${
                                        campaign.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                        {campaign.status}
                                    </span>
                                    {campaign.campaignMode === 'hydra-event' && (
                                        <span className="px-3 py-1 text-sm rounded-full bg-primary/20 text-primary font-medium flex items-center gap-1">
                                            ⚡ Hydra Event Mode
                                        </span>
                                    )}
                                    {campaign.campaignMode === 'long-campaign' && (
                                        <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-400">
                                            📅 Long Campaign
                                        </span>
                                    )}
                                    {campaign.campaignMode === 'small-campaign' && (
                                        <span className="px-3 py-1 text-sm rounded-full bg-purple-500/20 text-purple-400">
                                            💎 Small Campaign
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-4xl font-bold mb-4">{campaign.title}</h1>
                                <p className="text-foreground/70 text-lg mb-6">{campaign.description}</p>
                                
                                {canManage && (
                                    <div className="flex gap-4">
                                        <Link href={`/campaigns/${campaignId}/edit`} className="glass px-6 py-2 rounded-lg text-sm font-medium hover:bg-white/10">
                                            Edit Campaign
                                        </Link>
                                        <Link href={`/campaigns/${campaignId}/withdraw`} className="gradient-primary px-6 py-2 rounded-lg text-sm font-medium text-white">
                                            Request Withdrawal
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Donations */}
                        <div className="glass p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold mb-6">Recent Donations</h2>
                            {campaign.donations && campaign.donations.length > 0 ? (
                                <div className="space-y-4">
                                    {campaign.donations.slice(0, 5).map((d: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                                            <div>
                                                <p className="font-medium">{d.donorName || d.donorAddress?.slice(0, 12) + '...'}</p>
                                                <p className="text-sm text-foreground/60">{new Date(d.timestamp).toLocaleDateString()}</p>
                                            </div>
                                            <p className="font-bold text-primary">{(d.amount / 1_000_000).toFixed(2)} ₳</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-foreground/60 py-8">No donations yet. Be the first!</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Progress Card */}
                        <div className="glass p-6 rounded-2xl">
                            {isHydraMode && hydraStats && (
                                <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-primary text-lg">⚡</span>
                                        <span className="text-sm font-medium text-primary">Fast Donations via Hydra</span>
                                    </div>
                                    <p className="text-xs text-foreground/70">
                                        Lower fees, near-instant confirmations. Real-time updates.
                                    </p>
                                    {hydraStats.lastDonationAt && (
                                        <p className="text-xs text-foreground/60 mt-1">
                                            Last donation: {new Date(hydraStats.lastDonationAt).toLocaleTimeString()}
                                        </p>
                                    )}
                                </div>
                            )}
                            <div className="mb-6">
                                <div className="flex justify-between text-lg mb-2">
                                    <span className="font-bold">
                                        {isHydraMode && hydraStats 
                                            ? (hydraStats.totalAmount / 1_000_000).toFixed(0) 
                                            : (campaign.raised / 1_000_000).toFixed(0)} ₳
                                    </span>
                                    <span className="text-foreground/60">of {(campaign.goal / 1_000_000).toFixed(0)} ₳</span>
                                </div>
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full gradient-primary" style={{ width: `${Math.min(progress, 100)}%` }} />
                                </div>
                                <p className="text-sm text-foreground/60 mt-2">{progress.toFixed(0)}% funded</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center p-4 bg-white/5 rounded-lg">
                                    <p className="text-2xl font-bold">
                                        {isHydraMode && hydraStats 
                                            ? hydraStats.donationCount 
                                            : campaign.donorCount}
                                    </p>
                                    <p className="text-sm text-foreground/60">Donors</p>
                                </div>
                                <div className="text-center p-4 bg-white/5 rounded-lg">
                                    <p className="text-2xl font-bold">
                                        {Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
                                    </p>
                                    <p className="text-sm text-foreground/60">Days Left</p>
                                </div>
                            </div>

                            {/* Donate Form */}
                            {campaign.status === 'active' && !isCreator && (
                                <div className="space-y-4">
                                    {isHydraMode && (
                                        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 mb-4">
                                            <p className="text-sm text-primary font-medium mb-1">⚡ Hydra Event Mode Active</p>
                                            <p className="text-xs text-foreground/70">
                                                Your donation will be processed through Hydra Head for faster confirmation and lower fees.
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Donation Amount (₳)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={donationAmount}
                                            onChange={(e) => setDonationAmount(e.target.value)}
                                            className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        {[10, 50, 100, 500].map((amount) => (
                                            <button
                                                key={amount}
                                                onClick={() => setDonationAmount(amount.toString())}
                                                className="flex-1 glass py-2 rounded-lg text-sm hover:bg-white/10"
                                            >
                                                {amount} ₳
                                            </button>
                                        ))}
                                    </div>
                                    {isAuthenticated ? (
                                        <button
                                            onClick={handleDonate}
                                            disabled={!donationAmount || isSubmitting}
                                            className="w-full gradient-primary py-4 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Processing...' : 'Donate Now'}
                                        </button>
                                    ) : (
                                        <Link
                                            href="/auth"
                                            className="block w-full text-center gradient-primary py-4 rounded-lg font-semibold text-white"
                                        >
                                            Connect Wallet to Donate
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* QR Code Section - Visible to All */}
                        <div className="glass p-4 sm:p-6 rounded-2xl">
                            <h3 className="font-bold mb-4 text-sm sm:text-base">Share & Donate</h3>
                            <div className="flex flex-col items-center">
                                <QRCodeGenerator
                                    value={typeof window !== 'undefined' ? `${window.location.origin}/donate/${campaignId}` : ''}
                                    title="Scan to Donate"
                                    size={140}
                                    campaignTitle={campaign.title}
                                />
                                <p className="text-xs text-foreground/60 mt-3 text-center">
                                    Scan QR or copy link to share
                                </p>
                            </div>
                        </div>

                        {/* Creator Info */}
                        <div className="glass p-6 rounded-2xl">
                            <h3 className="font-bold mb-4">Campaign Creator</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold">₳</span>
                                </div>
                                <div>
                                    <p className="font-medium">{campaign.creatorName || campaign.creatorUsername || 'Anonymous'}</p>
                                    <p className="text-sm text-foreground/60 font-mono">
                                        {campaign.creatorAddress?.slice(0, 12)}...
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Admin Management - Only for creator */}
                        {canManage && (
                            <AdminManagement campaignId={campaignId} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Content() {
    return (
        <MeshProvider>
            <CampaignDetailInner />
        </MeshProvider>
    );
}

