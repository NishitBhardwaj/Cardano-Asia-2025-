'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamic import the entire page content to avoid SSR issues with Mesh SDK
const CampaignsPageContent = dynamic(() => import('./CampaignsContent'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                    <span className="text-white font-bold text-3xl">₳</span>
                </div>
                <p className="text-foreground/60">Loading Campaigns...</p>
            </div>
        </div>
    ),
});

export default function CampaignsPage() {
    return <CampaignsPageContent />;
}
