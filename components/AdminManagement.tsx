'use client';

import { useState, useEffect } from 'react';
import { useCampaignStore } from '@/lib/store/campaignStore';
import { useUserStore } from '@/lib/store/userStore';
import useAuth from '@/lib/hooks/useAuth';
import QRCodeGenerator from './QRCodeGenerator';

interface AdminManagementProps {
    campaignId: string;
}

export default function AdminManagement({ campaignId }: AdminManagementProps) {
    const { profile } = useAuth();
    const { getCampaign, addAdmin, removeAdmin, generateAdminInviteLink, generatePublicDonationLink, updateCampaign } = useCampaignStore();
    const { checkUsernameAvailability, findUserByUsername } = useUserStore();
    
    const campaign = getCampaign(campaignId);
    const [usernameInput, setUsernameInput] = useState('');
    const [searchResult, setSearchResult] = useState<{ displayName: string; found: boolean } | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [adminInviteLink, setAdminInviteLink] = useState('');
    const [publicDonationLink, setPublicDonationLink] = useState('');

    // Generate links on client side
    useEffect(() => {
        if (typeof window !== 'undefined' && campaign) {
            const adminLink = generateAdminInviteLink(campaignId);
            const donationLink = generatePublicDonationLink(campaignId);
            setAdminInviteLink(adminLink);
            setPublicDonationLink(donationLink);
            
            // Update campaign with full links if they're not set
            if (!campaign.adminInviteLink || !campaign.publicDonationLink) {
                updateCampaign(campaignId, {
                    adminInviteLink: adminLink,
                    publicDonationLink: donationLink,
                });
            }
        }
    }, [campaignId, campaign, generateAdminInviteLink, generatePublicDonationLink, updateCampaign]);

    if (!campaign) return null;

    const isCreator = campaign.creatorUsername?.toLowerCase() === profile?.username?.toLowerCase();
    const canManage = isCreator;
    const maxAdmins = 7;
    const currentAdminCount = campaign.admins?.length || 0;

    const handleSearchUsername = () => {
        if (!usernameInput.trim()) {
            setSearchResult(null);
            return;
        }

        const user = findUserByUsername(usernameInput.trim());
        if (user) {
            setSearchResult({ displayName: user.displayName, found: true });
            setError(null);
        } else {
            setSearchResult({ displayName: '', found: false });
            setError('Username not found');
        }
    };

    const handleAddAdmin = async () => {
        if (!usernameInput.trim() || !profile?.username) return;

        const username = usernameInput.trim().toLowerCase();
        
        // Check if already admin
        if (campaign.admins?.some(a => a.username.toLowerCase() === username)) {
            setError('User is already an admin');
            return;
        }

        // Check admin limit
        if (currentAdminCount >= maxAdmins) {
            setError(`Maximum ${maxAdmins} admins allowed`);
            return;
        }

        // Verify username exists
        const user = findUserByUsername(username);
        if (!user) {
            setError('Username not found');
            return;
        }

        setIsAdding(true);
        setError(null);

        try {
            await addAdmin(campaignId, username, profile.username);
            setUsernameInput('');
            setSearchResult(null);
        } catch (err: any) {
            setError(err.message || 'Failed to add admin');
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveAdmin = (username: string) => {
        if (!canManage) return;
        if (username.toLowerCase() === campaign.creatorUsername?.toLowerCase()) {
            setError('Cannot remove campaign creator');
            return;
        }
        try {
            removeAdmin(campaignId, username);
        } catch (err: any) {
            setError(err.message || 'Failed to remove admin');
        }
    };

    const copyToClipboard = (text: string, type: string) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert(`${type} link copied to clipboard!`);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert(`${type} link copied to clipboard!`);
            });
        }
    };

    const shareToSocial = (platform: string) => {
        if (typeof window === 'undefined') return;
        
        const text = `Support ${campaign.title} on DonateDAO!`;
        const url = publicDonationLink;
        
        const shareUrls: Record<string, string> = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank');
        }
    };

    if (!canManage) return null;

    return (
        <div className="glass p-6 rounded-xl space-y-6">
            <h3 className="text-2xl font-bold">Campaign Management</h3>

            {/* Admin Management Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Admins ({currentAdminCount}/{maxAdmins})</h4>
                </div>

                {/* Add Admin Section */}
                <div className="flex gap-3 items-start">
                    <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={usernameInput}
                                onChange={(e) => {
                                    setUsernameInput(e.target.value);
                                    setSearchResult(null);
                                    setError(null);
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearchUsername();
                                    }
                                }}
                                placeholder="Enter username to add as admin"
                                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                                onClick={handleSearchUsername}
                                className="px-4 py-2 glass rounded-lg hover:bg-primary/20 transition-colors"
                            >
                                Search
                            </button>
                        </div>
                        {searchResult && (
                            <div className={`p-2 rounded-lg ${searchResult.found ? 'bg-green-500/10 border border-green-500/50' : 'bg-red-500/10 border border-red-500/50'}`}>
                                {searchResult.found ? (
                                    <p className="text-sm text-green-500">✓ Found: {searchResult.displayName}</p>
                                ) : (
                                    <p className="text-sm text-red-500">✗ Username not found</p>
                                )}
                            </div>
                        )}
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                        <button
                            onClick={handleAddAdmin}
                            disabled={!searchResult?.found || isAdding || currentAdminCount >= maxAdmins}
                            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAdding ? 'Adding...' : 'Add Admin'}
                        </button>
                    </div>

                    {/* Admin Invite Link */}
                    <div className="flex flex-col gap-2 min-w-[200px]">
                        <label className="text-sm font-medium">Admin Invite Link</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={adminInviteLink}
                                readOnly
                                className="flex-1 px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
                            />
                            <button
                                onClick={() => copyToClipboard(adminInviteLink, 'Admin invite')}
                                className="px-3 py-2 glass rounded-lg hover:bg-primary/20 transition-colors text-sm"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>

                {/* Admins List */}
                <div className="space-y-2">
                    {campaign.admins?.map((admin, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div>
                                <p className="font-medium">{admin.username}</p>
                                <p className="text-xs text-foreground/60">
                                    Added by {admin.addedBy} • {new Date(admin.addedAt).toLocaleDateString()}
                                </p>
                            </div>
                            {admin.username.toLowerCase() !== campaign.creatorUsername?.toLowerCase() && (
                                <button
                                    onClick={() => handleRemoveAdmin(admin.username)}
                                    className="px-3 py-1 text-sm text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* QR Code Section */}
            <div className="border-t border-border pt-6">
                <div className="flex flex-col sm:flex-row gap-6">
                    {/* QR Code */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                        <QRCodeGenerator
                            value={publicDonationLink}
                            title="Scan to Donate"
                            size={140}
                            campaignTitle={campaign.title}
                        />
                    </div>

                    {/* Share Section */}
                    <div className="flex-1 min-w-0 space-y-4">
                        <h4 className="text-base sm:text-lg font-semibold">Share Campaign</h4>
                        {/* Social Sharing Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => shareToSocial('twitter')}
                                className="px-3 py-2 text-sm bg-blue-500/20 border border-blue-500/50 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors"
                            >
                                Twitter
                            </button>
                            <button
                                onClick={() => shareToSocial('facebook')}
                                className="px-3 py-2 text-sm bg-blue-600/20 border border-blue-600/50 text-blue-600 rounded-lg hover:bg-blue-600/30 transition-colors"
                            >
                                Facebook
                            </button>
                            <button
                                onClick={() => shareToSocial('linkedin')}
                                className="px-3 py-2 text-sm bg-blue-700/20 border border-blue-700/50 text-blue-700 rounded-lg hover:bg-blue-700/30 transition-colors"
                            >
                                LinkedIn
                            </button>
                            <button
                                onClick={() => shareToSocial('whatsapp')}
                                className="px-3 py-2 text-sm bg-green-500/20 border border-green-500/50 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                            >
                                WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

