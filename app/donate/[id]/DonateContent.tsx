'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useCampaignStore } from '@/lib/store/campaignStore';
import { useUserStore } from '@/lib/store/userStore';
import Header from '@/components/Header';
import { hydraGateway } from '@/lib/hydra/hydraGateway';

function DonateContentInner() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const { isAuthenticated, walletAddress, profile, connectWallet, availableWallets } = useAuth();
    const { getCampaign, addDonation } = useCampaignStore();
    const { addSupportedCampaign, recordDonation } = useUserStore();

    const [campaign, setCampaign] = useState<any>(null);
    const [donationAmount, setDonationAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const c = getCampaign(campaignId);
        if (c) {
            setCampaign(c);
        } else {
            setError('Campaign not found');
        }
    }, [campaignId, getCampaign]);

    const handleDonate = async () => {
        if (!donationAmount || parseFloat(donationAmount) <= 0) {
            setError('Please enter a valid donation amount');
            return;
        }

        if (!isAuthenticated || !walletAddress) {
            setError('Please connect your wallet to donate');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const amount = parseFloat(donationAmount) * 1_000_000; // Convert to lovelace
            let txHash: string;
            let donationStatus: 'pending' | 'confirmed' | 'failed' = 'confirmed';

            // Check if Hydra mode
            if (campaign?.campaignMode === 'hydra-event') {
                // Process through Hydra Gateway
                const hydraDonation = await hydraGateway.processDonation(
                    campaignId,
                    walletAddress,
                    amount
                );
                txHash = hydraDonation.id;
                donationStatus = 'confirmed'; // Hydra confirmations are near-instant
            } else {
                // Normal L1 transaction
                txHash = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }

            // Add donation to campaign
            addDonation(campaignId, {
                donorAddress: walletAddress,
                donorName: profile?.displayName || 'Anonymous',
                amount,
                txHash,
                timestamp: new Date().toISOString(),
                status: donationStatus,
            });

            // Update user's supported campaigns
            if (campaign) {
                addSupportedCampaign({
                    ...campaign,
                    myDonation: amount,
                });
                recordDonation({
                    campaignId,
                    campaignTitle: campaign.title,
                    amount,
                    timestamp: new Date().toISOString(),
                    txHash,
                });
            }

            setSuccess(true);
            setDonationAmount('');

            const successMessage = campaign?.campaignMode === 'hydra-event' 
                ? '⚡ Donation confirmed via Hydra! (Near-instant)' 
                : 'Donation successful!';
            
            setTimeout(() => {
                router.push(`/campaigns/${campaignId}`);
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to process donation');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!campaign && !error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-foreground/60">Loading campaign...</p>
                </div>
            </div>
        );
    }

    if (error && !campaign) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-6 py-12 max-w-2xl">
                    <div className="glass p-8 rounded-2xl text-center space-y-4">
                        <div className="text-6xl mb-4">❌</div>
                        <h1 className="text-3xl font-bold text-red-500">Campaign Not Found</h1>
                        <p className="text-foreground/60">{error}</p>
                        <button
                            onClick={() => router.push('/campaigns')}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Browse Campaigns
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const percentageFunded = campaign ? (campaign.raised / campaign.goal) * 100 : 0;
    const daysLeft = campaign ? Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-6 py-12 max-w-4xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Campaign Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass rounded-xl overflow-hidden">
                            {/* Campaign Image */}
                            {campaign?.image && campaign.image.startsWith('data:image') ? (
                                <div className="h-48 overflow-hidden">
                                    <img 
                                        src={campaign.image} 
                                        alt={campaign.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="h-48 gradient-primary flex items-center justify-center">
                                    <span className="text-6xl">{campaign?.image || '📋'}</span>
                                </div>
                            )}
                            <div className="p-6">
                                {campaign?.campaignMode === 'hydra-event' && (
                                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
                                        ⚡ Hydra Event Mode - Fast Donations
                                    </div>
                                )}
                                <h1 className="text-4xl font-bold mb-4">{campaign?.title}</h1>
                                <p className="text-foreground/70 mb-6">{campaign?.description}</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-foreground/60">Progress</span>
                                        <span className="font-medium">{percentageFunded.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{ width: `${Math.min(percentageFunded, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm mt-2">
                                        <span>{(campaign?.raised / 1_000_000).toFixed(2)} ₳ raised</span>
                                        <span>{(campaign?.goal / 1_000_000).toFixed(2)} ₳ goal</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                    <div>
                                        <p className="text-sm text-foreground/60">Donors</p>
                                        <p className="text-2xl font-bold">{campaign?.donorCount || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground/60">Days Left</p>
                                        <p className="text-2xl font-bold">{daysLeft > 0 ? daysLeft : 'Ended'}</p>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>

                    {/* Donation Form */}
                    <div className="lg:col-span-1">
                        <div className="glass p-6 rounded-xl space-y-6 sticky top-24">
                            <h2 className="text-2xl font-bold">Make a Donation</h2>

                            {success ? (
                                <div className="text-center space-y-4 py-8">
                                    <div className="text-6xl mb-4">✓</div>
                                    <h3 className="text-xl font-bold text-green-500">Thank You!</h3>
                                    <p className="text-foreground/60">Your donation has been recorded</p>
                                    <p className="text-sm text-foreground/50">Redirecting to campaign...</p>
                                </div>
                            ) : (
                                <>
                                    {!isAuthenticated ? (
                                        <div className="space-y-4">
                                            <p className="text-foreground/60">Connect your wallet to donate</p>
                                            {availableWallets.length > 0 ? (
                                                <div className="space-y-2">
                                                    {availableWallets.map((wallet) => (
                                                        <button
                                                            key={wallet.name}
                                                            onClick={() => connectWallet(wallet.name)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 glass rounded-lg hover:bg-primary/20 transition-colors"
                                                        >
                                                            <img src={wallet.icon} alt={wallet.name} className="w-8 h-8 rounded-lg" />
                                                            <span className="font-medium capitalize">{wallet.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-foreground/60">No wallet found. Please install a Cardano wallet.</p>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Amount (ADA)</label>
                                                    <input
                                                        type="number"
                                                        value={donationAmount}
                                                        onChange={(e) => setDonationAmount(e.target.value)}
                                                        placeholder="0.00"
                                                        min="0"
                                                        step="0.1"
                                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-2xl font-bold"
                                                    />
                                                </div>

                                                <div className="flex gap-2">
                                                    {[10, 50, 100, 500].map((amount) => (
                                                        <button
                                                            key={amount}
                                                            onClick={() => setDonationAmount(amount.toString())}
                                                            className="flex-1 px-4 py-2 glass rounded-lg hover:bg-primary/20 transition-colors"
                                                        >
                                                            {amount} ₳
                                                        </button>
                                                    ))}
                                                </div>

                                                {error && (
                                                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                                                        <p className="text-sm text-red-500">{error}</p>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={handleDonate}
                                                    disabled={!donationAmount || isSubmitting}
                                                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmitting ? 'Processing...' : 'Donate Now'}
                                                </button>
                                            </div>

                                            <div className="pt-4 border-t border-border">
                                                <p className="text-xs text-foreground/60">
                                                    Connected: {walletAddress?.slice(0, 10)}...{walletAddress?.slice(-8)}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DonateContent() {
    return (
        <MeshProvider>
            <DonateContentInner />
        </MeshProvider>
    );
}

