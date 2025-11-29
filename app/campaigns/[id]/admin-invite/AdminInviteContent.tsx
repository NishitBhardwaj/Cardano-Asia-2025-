'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useCampaignStore } from '@/lib/store/campaignStore';
import { useUserStore } from '@/lib/store/userStore';
import Header from '@/components/Header';

function AdminInviteContentInner() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const { isAuthenticated, profile } = useAuth();
    const { getCampaign, addAdmin } = useCampaignStore();
    const { checkUsernameAvailability } = useUserStore();

    const [campaign, setCampaign] = useState<any>(null);
    const [isAccepting, setIsAccepting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const c = getCampaign(campaignId);
        setCampaign(c);
    }, [campaignId, getCampaign]);

    useEffect(() => {
        if (!isAuthenticated || !profile?.username) {
            setError('Please login to accept admin invitation');
        }
    }, [isAuthenticated, profile]);

    const handleAcceptInvite = async () => {
        if (!profile?.username || !campaign) return;

        setIsAccepting(true);
        setError(null);

        try {
            // Check if already admin
            if (campaign.admins?.some((a: any) => a.username.toLowerCase() === profile.username?.toLowerCase())) {
                setError('You are already an admin of this campaign');
                setIsAccepting(false);
                return;
            }

            // Check admin limit
            if ((campaign.admins?.length || 0) >= 7) {
                setError('This campaign has reached the maximum number of admins (7)');
                setIsAccepting(false);
                return;
            }

            await addAdmin(campaignId, profile.username, campaign.creatorUsername || 'system');
            setSuccess(true);
            
            setTimeout(() => {
                router.push(`/campaigns/${campaignId}`);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to accept invitation');
        } finally {
            setIsAccepting(false);
        }
    };

    if (!campaign) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-foreground/60">Loading campaign...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-6 py-12 max-w-2xl">
                <div className="glass p-8 rounded-2xl space-y-6">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="text-6xl mb-4">✓</div>
                            <h1 className="text-3xl font-bold text-green-500">Invitation Accepted!</h1>
                            <p className="text-foreground/60">You are now an admin of "{campaign.title}"</p>
                            <p className="text-sm text-foreground/50">Redirecting to campaign page...</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center space-y-2">
                                <h1 className="text-3xl font-bold">Admin Invitation</h1>
                                <p className="text-foreground/60">You've been invited to become an admin</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-lg">
                                    <p className="text-sm text-foreground/60 mb-1">Campaign</p>
                                    <p className="text-xl font-bold">{campaign.title}</p>
                                </div>

                                <div className="p-4 bg-white/5 rounded-lg">
                                    <p className="text-sm text-foreground/60 mb-1">Creator</p>
                                    <p className="font-medium">{campaign.creatorName || campaign.creatorUsername || 'Unknown'}</p>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                                        <p className="text-red-500">{error}</p>
                                    </div>
                                )}

                                {!isAuthenticated ? (
                                    <div className="space-y-2">
                                        <p className="text-foreground/60">Please login to accept this invitation</p>
                                        <button
                                            onClick={() => router.push('/auth')}
                                            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            Go to Login
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-foreground/60">
                                            As an admin, you'll be able to help manage this campaign.
                                        </p>
                                        <button
                                            onClick={handleAcceptInvite}
                                            disabled={isAccepting}
                                            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                        >
                                            {isAccepting ? 'Accepting...' : 'Accept Invitation'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminInviteContent() {
    return (
        <MeshProvider>
            <AdminInviteContentInner />
        </MeshProvider>
    );
}

