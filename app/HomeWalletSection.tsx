'use client';

import Link from 'next/link';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useUserStore } from '@/lib/store/userStore';

interface WalletSectionProps {
    section: 'greeting' | 'cta-buttons' | 'user-stats' | 'cta-main';
}

function WalletSectionContent({ section }: WalletSectionProps) {
    const { isAuthenticated, profile } = useAuth();
    const { stats } = useUserStore();

    switch (section) {
        case 'greeting':
            if (!isAuthenticated || !profile) return null;
            return (
                <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm mb-4">
                    <span className="text-xl">{profile.avatar}</span>
                    <span>Welcome back, <strong>{profile.displayName}</strong>!</span>
                </div>
            );

        case 'cta-buttons':
            return isAuthenticated ? (
                <>
                    <Link
                        href="/create"
                        className="gradient-primary px-8 py-4 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                    >
                        Create Campaign
                    </Link>
                    <Link
                        href="/profile"
                        className="glass px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                    >
                        My Dashboard
                    </Link>
                </>
            ) : (
                <>
                    <Link
                        href="/auth"
                        className="gradient-primary px-8 py-4 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                    >
                        Get Started
                    </Link>
                    <Link
                        href="/campaigns"
                        className="glass px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                    >
                        Explore Campaigns
                    </Link>
                </>
            );

        case 'user-stats':
            if (!isAuthenticated || !stats) return null;
            return (
                <section className="container mx-auto px-6 py-8">
                    <div className="glass p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4">Your Impact</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <p className="text-2xl font-bold text-primary">{(stats.totalDonated / 1_000_000).toFixed(0)} ₳</p>
                                <p className="text-sm text-foreground/60">Total Donated</p>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <p className="text-2xl font-bold text-secondary">{stats.campaignsSupported}</p>
                                <p className="text-sm text-foreground/60">Campaigns Supported</p>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <p className="text-2xl font-bold text-accent">{stats.votesCount}</p>
                                <p className="text-sm text-foreground/60">Votes Cast</p>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <p className="text-2xl font-bold">{stats.donationStreak} 🔥</p>
                                <p className="text-sm text-foreground/60">Month Streak</p>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <Link href="/profile" className="text-primary hover:underline text-sm">
                                View full dashboard →
                            </Link>
                        </div>
                    </div>
                </section>
            );

        case 'cta-main':
            return (
                <Link
                    href={isAuthenticated ? "/create" : "/auth"}
                    className="gradient-primary px-10 py-5 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity inline-block shadow-xl shadow-primary/30"
                >
                    {isAuthenticated ? 'Create Campaign' : 'Get Started Now'}
                </Link>
            );

        default:
            return null;
    }
}

export default function HomeWalletSection({ section }: WalletSectionProps) {
    return (
        <MeshProvider>
            <WalletSectionContent section={section} />
        </MeshProvider>
    );
}

