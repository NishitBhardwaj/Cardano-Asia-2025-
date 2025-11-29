/**
 * Campaign Store - Global Campaign Management
 * 
 * Manages all campaigns in the DApp including:
 * - User-created campaigns
 * - Campaign donations tracking
 * - Campaign stats and progress
 * 
 * @module lib/store/campaignStore
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Donation {
    id: string;
    donorAddress: string;
    donorName?: string;
    amount: number; // in lovelace
    txHash: string;
    timestamp: string;
    status: 'pending' | 'confirmed' | 'failed';
    message?: string;
}

export interface Milestone {
    id: string;
    title: string;
    description: string;
    amount: number; // in lovelace
    completed: boolean;
    completedAt?: string;
}

export interface CampaignFull {
    // Core Info
    id: string;
    title: string;
    description: string;
    purpose: string;
    category: 'community' | 'education' | 'health' | 'environment' | 'emergency' | 'animals' | 'infrastructure' | 'technology' | 'other';
    image: string;
    
    // Financials
    goal: number; // in lovelace
    raised: number; // in lovelace
    
    // Timeline
    createdAt: string;
    deadline: string;
    updatedAt: string;
    
    // Creator
    creatorAddress: string;
    creatorName?: string;
    
    // Status
    status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'expired';
    
    // Engagement
    donations: Donation[];
    milestones: Milestone[];
    donorCount: number;
    viewCount: number;
    
    // Blockchain
    contractAddress?: string;
    txHash?: string;
    
    // Metadata
    tags?: string[];
    featured?: boolean;
    verified?: boolean;
}

export interface CampaignFilters {
    category: string | null;
    status: string | null;
    sortBy: 'newest' | 'ending_soon' | 'most_funded' | 'most_donors';
    searchQuery: string;
}

export interface CampaignState {
    // Data
    campaigns: CampaignFull[];
    
    // Filters
    filters: CampaignFilters;
    
    // Loading
    isLoading: boolean;
    error: string | null;
    
    // Actions
    addCampaign: (campaign: Omit<CampaignFull, 'id' | 'raised' | 'donations' | 'donorCount' | 'viewCount' | 'updatedAt'>) => string;
    updateCampaign: (id: string, updates: Partial<CampaignFull>) => void;
    deleteCampaign: (id: string) => void;
    
    // Donations
    addDonation: (campaignId: string, donation: Omit<Donation, 'id'>) => void;
    updateDonationStatus: (campaignId: string, donationId: string, status: Donation['status']) => void;
    
    // Milestones
    completeMilestone: (campaignId: string, milestoneId: string) => void;
    
    // Filters
    setFilters: (filters: Partial<CampaignFilters>) => void;
    clearFilters: () => void;
    
    // Queries
    getCampaign: (id: string) => CampaignFull | undefined;
    getCampaignsByCreator: (creatorAddress: string) => CampaignFull[];
    getFilteredCampaigns: () => CampaignFull[];
    getCampaignStats: (id: string) => CampaignStats | undefined;
    getDonationsByDonor: (donorAddress: string) => { campaign: CampaignFull; donation: Donation }[];
    
    // Utilities
    incrementViewCount: (id: string) => void;
    initializeWithMockData: () => void;
}

export interface CampaignStats {
    totalRaised: number;
    percentageFunded: number;
    daysLeft: number;
    donorCount: number;
    averageDonation: number;
    largestDonation: number;
    recentDonations: Donation[];
    isFullyFunded: boolean;
    isExpired: boolean;
}

// ============================================================================
// CATEGORY EMOJIS
// ============================================================================

export const categoryEmojis: Record<string, string> = {
    community: '🏘️',
    education: '📚',
    health: '🏥',
    environment: '🌱',
    emergency: '🚨',
    animals: '🐕',
    infrastructure: '💧',
    technology: '💻',
    other: '📋',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateCampaignId(): string {
    return `campaign_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateDonationId(): string {
    return `donation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const defaultFilters: CampaignFilters = {
    category: null,
    status: null,
    sortBy: 'newest',
    searchQuery: '',
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockCampaigns: CampaignFull[] = [
    {
        id: 'mock_1',
        title: 'Community School Renovation',
        description: 'Help renovate the local community school to provide a better learning environment for 500+ students. The funds will be used for new classrooms, library upgrades, computer lab equipment, and playground facilities.',
        purpose: 'To create a safer and more modern learning environment for underprivileged children in our community.',
        category: 'education',
        image: '🏫',
        goal: 50000_000_000, // 50,000 ADA
        raised: 32500_000_000,
        createdAt: '2025-10-01T00:00:00Z',
        deadline: '2025-12-15T23:59:59Z',
        updatedAt: '2025-11-29T10:00:00Z',
        creatorAddress: 'addr1qy8ac...vw8k',
        creatorName: 'Education Foundation',
        status: 'active',
        donations: [
            { id: 'd1', donorAddress: 'addr1qx...p2n', donorName: 'Alice', amount: 1000_000_000, txHash: 'abc123...', timestamp: '2025-11-20T14:30:00Z', status: 'confirmed' },
            { id: 'd2', donorAddress: 'addr1qz...km5r', donorName: 'Bob', amount: 250_000_000, txHash: 'def456...', timestamp: '2025-11-21T09:15:00Z', status: 'confirmed' },
            { id: 'd3', donorAddress: 'addr1qw...7t8u', amount: 500_000_000, txHash: 'ghi789...', timestamp: '2025-11-22T16:45:00Z', status: 'confirmed' },
        ],
        milestones: [
            { id: 'm1', title: 'Classroom Renovation', description: 'Renovate 10 classrooms', amount: 20000_000_000, completed: true, completedAt: '2025-11-15T00:00:00Z' },
            { id: 'm2', title: 'Library Upgrade', description: 'New books and furniture', amount: 15000_000_000, completed: true, completedAt: '2025-11-25T00:00:00Z' },
            { id: 'm3', title: 'Computer Lab', description: '25 new computers', amount: 10000_000_000, completed: false },
            { id: 'm4', title: 'Playground', description: 'New playground equipment', amount: 5000_000_000, completed: false },
        ],
        donorCount: 45,
        viewCount: 1250,
        verified: true,
        featured: true,
    },
    {
        id: 'mock_2',
        title: 'Medical Emergency Fund',
        description: 'Support families facing unexpected medical emergencies in our community. This fund provides immediate assistance for medical bills, treatments, and recovery support.',
        purpose: 'To ensure no family has to choose between healthcare and basic necessities.',
        category: 'health',
        image: '🏥',
        goal: 100000_000_000,
        raised: 87300_000_000,
        createdAt: '2025-09-15T00:00:00Z',
        deadline: '2025-12-01T23:59:59Z',
        updatedAt: '2025-11-28T08:00:00Z',
        creatorAddress: 'addr1qx...xp2n',
        creatorName: 'Health Alliance',
        status: 'active',
        donations: [],
        milestones: [
            { id: 'm1', title: 'Emergency Response', description: 'Initial emergency fund', amount: 50000_000_000, completed: true },
            { id: 'm2', title: 'Treatment Support', description: 'Ongoing treatment support', amount: 30000_000_000, completed: true },
            { id: 'm3', title: 'Recovery Program', description: 'Recovery and rehabilitation', amount: 20000_000_000, completed: false },
        ],
        donorCount: 123,
        viewCount: 2340,
        verified: true,
    },
    {
        id: 'mock_3',
        title: 'Community Garden Project',
        description: 'Create a sustainable community garden for fresh produce and environmental education. This green space will serve as both a food source and learning center.',
        purpose: 'Building food security and environmental awareness through community agriculture.',
        category: 'environment',
        image: '🌱',
        goal: 25000_000_000,
        raised: 8750_000_000,
        createdAt: '2025-11-01T00:00:00Z',
        deadline: '2026-01-30T23:59:59Z',
        updatedAt: '2025-11-27T14:00:00Z',
        creatorAddress: 'addr1qz...km5r',
        status: 'active',
        donations: [],
        milestones: [
            { id: 'm1', title: 'Land Preparation', description: 'Clear and prepare the land', amount: 10000_000_000, completed: false },
            { id: 'm2', title: 'Infrastructure', description: 'Irrigation and paths', amount: 10000_000_000, completed: false },
            { id: 'm3', title: 'Planting', description: 'Seeds and initial planting', amount: 5000_000_000, completed: false },
        ],
        donorCount: 28,
        viewCount: 890,
    },
    {
        id: 'mock_4',
        title: 'Tech Education Initiative',
        description: 'Provide coding workshops and tech resources for underprivileged youth. Empowering the next generation with digital skills.',
        purpose: 'Bridging the digital divide by providing tech education to underserved communities.',
        category: 'technology',
        image: '💻',
        goal: 35000_000_000,
        raised: 21000_000_000,
        createdAt: '2025-10-20T00:00:00Z',
        deadline: '2026-02-15T23:59:59Z',
        updatedAt: '2025-11-26T11:00:00Z',
        creatorAddress: 'addr1qw...ab2c',
        creatorName: 'Tech4All',
        status: 'active',
        donations: [],
        milestones: [
            { id: 'm1', title: 'Equipment Purchase', description: 'Laptops and tablets', amount: 20000_000_000, completed: true },
            { id: 'm2', title: 'Curriculum Development', description: 'Course materials', amount: 5000_000_000, completed: false },
            { id: 'm3', title: 'Workshop Delivery', description: 'Instructor costs', amount: 10000_000_000, completed: false },
        ],
        donorCount: 67,
        viewCount: 1560,
    },
    {
        id: 'mock_5',
        title: 'Animal Shelter Support',
        description: 'Help provide food, medical care, and shelter for rescued animals. Every donation saves lives.',
        purpose: 'Ensuring rescued animals receive proper care while waiting for their forever homes.',
        category: 'animals',
        image: '🐕',
        goal: 15000_000_000,
        raised: 15000_000_000,
        createdAt: '2025-09-01T00:00:00Z',
        deadline: '2025-11-30T23:59:59Z',
        updatedAt: '2025-11-30T00:00:00Z',
        creatorAddress: 'addr1qr...de3f',
        creatorName: 'Paw Sanctuary',
        status: 'completed',
        donations: [],
        milestones: [
            { id: 'm1', title: 'Shelter Upgrades', description: 'New kennels', amount: 8000_000_000, completed: true },
            { id: 'm2', title: 'Medical Fund', description: 'Vet care', amount: 5000_000_000, completed: true },
            { id: 'm3', title: 'Food Supply', description: '6 months of food', amount: 2000_000_000, completed: true },
        ],
        donorCount: 89,
        viewCount: 1890,
        verified: true,
    },
    {
        id: 'mock_6',
        title: 'Clean Water Initiative',
        description: 'Install water purification systems in rural communities. Access to clean water is a fundamental human right.',
        purpose: 'Providing safe drinking water to communities without reliable water infrastructure.',
        category: 'infrastructure',
        image: '💧',
        goal: 75000_000_000,
        raised: 45000_000_000,
        createdAt: '2025-10-15T00:00:00Z',
        deadline: '2026-03-01T23:59:59Z',
        updatedAt: '2025-11-25T09:00:00Z',
        creatorAddress: 'addr1qs...gh4i',
        creatorName: 'Water for All',
        status: 'active',
        donations: [],
        milestones: [
            { id: 'm1', title: 'Survey & Planning', description: 'Community assessment', amount: 5000_000_000, completed: true },
            { id: 'm2', title: 'Equipment Purchase', description: 'Purification systems', amount: 40000_000_000, completed: false },
            { id: 'm3', title: 'Installation', description: 'System installation', amount: 20000_000_000, completed: false },
            { id: 'm4', title: 'Training', description: 'Community training', amount: 10000_000_000, completed: false },
        ],
        donorCount: 156,
        viewCount: 3200,
        featured: true,
    },
];

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useCampaignStore = create<CampaignState>()(
    persist(
        (set, get) => ({
            // Initial State
            campaigns: [],
            filters: defaultFilters,
            isLoading: false,
            error: null,

            // Add Campaign
            addCampaign: (campaignData) => {
                const id = generateCampaignId();
                const now = new Date().toISOString();
                
                const newCampaign: CampaignFull = {
                    ...campaignData,
                    id,
                    raised: 0,
                    donations: [],
                    donorCount: 0,
                    viewCount: 0,
                    updatedAt: now,
                };

                set((state) => ({
                    campaigns: [newCampaign, ...state.campaigns],
                }));

                return id;
            },

            // Update Campaign
            updateCampaign: (id, updates) => {
                set((state) => ({
                    campaigns: state.campaigns.map((campaign) =>
                        campaign.id === id
                            ? { ...campaign, ...updates, updatedAt: new Date().toISOString() }
                            : campaign
                    ),
                }));
            },

            // Delete Campaign
            deleteCampaign: (id) => {
                set((state) => ({
                    campaigns: state.campaigns.filter((campaign) => campaign.id !== id),
                }));
            },

            // Add Donation
            addDonation: (campaignId, donationData) => {
                const donationId = generateDonationId();
                const donation: Donation = {
                    ...donationData,
                    id: donationId,
                };

                set((state) => ({
                    campaigns: state.campaigns.map((campaign) => {
                        if (campaign.id === campaignId) {
                            const newDonations = [donation, ...campaign.donations];
                            const uniqueDonors = new Set(newDonations.map((d) => d.donorAddress));
                            const newRaised = donation.status === 'confirmed' 
                                ? campaign.raised + donation.amount 
                                : campaign.raised;
                            
                            return {
                                ...campaign,
                                donations: newDonations,
                                raised: newRaised,
                                donorCount: uniqueDonors.size,
                                updatedAt: new Date().toISOString(),
                            };
                        }
                        return campaign;
                    }),
                }));
            },

            // Update Donation Status
            updateDonationStatus: (campaignId, donationId, status) => {
                set((state) => ({
                    campaigns: state.campaigns.map((campaign) => {
                        if (campaign.id === campaignId) {
                            let amountDiff = 0;
                            const updatedDonations = campaign.donations.map((donation) => {
                                if (donation.id === donationId) {
                                    // If confirmed, add to raised amount
                                    if (status === 'confirmed' && donation.status !== 'confirmed') {
                                        amountDiff = donation.amount;
                                    }
                                    // If failed, remove from raised amount
                                    if (status === 'failed' && donation.status === 'confirmed') {
                                        amountDiff = -donation.amount;
                                    }
                                    return { ...donation, status };
                                }
                                return donation;
                            });

                            return {
                                ...campaign,
                                donations: updatedDonations,
                                raised: campaign.raised + amountDiff,
                                updatedAt: new Date().toISOString(),
                            };
                        }
                        return campaign;
                    }),
                }));
            },

            // Complete Milestone
            completeMilestone: (campaignId, milestoneId) => {
                set((state) => ({
                    campaigns: state.campaigns.map((campaign) => {
                        if (campaign.id === campaignId) {
                            return {
                                ...campaign,
                                milestones: campaign.milestones.map((milestone) =>
                                    milestone.id === milestoneId
                                        ? { ...milestone, completed: true, completedAt: new Date().toISOString() }
                                        : milestone
                                ),
                                updatedAt: new Date().toISOString(),
                            };
                        }
                        return campaign;
                    }),
                }));
            },

            // Set Filters
            setFilters: (newFilters) => {
                set((state) => ({
                    filters: { ...state.filters, ...newFilters },
                }));
            },

            // Clear Filters
            clearFilters: () => {
                set({ filters: defaultFilters });
            },

            // Get Campaign by ID
            getCampaign: (id) => {
                const { campaigns } = get();
                return campaigns.find((c) => c.id === id);
            },

            // Get Campaigns by Creator
            getCampaignsByCreator: (creatorAddress) => {
                const { campaigns } = get();
                return campaigns.filter((c) => c.creatorAddress === creatorAddress);
            },

            // Get Filtered Campaigns
            getFilteredCampaigns: () => {
                const { campaigns, filters } = get();
                
                let filtered = [...campaigns];

                // Category filter
                if (filters.category) {
                    filtered = filtered.filter((c) => c.category === filters.category);
                }

                // Status filter
                if (filters.status) {
                    filtered = filtered.filter((c) => c.status === filters.status);
                }

                // Search filter
                if (filters.searchQuery) {
                    const query = filters.searchQuery.toLowerCase();
                    filtered = filtered.filter(
                        (c) =>
                            c.title.toLowerCase().includes(query) ||
                            c.description.toLowerCase().includes(query) ||
                            c.creatorName?.toLowerCase().includes(query)
                    );
                }

                // Sort
                switch (filters.sortBy) {
                    case 'newest':
                        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                        break;
                    case 'ending_soon':
                        filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
                        break;
                    case 'most_funded':
                        filtered.sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
                        break;
                    case 'most_donors':
                        filtered.sort((a, b) => b.donorCount - a.donorCount);
                        break;
                }

                return filtered;
            },

            // Get Campaign Stats
            getCampaignStats: (id) => {
                const campaign = get().getCampaign(id);
                if (!campaign) return undefined;

                const now = new Date();
                const deadline = new Date(campaign.deadline);
                const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                const isExpired = deadline < now;
                const confirmedDonations = campaign.donations.filter((d) => d.status === 'confirmed');

                return {
                    totalRaised: campaign.raised,
                    percentageFunded: (campaign.raised / campaign.goal) * 100,
                    daysLeft,
                    donorCount: campaign.donorCount,
                    averageDonation: confirmedDonations.length > 0
                        ? confirmedDonations.reduce((sum, d) => sum + d.amount, 0) / confirmedDonations.length
                        : 0,
                    largestDonation: confirmedDonations.length > 0
                        ? Math.max(...confirmedDonations.map((d) => d.amount))
                        : 0,
                    recentDonations: campaign.donations.slice(0, 10),
                    isFullyFunded: campaign.raised >= campaign.goal,
                    isExpired,
                };
            },

            // Get Donations by Donor
            getDonationsByDonor: (donorAddress) => {
                const { campaigns } = get();
                const results: { campaign: CampaignFull; donation: Donation }[] = [];

                campaigns.forEach((campaign) => {
                    campaign.donations.forEach((donation) => {
                        if (donation.donorAddress === donorAddress) {
                            results.push({ campaign, donation });
                        }
                    });
                });

                return results.sort((a, b) => 
                    new Date(b.donation.timestamp).getTime() - new Date(a.donation.timestamp).getTime()
                );
            },

            // Increment View Count
            incrementViewCount: (id) => {
                set((state) => ({
                    campaigns: state.campaigns.map((campaign) =>
                        campaign.id === id
                            ? { ...campaign, viewCount: campaign.viewCount + 1 }
                            : campaign
                    ),
                }));
            },

            // Initialize with Mock Data
            initializeWithMockData: () => {
                set((state) => {
                    // Only add mock data if we don't have campaigns yet
                    const existingIds = new Set(state.campaigns.map((c) => c.id));
                    const newMockCampaigns = mockCampaigns.filter((c) => !existingIds.has(c.id));
                    
                    return {
                        campaigns: [...state.campaigns, ...newMockCampaigns],
                    };
                });
            },
        }),
        {
            name: 'donatedao-campaigns-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                campaigns: state.campaigns,
                filters: state.filters,
            }),
        }
    )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectAllCampaigns = (state: CampaignState) => state.campaigns;
export const selectFilters = (state: CampaignState) => state.filters;
export const selectActiveCampaigns = (state: CampaignState) => 
    state.campaigns.filter((c) => c.status === 'active');
export const selectFeaturedCampaigns = (state: CampaignState) =>
    state.campaigns.filter((c) => c.featured && c.status === 'active');

export default useCampaignStore;

