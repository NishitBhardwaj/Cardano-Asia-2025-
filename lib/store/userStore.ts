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
import { hashPassword, verifyPassword } from '@/lib/utils/password';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UserProfile {
    walletAddress?: string; // Optional - can be added later
    email?: string;
    emailVerified: boolean;
    firstName?: string;
    lastName?: string;
    username?: string;
    displayName: string;
    avatar: string;
    bio: string;
    createdAt: string;
    lastLoginAt: string;
    preferences: UserPreferences;
    authMethod: 'wallet' | 'email' | 'both'; // How user authenticated
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
    _hasHydrated: boolean; // Track if store has loaded from localStorage

    // User Data
    profile: UserProfile | null;
    transactions: UserTransaction[];
    stats: UserStats;
    campaigns: Campaign[]; // User's created campaigns
    supportedCampaigns: Campaign[]; // Campaigns user donated to
    donationRecords: DonationRecord[]; // All donation records

    // Actions
    setHasHydrated: (state: boolean) => void;
    login: (walletAddress: string) => Promise<void>;
    loginWithEmail: (credentials: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        username?: string;
    }) => Promise<void>;
    verifyEmail: (token: string) => Promise<boolean>;
    sendVerificationEmail: () => Promise<void>;
    linkWallet: (walletAddress: string) => Promise<void>;
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

    // Username Management
    checkUsernameAvailability: (username: string) => boolean;
    findUserByUsername: (username: string) => { email?: string; walletAddress?: string; displayName: string } | null;
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
            _hasHydrated: false,
            profile: null,
            transactions: [],
            stats: defaultStats,
            campaigns: [],
            supportedCampaigns: [],
            donationRecords: [],

            // Hydration tracking
            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

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
                                authMethod: existingProfile.email ? 'both' : 'wallet',
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
                            emailVerified: false,
                            authMethod: 'wallet',
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

            // Login with email
            loginWithEmail: async (credentials) => {
                set({ isLoading: true });

                try {
                    // Check if localStorage is available
                    if (typeof window === 'undefined') {
                        throw new Error('Cannot authenticate on server side');
                    }

                    const { email, password, firstName, lastName, username } = credentials;

                    // Check if this is signup (has firstName) or login
                    const isSignup = !!firstName;

                    // Safely access localStorage
                    let existingUsers: any[] = [];
                    try {
                        existingUsers = JSON.parse(localStorage.getItem('donatedao-users') || '[]');
                    } catch {
                        existingUsers = [];
                    }

                    if (isSignup) {
                        // Signup - create new user
                        const userExists = existingUsers.find((u: any) => u.email === email);

                        if (userExists) {
                            throw new Error('Email already registered. Please login instead.');
                        }

                        // Hash password
                        console.log('Signup: Hashing password...');
                        const passwordHash = await hashPassword(password);
                        console.log('Signup: Password hashed successfully, hash length:', passwordHash.length);

                        // Create user profile
                        const displayName = firstName && lastName
                            ? `${firstName} ${lastName}`
                            : username || email.split('@')[0];

                        const newProfile: UserProfile = {
                            email,
                            firstName,
                            lastName,
                            username,
                            displayName,
                            avatar: generateAvatar(email),
                            bio: '',
                            createdAt: new Date().toISOString(),
                            lastLoginAt: new Date().toISOString(),
                            preferences: {
                                ...defaultPreferences,
                                email: email,
                            },
                            emailVerified: false,
                            authMethod: 'email',
                        };

                        // Save user to localStorage (for demo - in production use backend)
                        const newUser = {
                            email,
                            passwordHash,
                            profile: newProfile,
                        };
                        existingUsers.push(newUser);

                        try {
                            localStorage.setItem('donatedao-users', JSON.stringify(existingUsers));
                        } catch (e) {
                            console.error('Failed to save user to localStorage:', e);
                        }

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
                    } else {
                        // Login - verify credentials
                        const user = existingUsers.find((u: any) => u.email === email);

                        if (!user) {
                            console.error('Login failed: User not found for email:', email);
                            throw new Error('Invalid email or password');
                        }

                        console.log('Login attempt: User found, verifying password...');
                        const isValid = await verifyPassword(password, user.passwordHash);
                        console.log('Password verification result:', isValid);

                        if (!isValid) {
                            console.error('Login failed: Password verification failed');
                            throw new Error('Invalid email or password');
                        }

                        // Update last login
                        user.profile.lastLoginAt = new Date().toISOString();
                        const updatedUsers = existingUsers.map((u: any) =>
                            u.email === email ? user : u
                        );

                        try {
                            localStorage.setItem('donatedao-users', JSON.stringify(updatedUsers));
                        } catch (e) {
                            console.error('Failed to update user in localStorage:', e);
                        }

                        // Get the current persisted state to restore user's data
                        const currentState = get();

                        // Check if this user has existing data in the Zustand store
                        // (from previous sessions, preserved after logout)
                        const hasExistingData = currentState.transactions?.length > 0 ||
                            currentState.campaigns?.length > 0 ||
                            currentState.supportedCampaigns?.length > 0;

                        set({
                            isAuthenticated: true,
                            isLoading: false,
                            profile: user.profile,
                            // Preserve existing user data if available, otherwise use defaults
                            transactions: hasExistingData && currentState.profile?.email === email
                                ? currentState.transactions
                                : [],
                            stats: hasExistingData && currentState.profile?.email === email
                                ? currentState.stats
                                : defaultStats,
                            campaigns: hasExistingData && currentState.profile?.email === email
                                ? currentState.campaigns
                                : [],
                            supportedCampaigns: hasExistingData && currentState.profile?.email === email
                                ? currentState.supportedCampaigns
                                : [],
                            donationRecords: hasExistingData && currentState.profile?.email === email
                                ? currentState.donationRecords
                                : [],
                        });
                    }
                } catch (error: any) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            // Link wallet to email account
            linkWallet: async (walletAddress: string) => {
                const profile = get().profile;
                if (!profile) {
                    throw new Error('Not authenticated');
                }

                if (profile.walletAddress) {
                    throw new Error('Wallet already linked');
                }

                // Update profile with wallet
                const updatedProfile: UserProfile = {
                    ...profile,
                    walletAddress,
                    authMethod: 'both',
                };

                // Update in localStorage if email user
                if (profile.email) {
                    const existingUsers = JSON.parse(localStorage.getItem('donatedao-users') || '[]');
                    const userIndex = existingUsers.findIndex((u: any) => u.email === profile.email);
                    if (userIndex !== -1) {
                        existingUsers[userIndex].profile = updatedProfile;
                        localStorage.setItem('donatedao-users', JSON.stringify(existingUsers));
                    }
                }

                set({ profile: updatedProfile });
            },

            // Send verification email
            sendVerificationEmail: async () => {
                const profile = get().profile;
                if (!profile || !profile.email) {
                    throw new Error('No email address found');
                }

                if (profile.emailVerified) {
                    throw new Error('Email already verified');
                }

                // Generate verification token
                const token = crypto.randomUUID();
                const verificationData = {
                    email: profile.email,
                    token,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
                };

                // Store verification token
                localStorage.setItem(`email-verification-${profile.email}`, JSON.stringify(verificationData));

                // In production, send email via API
                // For now, we'll simulate it and show token in console
                console.log('Verification email sent! Token:', token);
                console.log('In production, this would send an email with verification link');

                // For demo: show alert with verification link
                const verificationLink = typeof window !== 'undefined'
                    ? `${window.location.origin}/auth/verify-email?token=${token}&email=${encodeURIComponent(profile.email)}`
                    : `/auth/verify-email?token=${token}&email=${encodeURIComponent(profile.email)}`;
                alert(`Verification link (demo): ${verificationLink}\n\nIn production, this would be sent via email.`);
            },

            // Verify email with token
            verifyEmail: async (token: string) => {
                const profile = get().profile;
                if (!profile || !profile.email) {
                    throw new Error('No email address found');
                }

                const storedData = localStorage.getItem(`email-verification-${profile.email}`);
                if (!storedData) {
                    throw new Error('Invalid or expired verification token');
                }

                const verificationData = JSON.parse(storedData);
                if (verificationData.token !== token) {
                    throw new Error('Invalid verification token');
                }

                if (new Date(verificationData.expiresAt) < new Date()) {
                    localStorage.removeItem(`email-verification-${profile.email}`);
                    throw new Error('Verification token has expired');
                }

                // Mark email as verified
                const updatedProfile: UserProfile = {
                    ...profile,
                    emailVerified: true,
                };

                // Update in localStorage
                if (profile.email) {
                    const existingUsers = JSON.parse(localStorage.getItem('donatedao-users') || '[]');
                    const userIndex = existingUsers.findIndex((u: any) => u.email === profile.email);
                    if (userIndex !== -1) {
                        existingUsers[userIndex].profile = updatedProfile;
                        localStorage.setItem('donatedao-users', JSON.stringify(existingUsers));
                    }
                }

                // Remove verification token
                localStorage.removeItem(`email-verification-${profile.email}`);

                set({ profile: updatedProfile });
                return true;
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

            // Username Management
            checkUsernameAvailability: (username: string) => {
                if (!username || username.length < 3) return false;

                // Check current user's username
                const currentProfile = get().profile;
                if (currentProfile?.username?.toLowerCase() === username.toLowerCase()) {
                    return true; // Same user, available
                }

                // Check all users in localStorage (safely)
                if (typeof window === 'undefined') return true;
                try {
                    const existingUsers = JSON.parse(localStorage.getItem('donatedao-users') || '[]');
                    const usernameExists = existingUsers.some((u: any) =>
                        u.profile?.username?.toLowerCase() === username.toLowerCase()
                    );
                    return !usernameExists;
                } catch {
                    return true;
                }
            },

            findUserByUsername: (username: string) => {
                if (!username) return null;

                // Check current user
                const currentProfile = get().profile;
                if (currentProfile?.username?.toLowerCase() === username.toLowerCase()) {
                    return {
                        email: currentProfile.email,
                        walletAddress: currentProfile.walletAddress,
                        displayName: currentProfile.displayName,
                    };
                }

                // Check all users in localStorage (safely)
                if (typeof window === 'undefined') return null;
                try {
                    const existingUsers = JSON.parse(localStorage.getItem('donatedao-users') || '[]');
                    const user = existingUsers.find((u: any) =>
                        u.profile?.username?.toLowerCase() === username.toLowerCase()
                    );

                    if (user?.profile) {
                        return {
                            email: user.profile.email,
                            walletAddress: user.profile.walletAddress,
                            displayName: user.profile.displayName,
                        };
                    }
                } catch {
                    return null;
                }

                return null;
            },
        }),
        {
            name: 'donatedao-user-storage',
            storage: createJSONStorage(() => {
                // Only use localStorage on client side
                if (typeof window !== 'undefined') {
                    return localStorage;
                }
                // Return a no-op storage for SSR
                return {
                    getItem: () => null,
                    setItem: () => { },
                    removeItem: () => { },
                };
            }),
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                profile: state.profile,
                transactions: state.transactions,
                stats: state.stats,
                campaigns: state.campaigns,
                supportedCampaigns: state.supportedCampaigns,
                donationRecords: state.donationRecords,
            }),
            onRehydrateStorage: () => (state, error) => {
                // Mark store as hydrated when localStorage is loaded
                if (error) {
                    console.error('Error hydrating user store:', error);
                }
                // Always set hydrated to true, even on error
                if (state) {
                    state.setHasHydrated(true);
                }
            },
        }
    )
);

// Set hydrated immediately for SSR/non-persisted scenarios
if (typeof window !== 'undefined') {
    // If localStorage is not available or empty, set hydrated after a short delay
    setTimeout(() => {
        const state = useUserStore.getState();
        if (!state._hasHydrated) {
            state.setHasHydrated(true);
        }
    }, 100);
}

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

