'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import Header from '@/components/Header';

const mockWithdrawals = [
    { id: '1', campaign: 'School Renovation', amount: 25000, signatures: 2, required: 3, status: 'pending' },
    { id: '2', campaign: 'Medical Emergency', amount: 15000, signatures: 3, required: 3, status: 'approved' },
];

function AdminPageInner() {
    const router = useRouter();
    const { isAuthenticated, profile } = useAuth();
    const [activeTab, setActiveTab] = useState<'withdrawals' | 'activity'>('withdrawals');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-6 py-12">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-5xl font-bold mb-2">Admin Dashboard</h1>
                        <p className="text-xl text-foreground/70">Manage multi-signature withdrawals</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm bg-primary/20 text-primary">Admin</span>
                </div>

                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="glass p-6 rounded-xl">
                        <p className="text-foreground/60 text-sm">Pending Withdrawals</p>
                        <p className="text-4xl font-bold text-yellow-500">1</p>
                    </div>
                    <div className="glass p-6 rounded-xl">
                        <p className="text-foreground/60 text-sm">Ready to Execute</p>
                        <p className="text-4xl font-bold text-green-500">1</p>
                    </div>
                    <div className="glass p-6 rounded-xl">
                        <p className="text-foreground/60 text-sm">Total Admins</p>
                        <p className="text-4xl font-bold text-primary">5</p>
                    </div>
                    <div className="glass p-6 rounded-xl">
                        <p className="text-foreground/60 text-sm">Threshold</p>
                        <p className="text-4xl font-bold text-secondary">3 of 5</p>
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    {(['withdrawals', 'activity'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                activeTab === tab ? 'bg-primary text-white' : 'glass hover:bg-white/10'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {activeTab === 'withdrawals' && (
                    <div className="space-y-4">
                        {mockWithdrawals.map((w) => (
                            <div key={w.id} className="glass p-6 rounded-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold">{w.campaign}</h3>
                                        <p className="text-foreground/60">{w.amount.toLocaleString()} ₳</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${
                                        w.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                                    }`}>
                                        {w.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${w.signatures >= w.required ? 'bg-green-500' : 'gradient-primary'}`}
                                                style={{ width: `${(w.signatures / w.required) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-sm text-foreground/60 mt-1">{w.signatures} / {w.required} signatures</p>
                                    </div>
                                    <button className="gradient-primary px-4 py-2 rounded-lg text-white text-sm font-medium">
                                        {w.status === 'pending' ? 'Sign' : 'Execute'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="glass p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                        <p className="text-center text-foreground/60 py-8">Activity log will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Content() {
    return (
        <MeshProvider>
            <AdminPageInner />
        </MeshProvider>
    );
}

