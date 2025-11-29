'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUserStore } from '@/lib/store/userStore';
import Header from '@/components/Header';

export default function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { verifyEmail, _hasHydrated, isAuthenticated } = useUserStore();
    
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('token');
            const email = searchParams.get('email');

            if (!token || !email) {
                setStatus('error');
                setMessage('Invalid verification link. Missing token or email.');
                return;
            }

            try {
                await verifyEmail(token);
                setStatus('success');
                setMessage('Email verified successfully!');
                
                // Redirect to profile after 2 seconds
                setTimeout(() => {
                    router.push('/profile');
                }, 2000);
            } catch (error: any) {
                setStatus('error');
                setMessage(error.message || 'Verification failed. The link may have expired.');
            }
        };

        if (_hasHydrated) {
            verify();
        }
    }, [searchParams, verifyEmail, _hasHydrated, router]);

    if (!_hasHydrated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-6 py-12 max-w-md">
                <div className="glass p-8 rounded-2xl text-center space-y-6">
                    {status === 'verifying' && (
                        <>
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                            <h1 className="text-2xl font-bold">Verifying Email</h1>
                            <p className="text-foreground/60">{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="text-6xl mb-4">✓</div>
                            <h1 className="text-2xl font-bold text-green-500">Email Verified!</h1>
                            <p className="text-foreground/60">{message}</p>
                            <p className="text-sm text-foreground/50">Redirecting to profile...</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="text-6xl mb-4">✗</div>
                            <h1 className="text-2xl font-bold text-red-500">Verification Failed</h1>
                            <p className="text-foreground/60">{message}</p>
                            <div className="pt-4 space-y-2">
                                <Link
                                    href="/profile"
                                    className="block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Go to Profile
                                </Link>
                                <Link
                                    href="/auth"
                                    className="block px-6 py-3 glass rounded-lg font-medium hover:bg-primary/20 transition-colors"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

