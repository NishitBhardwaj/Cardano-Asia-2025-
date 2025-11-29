'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MeshProvider } from '@meshsdk/react';
import { useCampaignStore, categoryEmojis, CampaignFull } from '@/lib/store/campaignStore';
import useAuth from '@/lib/hooks/useAuth';
import Header from '@/components/Header';

function CampaignsPageInner() {
    const { isAuthenticated } = useAuth();
    const { 
        campaigns, 
        filters, 
        setFilters, 
        clearFilters, 
        getFilteredCampaigns, 
        initializeWithMockData 
    } = useCampaignStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'newest' | 'ending_soon' | 'most_funded' | 'most_donors'>('newest');

    // Initialize with mock data on first load
    useEffect(() => {
        initializeWithMockData();
    }, [initializeWithMockData]);

    // Update filters when search/category/sort changes
    useEffect(() => {
        setFilters({
            searchQuery,
            category: activeCategory,
            sortBy,
        });
    }, [searchQuery, activeCategory, sortBy, setFilters]);

    const filteredCampaigns = getFilteredCampaigns();
    const activeCampaigns = filteredCampaigns.filter(c => c.status === 'active');
    const completedCampaigns = filteredCampaigns.filter(c => c.status === 'completed');

    const categories = ['All', ...Object.keys(categoryEmojis)];

    const getCampaignProgress = (campaign: CampaignFull) => {
        return (campaign.raised / campaign.goal) * 100;
    };

    const getDaysLeft = (deadline: string) => {
        const now = new Date();
        const end = new Date(deadline);
        const diff = end.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold mb-4">Explore Campaigns</h1>
                    <p className="text-xl text-foreground/70">
                        Discover and support community initiatives on Cardano
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row gap-6 mb-8">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search campaigns..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full glass px-6 py-4 rounded-xl text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50">
                                🔍
                            </span>
                        </div>
                    </div>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="glass px-6 py-4 rounded-xl text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="newest">Newest First</option>
                        <option value="ending_soon">Ending Soon</option>
                        <option value="most_funded">Most Funded</option>
                        <option value="most_donors">Most Donors</option>
                    </select>
                </div>

                {/* Category Filters */}
                <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category === 'All' ? null : category)}
                            className={`px-5 py-2 rounded-full whitespace-nowrap transition-all ${
                                (category === 'All' && !activeCategory) || category === activeCategory
                                    ? 'gradient-primary text-white'
                                    : 'glass hover:bg-white/10'
                            }`}
                        >
                            {category !== 'All' && <span className="mr-2">{categoryEmojis[category as keyof typeof categoryEmojis]}</span>}
                            {category}
                        </button>
                    ))}
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="glass p-4 rounded-xl text-center">
                        <p className="text-2xl font-bold text-primary">{activeCampaigns.length}</p>
                        <p className="text-sm text-foreground/60">Active Campaigns</p>
                    </div>
                    <div className="glass p-4 rounded-xl text-center">
                        <p className="text-2xl font-bold text-secondary">{completedCampaigns.length}</p>
                        <p className="text-sm text-foreground/60">Completed</p>
                    </div>
                    <div className="glass p-4 rounded-xl text-center">
                        <p className="text-2xl font-bold text-accent">
                            {(filteredCampaigns.reduce((acc, c) => acc + c.raised, 0) / 1_000_000).toFixed(0)} ₳
                        </p>
                        <p className="text-sm text-foreground/60">Total Raised</p>
                    </div>
                    <div className="glass p-4 rounded-xl text-center">
                        <p className="text-2xl font-bold">
                            {filteredCampaigns.reduce((acc, c) => acc + c.donorCount, 0)}
                        </p>
                        <p className="text-sm text-foreground/60">Total Donors</p>
                    </div>
                </div>

                {/* Campaign Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampaigns.map((campaign) => {
                        const progress = getCampaignProgress(campaign);
                        const daysLeft = getDaysLeft(campaign.deadline);

                        return (
                            <Link
                                key={campaign.id}
                                href={`/campaigns/${campaign.id}`}
                                className="glass rounded-xl overflow-hidden hover:scale-[1.02] transition-transform"
                            >
                                {/* Image/Icon */}
                                <div className="h-40 gradient-primary flex items-center justify-center">
                                    <span className="text-6xl">{campaign.image || categoryEmojis[campaign.category] || '📋'}</span>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Category Badge */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-1 text-xs rounded-full bg-white/10">
                                            {categoryEmojis[campaign.category]} {campaign.category}
                                        </span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            campaign.status === 'active' 
                                                ? 'bg-green-500/20 text-green-500' 
                                                : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                            {campaign.status}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{campaign.title}</h3>

                                    {/* Description */}
                                    <p className="text-foreground/60 text-sm mb-4 line-clamp-2">
                                        {campaign.description}
                                    </p>

                                    {/* Progress */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium">{(campaign.raised / 1_000_000).toFixed(0)} ₳</span>
                                            <span className="text-foreground/60">of {(campaign.goal / 1_000_000).toFixed(0)} ₳</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full gradient-primary transition-all duration-500"
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex justify-between text-sm text-foreground/60">
                                        <span>{campaign.donorCount} donors</span>
                                        <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredCampaigns.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold mb-2">No campaigns found</h3>
                        <p className="text-foreground/60 mb-6">
                            Try adjusting your search or filters
                        </p>
                        <button
                            onClick={clearFilters}
                            className="gradient-primary px-6 py-3 rounded-lg text-white font-medium"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* CTA */}
                <div className="mt-16 text-center">
                    <div className="glass p-12 rounded-2xl">
                        <h3 className="text-3xl font-bold mb-4">Have a cause you care about?</h3>
                        <p className="text-foreground/70 mb-6 max-w-xl mx-auto">
                            Create your own campaign and receive transparent, decentralized funding from the Cardano community.
                        </p>
                        <Link
                            href="/create"
                            className="gradient-primary px-8 py-4 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity inline-block"
                        >
                            Start a Campaign
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CampaignsContent() {
    return (
        <MeshProvider>
            <CampaignsPageInner />
        </MeshProvider>
    );
}

