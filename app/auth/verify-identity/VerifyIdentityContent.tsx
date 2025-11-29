'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import Header from '@/components/Header';
import DocumentVerification from '@/components/DocumentVerification';

function VerifyIdentityInner() {
    const router = useRouter();
    const { isAuthenticated, profile } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth');
        }
    }, [isAuthenticated, router]);

    const handleVerified = () => {
        alert('Identity verified successfully! You can now create campaigns.');
        router.push('/create');
    };

    if (!isAuthenticated || !profile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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

