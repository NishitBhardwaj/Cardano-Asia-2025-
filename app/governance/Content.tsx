'use client';

import { useState } from 'react';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useUserStore } from '@/lib/store/userStore';
import Header from '@/components/Header';

const mockProposals = [
    {
        id: 'prop_001',
        title: 'Allocate 20,000 ₳ to Medical Emergency Campaign',
        description: 'Proposal to allocate additional funds from the treasury to support urgent medical needs.',
        votesFor: 45000,
        votesAgainst: 12000,
        status: 'active',
        deadline: '2025-12-05',
    },
    {
        id: 'prop_002',
        title: 'Add New Admin to Multi-Sig Wallet',
        description: 'Proposal to add a new admin to increase decentralization.',
        votesFor: 38000,
        votesAgainst: 5000,
        status: 'passed',
        deadline: '2025-11-25',
    },
];

function GovernancePageInner() {
    const { isAuthenticated, profile } = useAuth();
    const { stats } = useUserStore();
    const [votingOn, setVotingOn] = useState<string | null>(null);

    const votingPower = stats.votingPower || stats.totalDonated || 0;
    const votingPowerAda = votingPower / 1_000_000;

    const handleVote = async (proposalId: string, choice: 'for' | 'against') => {
        setVotingOn(proposalId);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setVotingOn(null);
        alert(`Vote cast for ${choice}!`);
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-6 py-12">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-5xl font-bold mb-4">Governance</h1>
                        <p className="text-xl text-foreground/70">Vote on proposals and shape the platform</p>
                    </div>
                    {isAuthenticated && (
                        <div className="glass p-6 rounded-xl text-center">
                            <p className="text-sm text-foreground/60 mb-1">Your Voting Power</p>
                            <p className="text-3xl font-bold text-primary">{votingPowerAda.toLocaleString()}</p>
                            <p className="text-xs text-foreground/50 mt-1">Based on donations</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {mockProposals.map((proposal) => {
                        const total = proposal.votesFor + proposal.votesAgainst;
                        const forPercent = total > 0 ? (proposal.votesFor / total) * 100 : 0;

                        return (
                            <div key={proposal.id} className="glass p-8 rounded-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">{proposal.title}</h3>
                                        <p className="text-foreground/70">{proposal.description}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${
                                        proposal.status === 'active' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'
                                    }`}>
                                        {proposal.status}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-green-500">For: {proposal.votesFor.toLocaleString()}</span>
                                        <span className="text-red-500">Against: {proposal.votesAgainst.toLocaleString()}</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden flex">
                                        <div className="bg-green-500" style={{ width: `${forPercent}%` }} />
                                        <div className="bg-red-500" style={{ width: `${100 - forPercent}%` }} />
                                    </div>
                                </div>

                                {proposal.status === 'active' && isAuthenticated && votingPowerAda > 0 && (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleVote(proposal.id, 'for')}
                                            disabled={votingOn === proposal.id}
                                            className="flex-1 gradient-primary px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50"
                                        >
                                            {votingOn === proposal.id ? 'Voting...' : '👍 Vote For'}
                                        </button>
                                        <button
                                            onClick={() => handleVote(proposal.id, 'against')}
                                            disabled={votingOn === proposal.id}
                                            className="flex-1 bg-red-500/20 border border-red-500/50 px-6 py-3 rounded-lg font-semibold text-red-500 hover:bg-red-500/30 disabled:opacity-50"
                                        >
                                            👎 Vote Against
                                        </button>
                                    </div>
                                )}

                                {proposal.status === 'active' && !isAuthenticated && (
                                    <p className="text-center text-foreground/60 py-4">
                                        Connect your wallet to vote on this proposal
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function Content() {
    return (
        <MeshProvider>
            <GovernancePageInner />
        </MeshProvider>
    );
}

