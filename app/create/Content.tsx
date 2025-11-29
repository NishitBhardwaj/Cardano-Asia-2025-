'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useUserStore } from '@/lib/store/userStore';
import Header from '@/components/Header';

function CreatePageInner() {
    const router = useRouter();
    const { isAuthenticated, walletAddress, profile } = useAuth();
    const { addCampaign } = useUserStore();
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        purpose: '',
        category: 'community',
        goalAmount: '',
        deadline: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletAddress) return;

        setIsSubmitting(true);
        try {
            const campaignId = `campaign_${Date.now()}`;
            addCampaign({
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

    if (!isAuthenticated) {
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

