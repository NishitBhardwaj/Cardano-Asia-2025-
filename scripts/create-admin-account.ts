/**
 * Create Pre-Verified Admin Account
 * 
 * This script creates an admin account that is already verified
 * so you can test campaign creation without going through verification
 * 
 * Run this in browser console or as a one-time setup
 */

import { hashPassword } from '@/lib/utils/password';
import { saveVerificationData } from '@/lib/verification/documentVerifier';

// Admin Account Details
export const ADMIN_CREDENTIALS = {
    email: 'admin@donatedao.io',
    password: 'Admin@1234', // Change this after first login
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin',
    walletAddress: 'addr1q8gc0kzz496lhjavkyx4hydn9tpnd58a876d44uuwty59hymqzc3s3a2c3thyrle46n6ty5zmfsqc4jrhxhdtgmt8cgsushahj', // Test wallet
};

/**
 * Create admin account in localStorage
 */
export async function createAdminAccount() {
    if (typeof window === 'undefined') {
        console.error('This script must run in the browser');
        return;
    }

    try {
        // Hash password
        const passwordHash = await hashPassword(ADMIN_CREDENTIALS.password);
        
        // Get existing users
        const existingUsers = JSON.parse(localStorage.getItem('donatedao-users') || '[]');
        
        // Check if admin already exists
        const adminExists = existingUsers.find((u: any) => u.email === ADMIN_CREDENTIALS.email);
        
        if (adminExists) {
            console.log('Admin account already exists. Updating...');
            // Update existing admin
            const adminIndex = existingUsers.findIndex((u: any) => u.email === ADMIN_CREDENTIALS.email);
            existingUsers[adminIndex] = {
                ...existingUsers[adminIndex],
                passwordHash,
                firstName: ADMIN_CREDENTIALS.firstName,
                lastName: ADMIN_CREDENTIALS.lastName,
                username: ADMIN_CREDENTIALS.username,
                walletAddress: ADMIN_CREDENTIALS.walletAddress,
                profile: {
                    ...existingUsers[adminIndex].profile,
                    email: ADMIN_CREDENTIALS.email,
                    emailVerified: true,
                    firstName: ADMIN_CREDENTIALS.firstName,
                    lastName: ADMIN_CREDENTIALS.lastName,
                    username: ADMIN_CREDENTIALS.username,
                    displayName: `${ADMIN_CREDENTIALS.firstName} ${ADMIN_CREDENTIALS.lastName}`,
                    walletAddress: ADMIN_CREDENTIALS.walletAddress,
                },
            };
        } else {
            // Create new admin
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
        }
        
        // Save users
        localStorage.setItem('donatedao-users', JSON.stringify(existingUsers));
        
        // Set verification status
        const userId = ADMIN_CREDENTIALS.email; // Use email as userId
        saveVerificationData(userId, {
            status: 'verified',
            documentType: 'passport',
            attempts: 1,
            verifiedAt: new Date().toISOString(),
        });
        
        console.log('✅ Admin account created successfully!');
        console.log('📧 Email:', ADMIN_CREDENTIALS.email);
        console.log('🔑 Password:', ADMIN_CREDENTIALS.password);
        console.log('👤 Username:', ADMIN_CREDENTIALS.username);
        console.log('✅ Verification: Already verified');
        console.log('💼 Wallet:', ADMIN_CREDENTIALS.walletAddress);
        
        return {
            success: true,
            credentials: ADMIN_CREDENTIALS,
        };
    } catch (error: any) {
        console.error('❌ Failed to create admin account:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    // Make it available globally
    (window as any).createAdminAccount = createAdminAccount;
    console.log('💡 Run createAdminAccount() in console to create admin account');
}

