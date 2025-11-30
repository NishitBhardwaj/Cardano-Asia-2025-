'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const VerifyIdentityContent = dynamic(() => import('./VerifyIdentityContent'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                    <span className="text-white font-bold text-3xl">₳</span>
                </div>
                <p className="text-foreground/60">Loading Verification...</p>
            </div>
        </div>
    ),
});

export default function VerifyIdentityPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
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

    return <VerifyIdentityContent />;
}

