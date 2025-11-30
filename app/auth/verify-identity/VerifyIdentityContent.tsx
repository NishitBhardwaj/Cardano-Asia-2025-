'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useUserStore } from '@/lib/store/userStore';
import Header from '@/components/Header';
import DocumentVerification from '@/components/DocumentVerification';

function VerifyIdentityInner() {
    const router = useRouter();
    const { isAuthenticated, profile, isLoading } = useAuth();
    const { _hasHydrated } = useUserStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Wait for hydration and mount before checking auth
    useEffect(() => {
        if (!mounted || !_hasHydrated) return;
        
        if (!isLoading && !isAuthenticated) {
            router.push('/auth');
        }
    }, [mounted, _hasHydrated, isAuthenticated, isLoading, router]);

    const handleVerified = () => {
        alert('Identity verified successfully! You can now create campaigns.');
        router.push('/create');
    };

    // Show loading while checking auth state
    if (!mounted || !_hasHydrated || isLoading || !isAuthenticated || !profile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                        <span className="text-white font-bold text-3xl">₳</span>
                    </div>
                    <p className="text-foreground/60">Loading...</p>
                </div>
            </div>
        );
    }

    const userId = profile.walletAddress || profile.email || 'unknown';

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-2">Verify Your Identity</h1>
                        <p className="text-foreground/60">
                            Complete identity verification to create campaigns
                        </p>
                    </div>

                    <DocumentVerification
                        userId={userId}
                        onVerified={handleVerified}
                    />
                </div>
            </div>
        </div>
    );
}

export default function VerifyIdentityContent() {
    return (
        <MeshProvider>
            <VerifyIdentityInner />
        </MeshProvider>
    );
}

