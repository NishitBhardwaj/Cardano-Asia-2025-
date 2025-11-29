'use client';

import { ReactNode, useState, useEffect } from 'react';

interface PageWrapperProps {
    children: ReactNode;
    showLoading?: boolean;
}

function LoadingState() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                    <span className="text-white font-bold text-3xl">₳</span>
                </div>
                <p className="text-foreground/60">Loading DonateDAO...</p>
                <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
                    <div className="h-full w-1/2 gradient-primary animate-pulse" />
                </div>
            </div>
        </div>
    );
}

export default function PageWrapper({ children, showLoading = true }: PageWrapperProps) {
    const [mounted, setMounted] = useState(false);
    const [MeshProvider, setMeshProvider] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        // Dynamically import MeshProvider
        import('@meshsdk/react').then((module) => {
            setMeshProvider(() => module.MeshProvider);
        }).catch(err => {
            console.error('Failed to load MeshProvider:', err);
        });
    }, []);

    if (!mounted && showLoading) {
        return <LoadingState />;
    }

    if (MeshProvider) {
        return (
            <MeshProvider>
                {children}
            </MeshProvider>
        );
    }

    return <>{children}</>;
}

export { LoadingState };
