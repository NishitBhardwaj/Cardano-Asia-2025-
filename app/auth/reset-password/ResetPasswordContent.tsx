'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { isOTPVerified, clearOTP } from '@/lib/utils/otp';
import { hashPassword } from '@/lib/utils/password';
import Header from '@/components/Header';
import { MeshProvider } from '@meshsdk/react';

function ResetPasswordInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Check if OTP was verified for this email
        if (email && isOTPVerified(email, 'password_reset')) {
            setIsAuthorized(true);
        } else {
            // Redirect to forgot password if not authorized
            router.push('/auth/forgot-password');
        }
    }, [email, router]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate password
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            // Get existing users
            const users = JSON.parse(localStorage.getItem('donatedao-users') || '[]');
            const userIndex = users.findIndex((u: any) => 
                u.profile?.email?.toLowerCase() === email.toLowerCase()
            );

            if (userIndex === -1) {
                setError('User not found');
                setIsLoading(false);
                return;
            }

            // Hash new password and update
            const passwordHash = await hashPassword(password);
            users[userIndex].passwordHash = passwordHash;
            localStorage.setItem('donatedao-users', JSON.stringify(users));

            // Clear the OTP
            clearOTP(email, 'password_reset');

            alert('Password reset successfully! You can now login with your new password.');
            router.push('/auth/login');
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthorized) {
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
                <div className="max-w-md mx-auto">
                    <div className="glass p-8 rounded-2xl">
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">🔑</div>
                            <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                            <p className="text-foreground/60">
                                Create a new password for your account
                            </p>
                        </div>

                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Enter new password"
                                />
                                <p className="text-xs text-foreground/60 mt-1">
                                    Minimum 8 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Confirm new password"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full gradient-primary py-4 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link href="/auth/login" className="text-primary hover:underline text-sm">
                                ← Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordContent() {
    return (
        <MeshProvider>
            <ResetPasswordInner />
        </MeshProvider>
    );
}

