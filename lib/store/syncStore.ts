/**
 * Store Sync Utilities
 * 
 * Provides utilities to sync data between userStore and campaignStore
 * ensuring all user data is properly connected across the application.
 * 
 * @module lib/store/syncStore
 */

import { useUserStore, UserTransaction, Campaign as UserCampaign, DonationRecord } from './userStore';
import { useCampaignStore, CampaignFull, Donation } from './campaignStore';

// ============================================================================
// SYNC FUNCTIONS
// ============================================================================

/**
 * Sync user donations to campaign store
 * This ensures that when a user makes a donation, it's reflected in both stores
 */
export function syncDonationToCampaign(
    campaignId: string,
    donation: {
        donorAddress: string;
        donorName?: string;
        amount: number;
        txHash: string;
        message?: string;
    }
): void {
    const { addDonation } = useCampaignStore.getState();
    
    addDonation(campaignId, {
        donorAddress: donation.donorAddress,
        donorName: donation.donorName,
        amount: donation.amount,
        txHash: donation.txHash,
        timestamp: new Date().toISOString(),
        status: 'confirmed',
        message: donation.message,
    });
}

/**
 * Sync user campaign to global campaign store
 * This ensures user-created campaigns appear in the global list
 */
export function syncUserCampaignToGlobal(
    userCampaign: UserCampaign,
    additionalData?: Partial<CampaignFull>
): string {
    const { addCampaign, getCampaign } = useCampaignStore.getState();
    const { profile } = useUserStore.getState();
    
    // Check if campaign already exists
    const existing = getCampaign(userCampaign.id);
    if (existing) {
        return existing.id;
    }
    
    // Create full campaign data
    const newCampaignId = addCampaign({
        title: userCampaign.title,
        description: userCampaign.description || '',
        purpose: additionalData?.purpose || userCampaign.description || '',
        category: (userCampaign.category as CampaignFull['category']) || 'other',
        image: userCampaign.image || '',
        goal: userCampaign.goal,
        createdAt: userCampaign.createdAt,
        deadline: userCampaign.deadline,
        creatorAddress: profile?.walletAddress || '',
        creatorName: profile?.displayName,
        status: userCampaign.status as CampaignFull['status'],
        milestones: additionalData?.milestones || [],
        tags: additionalData?.tags,
        ...additionalData,
    });
    
    return newCampaignId;
}

/**
 * Get all donations for a user across all campaigns
 */
export function getUserDonationHistory(walletAddress: string): {
    campaign: CampaignFull;
    donation: Donation;
}[] {
    const { getDonationsByDonor } = useCampaignStore.getState();
    return getDonationsByDonor(walletAddress);
}

/**
 * Calculate user's total donations across all campaigns
 */
export function calculateUserTotalDonations(walletAddress: string): number {
    const donations = getUserDonationHistory(walletAddress);
    return donations.reduce((total, { donation }) => {
        if (donation.status === 'confirmed') {
            return total + donation.amount;
        }
        return total;
    }, 0);
}

/**
 * Get user's campaigns with their full details from global store
 */
export function getUserCampaignsWithDetails(walletAddress: string): CampaignFull[] {
    const { getCampaignsByCreator } = useCampaignStore.getState();
    return getCampaignsByCreator(walletAddress);
}

/**
 * Sync all user data from campaign store
 * Call this when user logs in to ensure their data is in sync
 */
export function syncUserDataFromCampaigns(walletAddress: string): void {
    const { 
        addCampaign: addUserCampaign,
        addSupportedCampaign,
        addTransaction,
        refreshStats,
    } = useUserStore.getState();
    
    const { 
        getCampaignsByCreator, 
        getDonationsByDonor,
        campaigns,
    } = useCampaignStore.getState();
    
    // Sync user's created campaigns
    const userCampaigns = getCampaignsByCreator(walletAddress);
    userCampaigns.forEach(campaign => {
        addUserCampaign({
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            category: campaign.category,
            goal: campaign.goal,
            raised: campaign.raised,
            deadline: campaign.deadline,
            status: campaign.status,
            createdAt: campaign.createdAt,
            image: campaign.image,
            donorCount: campaign.donorCount,
        });
    });
    
    // Sync user's donations (supported campaigns)
    const donations = getDonationsByDonor(walletAddress);
    const supportedCampaignIds = new Set<string>();
    
    donations.forEach(({ campaign, donation }) => {
        if (!supportedCampaignIds.has(campaign.id)) {
            supportedCampaignIds.add(campaign.id);
            
            // Calculate total donated to this campaign by user
            const totalDonated = donations
                .filter(d => d.campaign.id === campaign.id)
                .reduce((sum, d) => sum + d.donation.amount, 0);
            
            addSupportedCampaign({
                id: campaign.id,
                title: campaign.title,
                description: campaign.description,
                category: campaign.category,
                goal: campaign.goal,
                raised: campaign.raised,
                deadline: campaign.deadline,
                status: campaign.status,
                createdAt: campaign.createdAt,
                image: campaign.image,
                donorCount: campaign.donorCount,
                myDonation: totalDonated,
            });
        }
        
        // Add transaction record
        addTransaction({
            id: `tx_${donation.id}`,
            txHash: donation.txHash,
            type: 'donation',
            amount: donation.amount,
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            timestamp: donation.timestamp,
            status: donation.status,
        });
    });
    
    // Refresh stats after syncing
    refreshStats();
}

// ============================================================================
// REACT HOOK FOR SYNC
// ============================================================================

import { useEffect, useCallback } from 'react';

/**
 * Hook to use sync functionality in components
 */
export function useDataSync() {
    const { profile, isAuthenticated } = useUserStore();
    const { initializeWithMockData } = useCampaignStore();
    
    // Initialize campaign data
    useEffect(() => {
        initializeWithMockData();
    }, [initializeWithMockData]);
    
    // Sync user data when authenticated
    useEffect(() => {
        if (isAuthenticated && profile?.walletAddress) {
            syncUserDataFromCampaigns(profile.walletAddress);
        }
    }, [isAuthenticated, profile?.walletAddress]);
    
    const syncDonation = useCallback((
        campaignId: string,
        donation: Parameters<typeof syncDonationToCampaign>[1]
    ) => {
        syncDonationToCampaign(campaignId, donation);
    }, []);
    
    const syncCampaign = useCallback((
        campaign: UserCampaign,
        additionalData?: Partial<CampaignFull>
    ) => {
        return syncUserCampaignToGlobal(campaign, additionalData);
    }, []);
    
    const getUserHistory = useCallback(() => {
        if (!profile?.walletAddress) return [];
        return getUserDonationHistory(profile.walletAddress);
    }, [profile?.walletAddress]);
    
    const getUserTotal = useCallback(() => {
        if (!profile?.walletAddress) return 0;
        return calculateUserTotalDonations(profile.walletAddress);
    }, [profile?.walletAddress]);
    
    const getUserCampaigns = useCallback(() => {
        if (!profile?.walletAddress) return [];
        return getUserCampaignsWithDetails(profile.walletAddress);
    }, [profile?.walletAddress]);
    
    return {
        syncDonation,
        syncCampaign,
        getUserHistory,
        getUserTotal,
        getUserCampaigns,
    };
}

export default useDataSync;

