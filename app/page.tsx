'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import components that need wallet context - with loading states
const Header = dynamic(() => import('@/components/Header'), {
    ssr: false,
    loading: () => (
        <header className="border-b border-border glass">
            <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center animate-pulse-slow">
                        <span className="text-white font-bold text-xl">₳</span>
                    </div>
                    <h1 className="text-2xl font-bold">DonateDAO</h1>
                </div>
                <div className="skeleton w-32 h-10 rounded-lg" />
            </nav>
        </header>
    ),
});

// Dynamically import the wallet-dependent section
const WalletSection = dynamic(
    () => import('@/components/ClientProviders').then(() => import('./HomeWalletSection')),
    { ssr: false, loading: () => null }
);

export default function HomePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen relative">
            {/* Background is now handled by CSS in globals.css based on theme */}
            
            {/* Content overlay */}
            <div className="relative z-10">
            {/* Header */}
            <Header />

            {/* Hero Section */}
            <section className="relative container mx-auto px-6 py-24 lg:py-32">
                {/* Background decorations */}
                <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
                
                <div className="relative max-w-5xl mx-auto text-center space-y-8">
                    {/* Wallet-dependent greeting */}
                    {mounted && <WalletSection section="greeting" />}

                    {/* Badge - Only show if user is not logged in (logged-in users see it in greeting) */}
                    {mounted && <WalletSection section="badge" />}

                    {/* Main Heading */}
                    <h1 className="text-6xl lg:text-8xl font-bold leading-tight animate-slide-up">
                        <span className="text-gradient-animated">Community-Powered</span>
                        <br />
                        <span className="text-foreground">Transparent Giving</span>
                    </h1>

                    <p className="text-xl lg:text-2xl text-foreground/70 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        The first decentralized donation platform on Cardano featuring 
                        <span className="text-primary font-semibold"> multi-signature security</span>,
                        <span className="text-secondary font-semibold"> on-chain governance</span>, and 
                        <span className="text-accent font-semibold"> complete transparency</span>.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap gap-4 justify-center pt-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        {mounted ? (
                            <WalletSection section="cta-buttons" />
                        ) : (
                            <>
                                <Link href="/auth" className="btn-primary text-lg px-8 py-4">
                                    Get Started
                                    <svg className="inline-block ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                                <Link href="/campaigns" className="btn-secondary text-lg px-8 py-4">
                                    Explore Campaigns
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-foreground/50 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Audited Smart Contracts</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            <span>100% On-Chain</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span>1,200+ Community Members</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Total Raised', value: '125,000', unit: '₳', icon: '💎', color: 'primary', change: '+12% this month' },
                        { label: 'Active Campaigns', value: '24', unit: '', icon: '🚀', color: 'secondary', change: '8 ending soon' },
                        { label: 'Community Members', value: '1,234', unit: '', icon: '👥', color: 'accent', change: '+156 this week' }
                    ].map((stat, i) => (
                        <div 
                            key={i} 
                            className="card-glow p-8 rounded-2xl animate-slide-up group cursor-pointer"
                            style={{ animationDelay: `${i * 150}ms` }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <span className="text-4xl group-hover:animate-bounce-subtle">{stat.icon}</span>
                                <span className={`badge badge-${stat.color}`}>{stat.change}</span>
                            </div>
                            <p className="text-foreground/60 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className={`text-5xl font-bold text-${stat.color}`}>{stat.value}</span>
                                {stat.unit && <span className={`text-2xl font-bold text-${stat.color}/70`}>{stat.unit}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* User Stats (if authenticated) - wallet dependent */}
            {mounted && <WalletSection section="user-stats" />}

            {/* Features Section */}
            <section className="container mx-auto px-6 py-24 relative">
                {/* Section decoration */}
                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
                
                <div className="text-center mb-16">
                    <span className="badge badge-secondary mb-4">Why Choose Us</span>
                    <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                        Built for <span className="text-gradient">Trust & Transparency</span>
                    </h2>
                    <p className="text-foreground/60 max-w-2xl mx-auto">
                        Leveraging the power of Cardano blockchain to create a donation ecosystem that's secure, transparent, and community-governed.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {
                            icon: '🔐',
                            title: 'Multi-Sig Security',
                            description: '3-of-5 admin approval required for all fund withdrawals. Your donations are protected by industry-leading security.',
                            color: 'primary'
                        },
                        {
                            icon: '🗳️',
                            title: 'On-Chain Governance',
                            description: 'Vote on proposals with voting power based on your donations. True democratic funding decisions.',
                            color: 'secondary'
                        },
                        {
                            icon: '👁️',
                            title: 'Full Transparency',
                            description: 'Every transaction recorded on Cardano blockchain. See exactly where funds go in real-time.',
                            color: 'accent'
                        },
                        {
                            icon: '⚡',
                            title: 'Hydra Fast Lanes',
                            description: 'Lightning-fast donations for live events via Hydra L2. Near-instant confirmations with minimal fees.',
                            color: 'warm'
                        },
                        {
                            icon: '🎯',
                            title: 'Milestone Tracking',
                            description: 'Campaign goals and progress visible in real-time. Track impact as it happens with detailed analytics.',
                            color: 'primary'
                        },
                        {
                            icon: '🌍',
                            title: 'Global Access',
                            description: 'Accept donations from anywhere in the world. Support causes without borders or intermediaries.',
                            color: 'secondary'
                        }
                    ].map((feature, i) => (
                        <div 
                            key={i} 
                            className="glass-hover p-8 rounded-2xl card-shine animate-slide-up group"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-${feature.color}/10 border border-${feature.color}/20 mb-6 group-hover:scale-110 transition-transform`}>
                                <span className="text-4xl">{feature.icon}</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-gradient transition-all">{feature.title}</h3>
                            <p className="text-foreground/60 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="container mx-auto px-6 py-24 bg-pattern-dots">
                <div className="text-center mb-16">
                    <span className="badge badge-accent mb-4">Simple Process</span>
                    <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                        How It <span className="text-gradient">Works</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { step: '01', title: 'Connect Wallet', desc: 'Link your Cardano wallet in seconds', icon: '🔗' },
                        { step: '02', title: 'Browse or Create', desc: 'Find campaigns or start your own', icon: '🔍' },
                        { step: '03', title: 'Donate', desc: 'Contribute with full transparency', icon: '💝' },
                        { step: '04', title: 'Track Impact', desc: 'Watch your donation make a difference', icon: '📊' }
                    ].map((item, i) => (
                        <div key={i} className="relative animate-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
                            {/* Connector line */}
                            {i < 3 && (
                                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/50 to-transparent" />
                            )}
                            
                            <div className="glass-hover p-6 rounded-2xl text-center group">
                                <div className="relative inline-block mb-4">
                                    <span className="text-5xl group-hover:animate-bounce-subtle">{item.icon}</span>
                                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full gradient-primary text-xs font-bold flex items-center justify-center text-white">
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-foreground/60">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials/Social Proof */}
            <section className="container mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <span className="badge badge-primary mb-4">Community Love</span>
                    <h2 className="text-4xl lg:text-5xl font-bold">
                        Trusted by <span className="text-gradient">Changemakers</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { quote: "Finally, a donation platform where I can verify every transaction. Complete transparency!", author: "Sarah K.", role: "Donor", avatar: "🦊" },
                        { quote: "We raised 50,000 ADA in just 2 weeks. The multi-sig security gave our donors confidence.", author: "Mike T.", role: "Campaign Creator", avatar: "🐸" },
                        { quote: "The governance features let our community decide fund allocation. True decentralization!", author: "Elena R.", role: "DAO Member", avatar: "🦄" }
                    ].map((item, i) => (
                        <div key={i} className="glass p-8 rounded-2xl animate-slide-up relative" style={{ animationDelay: `${i * 150}ms` }}>
                            {/* Quote icon */}
                            <div className="absolute -top-4 left-6 text-5xl text-primary/20">"</div>
                            
                            <p className="text-foreground/80 mb-6 relative z-10 italic">{item.quote}</p>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{item.avatar}</span>
                                <div>
                                    <p className="font-semibold">{item.author}</p>
                                    <p className="text-sm text-foreground/60">{item.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-6 py-24">
                <div className="relative rounded-3xl overflow-hidden">
                    {/* Background */}
                    <div className="absolute inset-0 gradient-primary opacity-90" />
                    <div className="absolute inset-0 bg-pattern-diagonal opacity-20" />
                    
                    {/* Floating shapes */}
                    <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white/10 animate-float" />
                    <div className="absolute bottom-10 right-20 w-32 h-32 rounded-full bg-white/10 animate-float-slow" />
                    <div className="absolute top-1/2 right-10 w-16 h-16 rounded-lg bg-white/10 animate-float" style={{ animationDelay: '1s' }} />
                    
                    <div className="relative p-12 lg:p-20 text-center text-white">
                        <h2 className="text-4xl lg:text-6xl font-bold mb-6">
                            Ready to Make a Difference?
                        </h2>
                        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                            Join thousands of donors and creators building a more transparent future for charitable giving.
                        </p>
                        {mounted ? (
                            <WalletSection section="cta-main" />
                        ) : (
                            <Link
                                href="/auth"
                                className="inline-flex items-center gap-2 bg-white text-primary px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/90 transition-all hover:scale-105 shadow-2xl"
                            >
                                Start Your Journey
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border bg-background/50 backdrop-blur-xl mt-24">
                <div className="container mx-auto px-6 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                                    <span className="text-white font-bold text-2xl">₳</span>
                                </div>
                                <div>
                                    <span className="font-bold text-xl">DonateDAO</span>
                                    <p className="text-xs text-foreground/50">Powered by Cardano</p>
                                </div>
                            </div>
                            <p className="text-foreground/60 text-sm leading-relaxed">
                                Transparent community donations built on Cardano blockchain with multi-signature security and on-chain governance.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6">Platform</h4>
                            <ul className="space-y-3 text-sm">
                                {['Campaigns', 'Create', 'Governance', 'Profile', 'Dashboard'].map((item) => (
                                    <li key={item}>
                                        <Link href={`/${item.toLowerCase()}`} className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6">Resources</h4>
                            <ul className="space-y-3 text-sm">
                                {['Documentation', 'GitHub', 'Support', 'API', 'Smart Contracts'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-secondary/50 group-hover:bg-secondary transition-colors" />
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6">Community</h4>
                            <div className="flex gap-3 mb-6">
                                {[
                                    { icon: '𝕏', label: 'Twitter' },
                                    { icon: '📱', label: 'Discord' },
                                    { icon: '✈️', label: 'Telegram' }
                                ].map((social) => (
                                    <a 
                                        key={social.label}
                                        href="#" 
                                        className="w-10 h-10 rounded-xl glass-hover flex items-center justify-center text-lg hover:text-primary transition-colors"
                                        title={social.label}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                            <div className="glass p-4 rounded-xl">
                                <p className="text-sm text-foreground/60 mb-2">Stay updated</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="email" 
                                        placeholder="Enter email" 
                                        className="input-glass text-sm py-2 flex-1"
                                    />
                                    <button className="btn-primary px-4 py-2 text-sm">
                                        →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-foreground/50">
                            © 2025 DonateDAO. Built with ❤️ for Cardano Hackathon
                        </p>
                        <div className="flex items-center gap-6 text-sm text-foreground/50">
                            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                            <span className="badge badge-accent">Preprod Network</span>
                        </div>
                    </div>
                </div>
            </footer>
            </div>
        </div>
    );
}
