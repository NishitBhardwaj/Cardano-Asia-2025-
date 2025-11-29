'use client';

import dynamic from 'next/dynamic';

const PageContent = dynamic(() => import('./Content'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                    <span className="text-white font-bold text-3xl">₳</span>
                </div>
                <p className="text-foreground/60">Loading Campaign...</p>
            </div>
        </div>
    ),
});

export default function Page() {
    return <PageContent />;
}
