'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hashPassword } from '@/lib/utils/password';
import { saveVerificationData } from '@/lib/verification/documentVerifier';

// Admin Account Details
const ADMIN_EMAIL = 'admin@donatedao.io';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_FIRSTNAME = 'Admin';
const ADMIN_LASTNAME = 'User';
const ADMIN_USERNAME = 'admin';
const ADMIN_WALLET = 'addr1q8gc0kzz496lhjavkyx4hydn9tpnd58a876d44uuwty59hymqzc3s3a2c3thyrle46n6ty5zmfsqc4jrhxhdtgmt8cgsushahj';

export default function SetupAdminPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'creating' | 'success' | 'error'>('creating');
    const [message, setMessage] = useState('Creating admin account...');

    useEffect(() => {
        async function createAdmin() {
            try {
                // Hash password
                const passwordHash = await hashPassword(ADMIN_PASSWORD);
                
                // Get existing users
                let existingUsers: any[] = [];
                try {
                    existingUsers = JSON.parse(localStorage.getItem('donatedao-users') || '[]');
                } catch {
                    existingUsers = [];
                }
                
                // Check if admin exists
                const adminIndex = existingUsers.findIndex((u: any) => u.email === ADMIN_EMAIL);
                
                const adminProfile = {
                    email: ADMIN_EMAIL,
                    emailVerified: true,
                    firstName: ADMIN_FIRSTNAME,
                    lastName: ADMIN_LASTNAME,
                    username: ADMIN_USERNAME,
                    displayName: `${ADMIN_FIRSTNAME} ${ADMIN_LASTNAME}`,
                    avatar: '👑',
                    bio: 'DonateDAO Administrator',
                    walletAddress: ADMIN_WALLET,
                    createdAt: new Date().toISOString(),
                    lastLoginAt: new Date().toISOString(),
                    preferences: {
                        theme: 'dark' as const,
                        currency: 'ADA' as const,
                        notifications: true,
                        emailNotifications: true,
                        email: ADMIN_EMAIL,
                    },
                    authMethod: 'both' as const,
                };
                
                const adminUser = {
                    email: ADMIN_EMAIL,
                    passwordHash,
                    firstName: ADMIN_FIRSTNAME,
                    lastName: ADMIN_LASTNAME,
                    username: ADMIN_USERNAME,
                    walletAddress: ADMIN_WALLET,
                    profile: adminProfile,
                };
                
                if (adminIndex >= 0) {
                    // Update existing
                    existingUsers[adminIndex] = adminUser;
                    setMessage('Admin account updated successfully!');
                } else {
                    // Create new
                    existingUsers.push(adminUser);
                    setMessage('Admin account created successfully!');
                }
                
                // Save users
                localStorage.setItem('donatedao-users', JSON.stringify(existingUsers));
                
                // Set verification status
                const verificationData = JSON.parse(localStorage.getItem('donatedao-verification') || '{}');
                verificationData[ADMIN_EMAIL] = {
                    status: 'verified',
                    documentType: 'passport',
                    attempts: 1,
                    verifiedAt: new Date().toISOString(),
                };
                localStorage.setItem('donatedao-verification', JSON.stringify(verificationData));
                
                setStatus('success');
                
                // Auto-redirect after 3 seconds
                setTimeout(() => {
                    router.push('/auth');
                }, 3000);
                
            } catch (error: any) {
                console.error('Error creating admin:', error);
                setStatus('error');
                setMessage(`Error: ${error.message || 'Failed to create admin account'}`);
            }
        }
        
        createAdmin();
    }, [router]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full glass p-8 rounded-2xl text-center space-y-6">
                {status === 'creating' && (
                    <>
                        <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <span className="text-white text-2xl">👑</span>
                        </div>
                        <h1 className="text-2xl font-bold">Creating Admin Account</h1>
                        <p className="text-foreground/70">{message}</p>
                        <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                        </div>
                    </>
                )}
                
                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-white text-3xl">✓</span>
                        </div>
                        <h1 className="text-2xl font-bold text-green-400">Admin Account Created!</h1>
                        <div className="space-y-3 text-left bg-white/5 p-4 rounded-xl">
                            <p className="text-sm"><strong>Email:</strong> {ADMIN_EMAIL}</p>
                            <p className="text-sm"><strong>Password:</strong> {ADMIN_PASSWORD}</p>
                            <p className="text-sm"><strong>Username:</strong> {ADMIN_USERNAME}</p>
                            <p className="text-sm"><strong>Status:</strong> <span className="text-green-400">✅ Verified</span></p>
                        </div>
                        <p className="text-foreground/70">Redirecting to login page...</p>
                        <button
                            onClick={() => router.push('/auth')}
                            className="w-full gradient-primary text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            Go to Login
                        </button>
                    </>
                )}
                
                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-white text-3xl">✗</span>
                        </div>
                        <h1 className="text-2xl font-bold text-red-400">Error</h1>
                        <p className="text-foreground/70">{message}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full gradient-primary text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            Try Again
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

