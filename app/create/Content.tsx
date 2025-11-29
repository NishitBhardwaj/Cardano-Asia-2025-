'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useUserStore } from '@/lib/store/userStore';
import { useCampaignStore } from '@/lib/store/campaignStore';
import Header from '@/components/Header';
import ImageUpload from '@/components/ImageUpload';
import { isUserVerified, getVerificationData } from '@/lib/verification/documentVerifier';

function CreatePageInner() {
    const router = useRouter();
    const { isAuthenticated, walletAddress, profile } = useAuth();
    const { addCampaign: addUserCampaign, _hasHydrated } = useUserStore();
    const { addCampaign } = useCampaignStore();
    const [mounted, setMounted] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        purpose: '',
        category: 'community',
        goalAmount: '',
        deadline: '',
        campaignMode: 'normal' as 'normal' | 'hydra-event' | 'long-campaign' | 'small-campaign',
        image: null as string | null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerified, setIsVerified] = useState<boolean | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && _hasHydrated && !isAuthenticated) {
            router.push('/auth');
        }
    }, [isAuthenticated, router, mounted, _hasHydrated]);

    // Check verification status
    useEffect(() => {
        if (profile) {
            const userId = profile.walletAddress || profile.email || '';
            const verified = isUserVerified(userId);
            setIsVerified(verified);
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletAddress) return;

        setIsSubmitting(true);
        try {
            if (!walletAddress || !profile) {
                throw new Error('Wallet not connected');
            }

            const campaignId = addCampaign({
                title: formData.title,
                description: formData.description,
                purpose: formData.purpose,
                category: formData.category as any,
                goal: parseFloat(formData.goalAmount) * 1_000_000,
                deadline: formData.deadline,
                createdAt: new Date().toISOString(),
                status: 'active',
                creatorAddress: walletAddress,
                creatorName: profile.displayName,
                creatorUsername: profile.username || undefined,
                image: formData.image || '',
                milestones: [],
                campaignMode: formData.campaignMode,
            });

            // Also add to user's campaigns
            addUserCampaign({
                id: campaignId,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                goal: parseFloat(formData.goalAmount) * 1_000_000,
                raised: 0,
                deadline: formData.deadline,
                createdAt: new Date().toISOString(),
                status: 'active',
                donorCount: 0,
            });
            
            alert('Campaign created successfully!');
            router.push(`/campaigns/${campaignId}`);
        } catch (error) {
            console.error('Error creating campaign:', error);
            alert('Failed to create campaign');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted || !_hasHydrated || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-foreground/60">Loading...</p>
                </div>
            </div>
        );
    }

    // Show verification requirement if not verified
    if (isVerified === false) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-6 py-12">
                    <div className="max-w-xl mx-auto glass p-8 rounded-2xl text-center space-y-6">
                        <div className="text-6xl">🔐</div>
                        <h1 className="text-3xl font-bold">Identity Verification Required</h1>
                        <p className="text-foreground/70">
                            To create campaigns and protect our community from scams, we require identity verification before you can create a campaign.
                        </p>
                        <div className="space-y-3">
                            <Link
                                href="/auth/verify-identity"
                                className="block w-full px-6 py-4 gradient-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Verify My Identity
                            </Link>
                            <Link
                                href="/campaigns"
                                className="block w-full px-6 py-3 glass rounded-lg hover:bg-white/10 transition-colors"
                            >
                                Browse Campaigns Instead
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show loading while checking verification
    if (isVerified === null) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-5xl font-bold mb-4">Create Campaign</h1>
                    <p className="text-xl text-foreground/70 mb-8">Launch your fundraising campaign on Cardano</p>

                    <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Campaign Title *</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Enter campaign title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Purpose *</label>
                            <input
                                type="text"
                                required
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="What is the purpose of this campaign?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description *</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Describe your campaign in detail"
                            />
                        </div>

                        {/* Campaign Image Upload */}
                        <ImageUpload
                            onImageChange={(img) => setFormData({ ...formData, image: img })}
                            currentImage={formData.image}
                            maxSizeKB={500}
                            label="Campaign Image (Optional)"
                            placeholder="Add an eye-catching image for your campaign"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Category *</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                                >
                                    <option value="community">🏘️ Community</option>
                                    <option value="education">📚 Education</option>
                                    <option value="health">🏥 Health</option>
                                    <option value="environment">🌱 Environment</option>
                                    <option value="emergency">🚨 Emergency</option>
                                    <option value="animals">🐾 Animals</option>
                                    <option value="technology">💻 Technology</option>
                                    <option value="other">📋 Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Goal Amount (₳) *</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.goalAmount}
                                    onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Deadline *</label>
                            <input
                                type="date"
                                required
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Campaign Mode *</label>
                            <select
                                required
                                value={formData.campaignMode}
                                onChange={(e) => setFormData({ ...formData, campaignMode: e.target.value as any })}
                                className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                            >
                                <option value="normal">🔄 Normal Mode (L1 Only)</option>
                                <option value="hydra-event">⚡ Hydra Event Mode (Fast & Low Fees)</option>
                                <option value="long-campaign">📅 Long Campaign (Extended Duration)</option>
                                <option value="small-campaign">💎 Small Campaign (Quick Goals)</option>
                            </select>
                            <div className="mt-2 text-sm text-foreground/60 space-y-1">
                                {formData.campaignMode === 'normal' && (
                                    <p>Standard L1 transactions. Slower but simple and secure.</p>
                                )}
                                {formData.campaignMode === 'hydra-event' && (
                                    <p className="text-primary">⚡ Fast donations via Hydra Head. Lower fees, near-instant confirmations. Perfect for livestream fundraisers and charity marathons.</p>
                                )}
                                {formData.campaignMode === 'long-campaign' && (
                                    <p>Extended duration campaigns with flexible milestones.</p>
                                )}
                                {formData.campaignMode === 'small-campaign' && (
                                    <p>Quick campaigns with smaller funding goals.</p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full gradient-primary py-4 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function Content() {
    return (
        <MeshProvider>
            <CreatePageInner />
        </MeshProvider>
    );
}

