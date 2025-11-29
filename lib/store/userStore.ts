/**
 * User Store - Zustand State Management
 * 
 * Manages user authentication, profile data, and transaction history
 * Uses wallet address as unique user identifier (Web3 native auth)
 * 
 * @module lib/store/userStore
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UserProfile {
    walletAddress: string;
    displayName: string;
    avatar: string;
    bio: string;
    createdAt: string;
    lastLoginAt: string;
    preferences: UserPreferences;
}

export interface UserPreferences {
    theme: 'dark' | 'light';
    currency: 'ADA' | 'USD';
    notifications: boolean;
    emailNotifications: boolean;
    email?: string;
}

export interface UserTransaction {
    id: string;
    txHash: string;
    type: 'donation' | 'campaign_created' | 'withdrawal' | 'vote' | 'received';
    amount: number; // in lovelace
    campaignId?: string;
    campaignTitle?: string;
    proposalId?: string;
    proposalTitle?: string;
    timestamp: string;
    status: 'pending' | 'confirmed' | 'failed';
    fee?: number;
    metadata?: Record<string, any>;
}

export interface UserStats {
    totalDonated: number; // in lovelace
    totalReceived: number;
    campaignsCreated: number;
    campaignsSupported: number;
    votesCount: number;
    votingPower: number;
    donationStreak: number; // consecutive months
    rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

export interface Campaign {
    id: string;
    title: string;
    description?: string;
    category?: string;
    goal: number;
    raised: number;
    deadline: string;
    status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'expired';
    createdAt: string;
    image?: string;
    donorCount?: number;
    myDonation?: number; // Amount user donated to this campaign
}

export interface DonationRecord {
    campaignId: string;
    campaignTitle: string;
    amount: number;
    timestamp: string;
    txHash: string;
}

export interface UserState {
    // Auth State
    isAuthenticated: boolean;
    isLoading: boolean;
    
    // User Data
    profile: UserProfile | null;
    transactions: UserTransaction[];
    stats: UserStats;
    campaigns: Campaign[]; // User's created campaigns
    supportedCampaigns: Campaign[]; // Campaigns user donated to
    donationRecords: DonationRecord[]; // All donation records
    
    // Actions
    login: (walletAddress: string) => Promise<void>;
    logout: () => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    updatePreferences: (preferences: Partial<UserPreferences>) => void;
    addTransaction: (transaction: UserTransaction) => void;
    updateTransactionStatus: (txHash: string, status: UserTransaction['status']) => void;
    refreshStats: () => void;
    addCampaign: (campaign: Campaign) => void;
    updateCampaign: (id: string, updates: Partial<Campaign>) => void;
    deleteCampaign: (id: string) => void;
    addSupportedCampaign: (campaign: Campaign) => void;
    updateSupportedCampaign: (id: string, updates: Partial<Campaign>) => void;
    recordDonation: (record: DonationRecord) => void;
    
    // Computed
    getRecentTransactions: (limit?: number) => UserTransaction[];
    getTransactionsByType: (type: UserTransaction['type']) => UserTransaction[];
    getDonationHistory: () => { month: string; amount: number }[];
    getCampaign: (id: string) => Campaign | undefined;
    getTotalDonatedToCampaign: (campaignId: string) => number;
    getActiveCampaigns: () => Campaign[];
    getCompletedCampaigns: () => Campaign[];
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const defaultStats: UserStats = {
    totalDonated: 0,
    totalReceived: 0,
    campaignsCreated: 0,
    campaignsSupported: 0,
    votesCount: 0,
    votingPower: 0,
    donationStreak: 0,
    rank: 'bronze',
};

const defaultPreferences: UserPreferences = {
    theme: 'dark',
    currency: 'ADA',
    notifications: true,
    emailNotifications: false,
};

// ============================================================================
// AVATAR GENERATOR
// ============================================================================

function generateAvatar(address: string): string {
    // Generate a consistent emoji avatar based on address hash
    const avatars = ['🦊', '🐸', '🦁', '🐼', '🦄', '🐲', '🦅', '🐺', '🦋', '🐬', 
                     '🦈', '🐙', '🦩', '🦚', '🦜', '🐢', '🦎', '🐍', '🦖', '🦕'];
    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatars[hash % avatars.length];
}

function generateDisplayName(address: string): string {
    return `User_${address.slice(-8)}`;
}

function calculateRank(totalDonated: number): UserStats['rank'] {
    const adaDonated = totalDonated / 1_000_000;
    if (adaDonated >= 10000) return 'diamond';
    if (adaDonated >= 5000) return 'platinum';
    if (adaDonated >= 1000) return 'gold';
    if (adaDonated >= 100) return 'silver';
    return 'bronze';
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            // Initial State
            isAuthenticated: false,
            isLoading: false,
            profile: null,
            transactions: [],
            stats: defaultStats,
            campaigns: [],
            supportedCampaigns: [],
            donationRecords: [],

            // Login with wallet
            login: async (walletAddress: string) => {
                set({ isLoading: true });
                
                try {
                    // Check if user exists in local storage
                    const existingProfile = get().profile;
                    
                    if (existingProfile && existingProfile.walletAddress === walletAddress) {
                        // Existing user - update last login
                        set({
                            isAuthenticated: true,
                            isLoading: false,
                            profile: {
                                ...existingProfile,
                                lastLoginAt: new Date().toISOString(),
                            },
                        });
                    } else {
                        // New user - create profile
                        const newProfile: UserProfile = {
                            walletAddress,
                            displayName: generateDisplayName(walletAddress),
                            avatar: generateAvatar(walletAddress),
                            bio: '',
                            createdAt: new Date().toISOString(),
                            lastLoginAt: new Date().toISOString(),
                            preferences: defaultPreferences,
                        };
                        
                        set({
                            isAuthenticated: true,
                            isLoading: false,
                            profile: newProfile,
                            transactions: [],
                            stats: defaultStats,
                            campaigns: [],
                            supportedCampaigns: [],
                            donationRecords: [],
                        });
                    }
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            // Logout
            logout: () => {
                set({
                    isAuthenticated: false,
                    profile: null,
                    // Keep transactions and stats for when user logs back in
                });
            },

            // Update Profile
            updateProfile: (updates) => {
                const profile = get().profile;
                if (!profile) return;
                
                set({
                    profile: { ...profile, ...updates },
                });
            },

            // Update Preferences
            updatePreferences: (preferences) => {
                const profile = get().profile;
                if (!profile) return;
                
                set({
                    profile: {
                        ...profile,
                        preferences: { ...profile.preferences, ...preferences },
                    },
                });
            },

            // Add Transaction
            addTransaction: (transaction) => {
                set((state) => ({
                    transactions: [transaction, ...state.transactions],
                }));
                
                // Refresh stats after adding transaction
                get().refreshStats();
            },

            // Update Transaction Status
            updateTransactionStatus: (txHash, status) => {
                set((state) => ({
                    transactions: state.transactions.map((tx) =>
                        tx.txHash === txHash ? { ...tx, status } : tx
                    ),
                }));
            },

            // Refresh Stats
            refreshStats: () => {
                const { transactions, campaigns, supportedCampaigns } = get();
                
                const donationTxs = transactions.filter(
                    (tx) => tx.type === 'donation' && tx.status === 'confirmed'
                );
                const receivedTxs = transactions.filter(
                    (tx) => tx.type === 'received' && tx.status === 'confirmed'
                );
                const voteTxs = transactions.filter(
                    (tx) => tx.type === 'vote' && tx.status === 'confirmed'
                );
                
                const totalDonated = donationTxs.reduce((sum, tx) => sum + tx.amount, 0);
                const totalReceived = receivedTxs.reduce((sum, tx) => sum + tx.amount, 0);
                
                // Calculate donation streak (simplified)
                const donationStreak = calculateDonationStreak(donationTxs);
                
                set({
                    stats: {
                        totalDonated,
                        totalReceived,
                        campaignsCreated: campaigns.length,
                        campaignsSupported: supportedCampaigns.length,
                        votesCount: voteTxs.length,
                        votingPower: totalDonated, // 1 ADA = 1 vote
                        donationStreak,
                        rank: calculateRank(totalDonated),
                    },
                });
            },

            // Add Campaign
            addCampaign: (campaign) => {
                set((state) => ({
                    campaigns: [campaign, ...state.campaigns],
                }));
                get().refreshStats();
            },

            // Update Campaign
            updateCampaign: (id, updates) => {
                set((state) => ({
                    campaigns: state.campaigns.map((campaign) =>
                        campaign.id === id ? { ...campaign, ...updates } : campaign
                    ),
                }));
            },

            // Delete Campaign
            deleteCampaign: (id) => {
                set((state) => ({
                    campaigns: state.campaigns.filter((campaign) => campaign.id !== id),
                }));
                get().refreshStats();
            },

            // Add Supported Campaign
            addSupportedCampaign: (campaign) => {
                set((state) => {
                    // Check if already exists
                    const existingIndex = state.supportedCampaigns.findIndex((c) => c.id === campaign.id);
                    if (existingIndex >= 0) {
                        // Update existing campaign with new donation info
                        const updated = [...state.supportedCampaigns];
                        updated[existingIndex] = {
                            ...updated[existingIndex],
                            ...campaign,
                            myDonation: (updated[existingIndex].myDonation || 0) + (campaign.myDonation || 0),
                        };
                        return { supportedCampaigns: updated };
                    }
                    return {
                        supportedCampaigns: [campaign, ...state.supportedCampaigns],
                    };
                });
                get().refreshStats();
            },

            // Update Supported Campaign
            updateSupportedCampaign: (id, updates) => {
                set((state) => ({
                    supportedCampaigns: state.supportedCampaigns.map((campaign) =>
                        campaign.id === id ? { ...campaign, ...updates } : campaign
                    ),
                }));
            },

            // Record Donation
            recordDonation: (record) => {
                set((state) => ({
                    donationRecords: [record, ...state.donationRecords],
                }));
            },

            // Get Recent Transactions
            getRecentTransactions: (limit = 10) => {
                return get().transactions.slice(0, limit);
            },

            // Get Transactions By Type
            getTransactionsByType: (type) => {
                return get().transactions.filter((tx) => tx.type === type);
            },

            // Get Donation History (for charts)
            getDonationHistory: () => {
                const transactions = get().transactions.filter(
                    (tx) => tx.type === 'donation' && tx.status === 'confirmed'
                );
                
                // Group by month
                const monthlyData: Record<string, number> = {};
                
                transactions.forEach((tx) => {
                    const date = new Date(tx.timestamp);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + tx.amount;
                });
                
                // Convert to array and sort
                return Object.entries(monthlyData)
                    .map(([month, amount]) => ({ month, amount }))
                    .sort((a, b) => a.month.localeCompare(b.month))
                    .slice(-12); // Last 12 months
            },

            // Get Campaign by ID
            getCampaign: (id) => {
                const { campaigns } = get();
                return campaigns.find((c) => c.id === id);
            },

            // Get Total Donated to Campaign
            getTotalDonatedToCampaign: (campaignId) => {
                const { donationRecords } = get();
                return donationRecords
                    .filter((r) => r.campaignId === campaignId)
                    .reduce((sum, r) => sum + r.amount, 0);
            },

            // Get Active Campaigns
            getActiveCampaigns: () => {
                const { campaigns } = get();
                return campaigns.filter((c) => c.status === 'active');
            },

            // Get Completed Campaigns
            getCompletedCampaigns: () => {
                const { campaigns } = get();
                return campaigns.filter((c) => c.status === 'completed');
            },
        }),
        {
            name: 'donatedao-user-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                profile: state.profile,
                transactions: state.transactions,
                stats: state.stats,
                campaigns: state.campaigns,
                supportedCampaigns: state.supportedCampaigns,
                donationRecords: state.donationRecords,
            }),
        }
    )
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateDonationStreak(donations: UserTransaction[]): number {
    if (donations.length === 0) return 0;
    
    const now = new Date();
    const months = new Set<string>();
    
    donations.forEach((tx) => {
        const date = new Date(tx.timestamp);
        months.add(`${date.getFullYear()}-${date.getMonth()}`);
    });
    
    let streak = 0;
    let checkMonth = now.getMonth();
    let checkYear = now.getFullYear();
    
    for (let i = 0; i < 12; i++) {
        const key = `${checkYear}-${checkMonth}`;
        if (months.has(key)) {
            streak++;
            checkMonth--;
            if (checkMonth < 0) {
                checkMonth = 11;
                checkYear--;
            }
        } else {
            break;
        }
    }
    
    return streak;
}

// ============================================================================
// SELECTORS (for optimized re-renders)
// ============================================================================

export const selectIsAuthenticated = (state: UserState) => state.isAuthenticated;
export const selectProfile = (state: UserState) => state.profile;
export const selectStats = (state: UserState) => state.stats;
export const selectTransactions = (state: UserState) => state.transactions;
export const selectCampaigns = (state: UserState) => state.campaigns;

export default useUserStore;

