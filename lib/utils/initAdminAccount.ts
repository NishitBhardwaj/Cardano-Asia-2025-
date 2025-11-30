/**
 * Automatic Admin Account Initialization
 * 
 * This function automatically creates a pre-verified admin account
 * on app load if it doesn't exist. This ensures the admin account
 * is always available for testing.
 */

import { hashPassword } from './password';
import { saveVerificationData } from '@/lib/verification/documentVerifier';

export const ADMIN_CREDENTIALS = {
    email: 'admin@donatedao.io',
    password: 'Admin@1234',
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin',
    walletAddress: 'addr1q8gc0kzz496lhjavkyx4hydn9tpnd58a876d44uuwty59hymqzc3s3a2c3thyrle46n6ty5zmfsqc4jrhxhdtgmt8cgsushahj',
};

/**
 * Initialize admin account automatically
 * This runs once when the app loads
 */
export async function initializeAdminAccount(): Promise<boolean> {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        // Get existing users
        let existingUsers: any[] = [];
        try {
            const usersData = localStorage.getItem('donatedao-users');
            existingUsers = usersData ? JSON.parse(usersData) : [];
        } catch (e) {
            existingUsers = [];
        }

        // Check if admin already exists
        const adminExists = existingUsers.find((u: any) => u.email === ADMIN_CREDENTIALS.email);

        if (adminExists) {
            // Admin exists - always update password hash and ensure all fields are correct
            const adminIndex = existingUsers.findIndex((u: any) => u.email === ADMIN_CREDENTIALS.email);
            const admin = existingUsers[adminIndex];

            // Always update password hash to ensure it matches
            const passwordHash = await hashPassword(ADMIN_CREDENTIALS.password);

            // Update admin with latest credentials
            existingUsers[adminIndex] = {
                ...admin,
                passwordHash, // Always update password hash
                firstName: ADMIN_CREDENTIALS.firstName,
                lastName: ADMIN_CREDENTIALS.lastName,
                username: ADMIN_CREDENTIALS.username,
                walletAddress: ADMIN_CREDENTIALS.walletAddress,
                profile: {
                    ...admin.profile,
                    email: ADMIN_CREDENTIALS.email,
                    emailVerified: true,
                    firstName: ADMIN_CREDENTIALS.firstName,
                    lastName: ADMIN_CREDENTIALS.lastName,
                    username: ADMIN_CREDENTIALS.username,
                    displayName: `${ADMIN_CREDENTIALS.firstName} ${ADMIN_CREDENTIALS.lastName}`,
                    avatar: '👑',
                    bio: 'DonateDAO Administrator',
                    walletAddress: ADMIN_CREDENTIALS.walletAddress,
                    preferences: {
                        theme: 'dark',
                        currency: 'ADA',
                        notifications: true,
                        emailNotifications: true,
                        email: ADMIN_CREDENTIALS.email,
                    },
                    authMethod: 'both',
                },
            };
            localStorage.setItem('donatedao-users', JSON.stringify(existingUsers));

            // Ensure verification is set for BOTH email AND wallet address
            const verificationData = JSON.parse(localStorage.getItem('donatedao-verification') || '{}');
            const verificationStatus = {
                status: 'verified' as const,
                documentType: 'passport' as const,
                attempts: 1,
                verifiedAt: new Date().toISOString(),
            };
            
            // Save verification for email
            if (!verificationData[ADMIN_CREDENTIALS.email] || verificationData[ADMIN_CREDENTIALS.email].status !== 'verified') {
                saveVerificationData(ADMIN_CREDENTIALS.email, verificationStatus);
            }
            
            // Save verification for wallet address (so it works when wallet is checked first)
            if (!verificationData[ADMIN_CREDENTIALS.walletAddress] || verificationData[ADMIN_CREDENTIALS.walletAddress].status !== 'verified') {
                saveVerificationData(ADMIN_CREDENTIALS.walletAddress, verificationStatus);
            }

            console.log('✅ Admin account updated with verification for both email and wallet');
            return true;
        }

        // Create new admin account
        const passwordHash = await hashPassword(ADMIN_CREDENTIALS.password);

        const adminUser = {
            email: ADMIN_CREDENTIALS.email,
            passwordHash,
            firstName: ADMIN_CREDENTIALS.firstName,
            lastName: ADMIN_CREDENTIALS.lastName,
            username: ADMIN_CREDENTIALS.username,
            walletAddress: ADMIN_CREDENTIALS.walletAddress,
            profile: {
                email: ADMIN_CREDENTIALS.email,
                emailVerified: true,
                firstName: ADMIN_CREDENTIALS.firstName,
                lastName: ADMIN_CREDENTIALS.lastName,
                username: ADMIN_CREDENTIALS.username,
                displayName: `${ADMIN_CREDENTIALS.firstName} ${ADMIN_CREDENTIALS.lastName}`,
                avatar: '👑',
                bio: 'DonateDAO Administrator',
                walletAddress: ADMIN_CREDENTIALS.walletAddress,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                preferences: {
                    theme: 'dark',
                    currency: 'ADA',
                    notifications: true,
                    emailNotifications: true,
                    email: ADMIN_CREDENTIALS.email,
                },
                authMethod: 'both' as const,
            },
        };

        existingUsers.push(adminUser);
        localStorage.setItem('donatedao-users', JSON.stringify(existingUsers));

        // Set verification status for BOTH email AND wallet address
        const verificationStatus = {
            status: 'verified' as const,
            documentType: 'passport' as const,
            attempts: 1,
            verifiedAt: new Date().toISOString(),
        };
        
        // Save verification for email
        saveVerificationData(ADMIN_CREDENTIALS.email, verificationStatus);
        
        // Save verification for wallet address (so it works when wallet is checked first)
        saveVerificationData(ADMIN_CREDENTIALS.walletAddress, verificationStatus);

        console.log('✅ Admin account initialized automatically with verification for both email and wallet');
        return true;
    } catch (error: any) {
        console.error('❌ Failed to initialize admin account:', error);
        return false;
    }
}

