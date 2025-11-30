'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import the entire page content to avoid SSR issues with Mesh SDK
const AuthContent = dynamic(() => import('./AuthContent'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                    <span className="text-white font-bold text-3xl">₳</span>
                </div>
                <p className="text-foreground/60">Loading Authentication...</p>
            </div>
        </div>
    ),
});

export default function AuthPage() {
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

    return <AuthContent />;
}
