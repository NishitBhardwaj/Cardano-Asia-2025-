'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useCampaignStore } from '@/lib/store/campaignStore';
import { useUserStore } from '@/lib/store/userStore';
import Header from '@/components/Header';

function EditCampaignInner() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const { isAuthenticated, walletAddress } = useAuth();
    const { getCampaign, updateCampaign, initializeWithMockData } = useCampaignStore();
    const { updateCampaign: updateUserCampaign } = useUserStore();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        purpose: '',
        category: '',
        status: 'active',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize mock data
    useEffect(() => {
        initializeWithMockData();
    }, [initializeWithMockData]);

    // Load campaign data
    useEffect(() => {
        const campaign = getCampaign(campaignId);
        if (campaign) {
            setFormData({
                title: campaign.title,
                description: campaign.description,
                purpose: campaign.purpose || '',
                category: campaign.category,
                status: campaign.status,
            });
        }
    }, [campaignId, getCampaign]);

    // Redirect if not authenticated or not owner
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth');
            return;
        }
        const campaign = getCampaign(campaignId);
        if (campaign && campaign.creatorAddress !== walletAddress) {
            router.push(`/campaigns/${campaignId}`);
        }
    }, [isAuthenticated, walletAddress, campaignId, getCampaign, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            updateCampaign(campaignId, {
                title: formData.title,
                description: formData.description,
                purpose: formData.purpose,
                category: formData.category as any,
                status: formData.status as any,
            });

            updateUserCampaign(campaignId, {
                title: formData.title,
                description: formData.description,
                category: formData.category as any,
                status: formData.status as any,
            });

            alert('Campaign updated successfully!');
            router.push(`/campaigns/${campaignId}`);
        } catch (error) {
            console.error('Error updating campaign:', error);
            alert('Failed to update campaign');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-2xl mx-auto">
                    <Link href={`/campaigns/${campaignId}`} className="text-primary hover:underline mb-6 inline-block">
                        ← Back to Campaign
                    </Link>

                    <h1 className="text-4xl font-bold mb-8">Edit Campaign</h1>

                    <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Campaign Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Purpose</label>
                            <input
                                type="text"
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-lg bg-transparent"
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
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full glass px-4 py-3 rounded-lg bg-transparent"
                                >
                                    <option value="active">Active</option>
                                    <option value="paused">Paused</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 gradient-primary py-4 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                            <Link
                                href={`/campaigns/${campaignId}`}
                                className="flex-1 text-center glass py-4 rounded-lg font-semibold hover:bg-white/10"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function Content() {
    return (
        <MeshProvider>
            <EditCampaignInner />
        </MeshProvider>
    );
}

