'use client';

import Link from 'next/link';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useUserStore } from '@/lib/store/userStore';

interface WalletSectionProps {
    section: 'greeting' | 'cta-buttons' | 'user-stats' | 'cta-main' | 'badge';
}

function WalletSectionContent({ section }: WalletSectionProps) {
    const { isAuthenticated, profile } = useAuth();
    const { stats } = useUserStore();

    switch (section) {
        case 'greeting':
            if (!isAuthenticated || !profile) return null;
            return (
                <div className="space-y-4 mb-6">
                    <div className="inline-flex items-center gap-3 glass-hover px-5 py-3 rounded-2xl animate-fade-in">
                        <span className="text-2xl animate-bounce-subtle">{profile.avatar}</span>
                        <span className="text-foreground/80">Welcome back, <strong className="text-gradient">{profile.displayName}</strong>!</span>
                        <span className="badge badge-accent text-xs">{stats.rank}</span>
                    </div>
                    {/* Badge below welcome message */}
                    <div className="inline-flex items-center gap-2 badge-primary animate-fade-in">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span>Built on Cardano Blockchain</span>
                    </div>
                </div>
            );

        case 'badge':
            // Only show badge if user is NOT logged in (logged-in users see it in greeting)
            if (isAuthenticated) return null;
            return (
                <div className="inline-flex items-center gap-2 badge-primary animate-fade-in">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span>Built on Cardano Blockchain</span>
                </div>
            );

        case 'cta-buttons':
            return isAuthenticated ? (
                <>
                    <Link
                        href="/create"
                        className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                    >
                        <span>✨</span> Create Campaign
                    </Link>
                    <Link
                        href="/profile"
                        className="btn-secondary text-lg px-8 py-4 flex items-center gap-2"
                    >
                        <span>📊</span> My Dashboard
                    </Link>
                </>
            ) : (
                <>
                    <Link
                        href="/auth"
                        className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                    >
                        Get Started
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                    <Link
                        href="/campaigns"
                        className="btn-secondary text-lg px-8 py-4"
                    >
                        Explore Campaigns
                    </Link>
                </>
            );

        case 'user-stats':
            if (!isAuthenticated || !stats) return null;
            return (
                <section className="container mx-auto px-6 py-12">
                    <div className="glass-hover p-8 rounded-2xl border-gradient animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <span className="text-3xl">🏆</span> Your Impact
                            </h3>
                            <span className="badge badge-accent">{stats.rank}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { value: `${(stats.totalDonated / 1_000_000).toFixed(0)}`, unit: '₳', label: 'Total Donated', icon: '💎', color: 'primary' },
                                { value: stats.campaignsSupported, unit: '', label: 'Campaigns Supported', icon: '❤️', color: 'secondary' },
                                { value: stats.votesCount, unit: '', label: 'Votes Cast', icon: '🗳️', color: 'accent' },
                                { value: stats.donationStreak, unit: '', label: 'Month Streak', icon: '🔥', color: 'warm' },
                            ].map((stat, i) => (
                                <div key={i} className="text-center p-5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                                    <span className="text-2xl group-hover:scale-125 inline-block transition-transform">{stat.icon}</span>
                                    <p className={`text-3xl font-bold text-${stat.color} mt-2`}>
                                        {stat.value}{stat.unit && <span className="text-xl">{stat.unit}</span>}
                                    </p>
                                    <p className="text-sm text-foreground/50 mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-center">
                            <Link href="/profile" className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all font-medium">
                                View full dashboard
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>
            );

        case 'cta-main':
            return (
                <Link
                    href={isAuthenticated ? "/create" : "/auth"}
                    className="inline-flex items-center gap-2 bg-white text-primary px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/90 transition-all hover:scale-105 shadow-2xl"
                >
                    {isAuthenticated ? (
                        <>
                            <span>✨</span> Create Campaign
                        </>
                    ) : (
                        <>
                            Start Your Journey
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </>
                    )}
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

