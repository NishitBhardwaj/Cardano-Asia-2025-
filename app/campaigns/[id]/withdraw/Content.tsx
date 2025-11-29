'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useCampaignStore } from '@/lib/store/campaignStore';
import Header from '@/components/Header';

function WithdrawPageInner() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const { isAuthenticated, walletAddress } = useAuth();
    const { getCampaign, initializeWithMockData } = useCampaignStore();

    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [campaign, setCampaign] = useState<any>(null);

    // Initialize mock data
    useEffect(() => {
        initializeWithMockData();
    }, [initializeWithMockData]);

    // Load campaign
    useEffect(() => {
        const c = getCampaign(campaignId);
        setCampaign(c);
        if (c && walletAddress) {
            setRecipientAddress(walletAddress);
        }
    }, [campaignId, getCampaign, walletAddress]);

    // Redirect if not authenticated or not owner
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth');
            return;
        }
        if (campaign && campaign.creatorAddress !== walletAddress) {
            router.push(`/campaigns/${campaignId}`);
        }
    }, [isAuthenticated, walletAddress, campaign, campaignId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!withdrawAmount || !recipientAddress) return;

        setIsSubmitting(true);
        try {
            // In a real implementation, this would create a multi-sig withdrawal request
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            alert('Withdrawal request submitted! It requires 3 of 5 admin signatures to process.');
            router.push(`/campaigns/${campaignId}`);
        } catch (error) {
            console.error('Error submitting withdrawal:', error);
            alert('Failed to submit withdrawal request');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!campaign) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const availableFunds = campaign.raised / 1_000_000;

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-2xl mx-auto">
                    <Link href={`/campaigns/${campaignId}`} className="text-primary hover:underline mb-6 inline-block">
                        ← Back to Campaign
                    </Link>

                    <h1 className="text-4xl font-bold mb-2">Request Withdrawal</h1>
                    <p className="text-foreground/70 mb-8">
                        Withdrawal requests require 3 of 5 admin signatures for security.
                    </p>

                    {/* Available Balance */}
                    <div className="glass p-6 rounded-xl mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-foreground/60 text-sm">Available Funds</p>
                                <p className="text-3xl font-bold text-primary">{availableFunds.toFixed(2)} ₳</p>
                            </div>
                            <div className="text-right">
                                <p className="text-foreground/60 text-sm">Campaign</p>
                                <p className="font-medium">{campaign.title}</p>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-lg mb-8">
                        <p className="text-yellow-500 text-sm">
                            ⚠️ This is a demo. In production, withdrawal requests go through a multi-signature approval process
                            where 3 out of 5 designated admins must approve the transaction for it to be executed.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Withdrawal Amount (₳)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                max={availableFunds}
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Enter amount"
                            />
                            <p className="text-xs text-foreground/50 mt-1">Max: {availableFunds.toFixed(2)} ₳</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Recipient Address</label>
                            <input
                                type="text"
                                required
                                value={recipientAddress}
                                onChange={(e) => setRecipientAddress(e.target.value)}
                                className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                                placeholder="addr1..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Reason / Description</label>
                            <textarea
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Describe what the funds will be used for..."
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || !withdrawAmount || parseFloat(withdrawAmount) > availableFunds}
                                className="flex-1 gradient-primary py-4 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Withdrawal Request'}
                            </button>
                            <Link
                                href={`/campaigns/${campaignId}`}
                                className="flex-1 text-center glass py-4 rounded-lg font-semibold hover:bg-white/10"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>

                    {/* Multi-sig Info */}
                    <div className="mt-8 glass p-6 rounded-xl">
                        <h3 className="font-bold mb-4">Multi-Signature Process</h3>
                        <div className="space-y-3 text-sm text-foreground/70">
                            <p>1. You submit a withdrawal request</p>
                            <p>2. Request is broadcast to all 5 admins</p>
                            <p>3. Admins review and sign (or reject) the request</p>
                            <p>4. Once 3 signatures are collected, funds are transferred</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Content() {
    return (
        <MeshProvider>
            <WithdrawPageInner />
        </MeshProvider>
    );
}

