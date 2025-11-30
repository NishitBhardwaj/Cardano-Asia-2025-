'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MeshProvider } from '@meshsdk/react';
import useAuth from '@/lib/hooks/useAuth';
import { useUserStore } from '@/lib/store/userStore';
import Header from '@/components/Header';
import { BrowserWallet } from '@meshsdk/core';
import TwoFactorSetup from '@/components/TwoFactorSetup';
import { sendOTP, verifyOTP } from '@/lib/utils/otp';

function ProfilePageInner() {
    const router = useRouter();
    const { isAuthenticated, profile, walletAddress, balance, disconnectWallet, availableWallets, connectWallet } = useAuth();
    const { stats, transactions, campaigns, supportedCampaigns, _hasHydrated, sendVerificationEmail, linkWallet, updateProfile } = useUserStore();
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'campaigns' | 'settings'>('overview');
    const [isSendingVerification, setIsSendingVerification] = useState(false);
    const [isLinkingWallet, setIsLinkingWallet] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    
    // Edit profile state
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    
    // Email verification state
    const [emailVerificationSent, setEmailVerificationSent] = useState(false);
    const [isSendingOTP, setIsSendingOTP] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
    const [otpMessage, setOtpMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Mark as mounted on client
    useEffect(() => {
        setMounted(true);
        
        // Set a timeout to prevent infinite loading
        const timer = setTimeout(() => {
            setLoadingTimeout(true);
        }, 3000); // 3 second max wait
        
        return () => clearTimeout(timer);
    }, []);

    // Redirect if not authenticated (only after hydration completes)
    useEffect(() => {
        // Wait for store to hydrate before checking auth
        if (mounted && (_hasHydrated || loadingTimeout) && !isAuthenticated) {
            router.push('/auth');
        }
    }, [isAuthenticated, _hasHydrated, router, mounted, loadingTimeout]);

    // Show loading while hydrating (with timeout protection)
    if (!mounted || (!_hasHydrated && !loadingTimeout)) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-foreground/60">Loading profile...</p>
                </div>
            </div>
        );
    }

    // If hydrated but not authenticated, show brief loading (redirect will happen)
    if (!isAuthenticated || !profile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-foreground/60">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background bg-gradient-mesh">
            <Header />

            <div className="container mx-auto px-6 py-12">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12 bg-gradient-radial rounded-2xl p-8">
                    <div className="text-8xl animate-float-slow">{profile.avatar}</div>
                    <div className="flex-1">
                        <h1 className="text-5xl font-bold mb-2">{profile.displayName}</h1>
                        <div className="space-y-2 mb-4">
                            {profile.email && (
                                <div className="flex items-center gap-2">
                                    <p className="text-foreground/60">{profile.email}</p>
                                    {profile.emailVerified ? (
                                        <span className="text-green-500" title="Email verified">✓</span>
                                    ) : (
                                        <span className="text-yellow-500" title="Email not verified">⚠</span>
                                    )}
                                </div>
                            )}
                            {walletAddress && (
                                <p className="text-foreground/60 font-mono text-sm">
                                    {walletAddress.slice(0, 20)}...{walletAddress.slice(-10)}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <div className="glass px-4 py-2 rounded-lg">
                                <span className="text-foreground/60 text-sm">Balance</span>
                                <p className="text-xl font-bold text-primary">{balance.toFixed(2)} ₳</p>
                            </div>
                            <div className="glass px-4 py-2 rounded-lg">
                                <span className="text-foreground/60 text-sm">Rank</span>
                                <p className="text-xl font-bold text-secondary">#{stats.rank}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-border">
                    {(['overview', 'transactions', 'campaigns', 'settings'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-medium transition-colors border-b-2 -mb-[2px] ${
                                activeTab === tab
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-foreground/60 hover:text-foreground'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass p-6 rounded-xl">
                            <p className="text-foreground/60 text-sm mb-2">Total Donated</p>
                            <p className="text-3xl font-bold text-primary">{(stats.totalDonated / 1_000_000).toFixed(0)} ₳</p>
                        </div>
                        <div className="glass p-6 rounded-xl">
                            <p className="text-foreground/60 text-sm mb-2">Campaigns Supported</p>
                            <p className="text-3xl font-bold text-secondary">{stats.campaignsSupported}</p>
                        </div>
                        <div className="glass p-6 rounded-xl">
                            <p className="text-foreground/60 text-sm mb-2">Votes Cast</p>
                            <p className="text-3xl font-bold text-accent">{stats.votesCount}</p>
                        </div>
                        <div className="glass p-6 rounded-xl">
                            <p className="text-foreground/60 text-sm mb-2">Donation Streak</p>
                            <p className="text-3xl font-bold">{stats.donationStreak} 🔥</p>
                        </div>
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div className="glass p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-6">Transaction History</h3>
                        {transactions.length > 0 ? (
                            <div className="space-y-4">
                                {transactions.slice(0, 10).map((tx, i) => (
                                    <div key={i} className="flex justify-between items-center py-4 border-b border-border last:border-0">
                                        <div>
                                            <p className="font-medium">{tx.type}</p>
                                            <p className="text-sm text-foreground/60">{new Date(tx.timestamp).toLocaleDateString()}</p>
                                        </div>
                                        <p className="font-bold">{(tx.amount / 1_000_000).toFixed(2)} ₳</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-foreground/60 py-8">No transactions yet</p>
                        )}
                    </div>
                )}

                {/* Campaigns Tab */}
                {activeTab === 'campaigns' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass p-6 rounded-xl">
                            <h3 className="text-xl font-bold mb-4">My Campaigns ({campaigns.length})</h3>
                            {campaigns.length > 0 ? (
                                <div className="space-y-4">
                                    {campaigns.map((c, i) => (
                                        <Link key={i} href={`/campaigns/${c.id}`} className="block p-4 bg-white/5 rounded-lg hover:bg-white/10">
                                            <p className="font-medium">{c.title}</p>
                                            <p className="text-sm text-foreground/60">{(c.raised / 1_000_000).toFixed(0)} / {(c.goal / 1_000_000).toFixed(0)} ₳</p>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-foreground/60 mb-4">No campaigns created yet</p>
                                    <Link href="/create" className="text-primary hover:underline">Create your first campaign →</Link>
                                </div>
                            )}
                        </div>
                        <div className="glass p-6 rounded-xl">
                            <h3 className="text-xl font-bold mb-4">Supported Campaigns ({supportedCampaigns.length})</h3>
                            {supportedCampaigns.length > 0 ? (
                                <div className="space-y-4">
                                    {supportedCampaigns.map((c, i) => (
                                        <Link key={i} href={`/campaigns/${c.id}`} className="block p-4 bg-white/5 rounded-lg hover:bg-white/10">
                                            <p className="font-medium">{c.title}</p>
                                            <p className="text-sm text-foreground/60">Donated: {((c.myDonation || 0) / 1_000_000).toFixed(2)} ₳</p>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-foreground/60 mb-4">No campaigns supported yet</p>
                                    <Link href="/campaigns" className="text-primary hover:underline">Explore campaigns →</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="glass p-4 sm:p-6 rounded-xl max-w-xl space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg sm:text-xl font-bold">Profile Settings</h3>
                            {!isEditingProfile && (
                                <button
                                    onClick={() => {
                                        setEditForm({
                                            firstName: profile.firstName || '',
                                            lastName: profile.lastName || '',
                                            email: profile.email || '',
                                        });
                                        setIsEditingProfile(true);
                                        setEmailVerificationSent(false);
                                        setOtpInput('');
                                        setOtpMessage(null);
                                    }}
                                    className="px-3 py-1.5 text-sm bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                                >
                                    ✏️ Edit
                                </button>
                            )}
                        </div>
                        
                        {isEditingProfile ? (
                            /* Edit Mode */
                            <div className="space-y-4">
                                {/* Name Fields */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm text-foreground/60 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            value={editForm.firstName}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-foreground/60 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={editForm.lastName}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                {/* Email with Verification */}
                                <div>
                                    <label className="block text-sm text-foreground/60 mb-2">
                                        Email Address
                                        {profile.emailVerified && editForm.email === profile.email && (
                                            <span className="text-green-500 text-xs ml-2">✓ Verified</span>
                                        )}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => {
                                                setEditForm(prev => ({ ...prev, email: e.target.value }));
                                                // Reset verification if email changes
                                                if (emailVerificationSent) {
                                                    setEmailVerificationSent(false);
                                                    setOtpInput('');
                                                    setOtpMessage(null);
                                                }
                                            }}
                                            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                            placeholder="john@example.com"
                                        />
                                        {editForm.email && editForm.email !== profile.email && (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!editForm.email.trim()) return;
                                                    setIsSendingOTP(true);
                                                    setOtpMessage(null);
                                                    try {
                                                        const result = await sendOTP(editForm.email, 'email_verification');
                                                        if (result.success) {
                                                            setEmailVerificationSent(true);
                                                            setOtpMessage({ type: 'success', text: 'Code sent to your email!' });
                                                        } else {
                                                            setOtpMessage({ type: 'error', text: result.error || 'Failed to send code' });
                                                        }
                                                    } catch (error: any) {
                                                        setOtpMessage({ type: 'error', text: error.message || 'Failed to send code' });
                                                    } finally {
                                                        setIsSendingOTP(false);
                                                    }
                                                }}
                                                disabled={isSendingOTP || !editForm.email.trim()}
                                                className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                                            >
                                                {isSendingOTP ? '...' : emailVerificationSent ? 'Resend' : 'Send Code'}
                                            </button>
                                        )}
                                        {(!editForm.email || editForm.email === profile.email) && !profile.emailVerified && profile.email && (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    setIsSendingOTP(true);
                                                    setOtpMessage(null);
                                                    try {
                                                        const result = await sendOTP(profile.email!, 'email_verification');
                                                        if (result.success) {
                                                            setEmailVerificationSent(true);
                                                            setOtpMessage({ type: 'success', text: 'Code sent to your email!' });
                                                        } else {
                                                            setOtpMessage({ type: 'error', text: result.error || 'Failed to send code' });
                                                        }
                                                    } catch (error: any) {
                                                        setOtpMessage({ type: 'error', text: error.message || 'Failed to send code' });
                                                    } finally {
                                                        setIsSendingOTP(false);
                                                    }
                                                }}
                                                disabled={isSendingOTP}
                                                className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                                            >
                                                {isSendingOTP ? '...' : emailVerificationSent ? 'Resend' : 'Verify'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* OTP Input */}
                                {emailVerificationSent && (
                                    <div className="space-y-2 p-3 bg-primary/10 rounded-lg border border-primary/30">
                                        <label className="block text-sm font-medium">Enter 6-digit Code</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={otpInput}
                                                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="000000"
                                                maxLength={6}
                                                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg tracking-widest font-mono"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (otpInput.length !== 6) {
                                                        setOtpMessage({ type: 'error', text: 'Enter 6 digits' });
                                                        return;
                                                    }
                                                    setIsVerifyingOTP(true);
                                                    setOtpMessage(null);
                                                    const emailToVerify = editForm.email || profile.email || '';
                                                    const isValid = verifyOTP(emailToVerify, otpInput, 'email_verification');
                                                    if (isValid) {
                                                        setOtpMessage({ type: 'success', text: '✓ Email verified!' });
                                                        // Update profile with verified email
                                                        updateProfile({
                                                            email: emailToVerify,
                                                            emailVerified: true,
                                                        });
                                                        setEmailVerificationSent(false);
                                                    } else {
                                                        setOtpMessage({ type: 'error', text: 'Invalid or expired code' });
                                                    }
                                                    setIsVerifyingOTP(false);
                                                }}
                                                disabled={isVerifyingOTP || otpInput.length !== 6}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                            >
                                                {isVerifyingOTP ? '...' : 'Verify'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* OTP Message */}
                                {otpMessage && (
                                    <p className={`text-sm ${otpMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                        {otpMessage.text}
                                    </p>
                                )}

                                {/* Save/Cancel Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setIsEditingProfile(false);
                                            setEmailVerificationSent(false);
                                            setOtpInput('');
                                            setOtpMessage(null);
                                        }}
                                        className="flex-1 px-4 py-2 glass rounded-lg font-medium hover:bg-primary/20 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setIsSavingProfile(true);
                                            try {
                                                const displayName = `${editForm.firstName} ${editForm.lastName}`.trim() || profile.displayName;
                                                updateProfile({
                                                    firstName: editForm.firstName,
                                                    lastName: editForm.lastName,
                                                    displayName,
                                                    email: editForm.email || profile.email,
                                                    // Only mark as verified if email didn't change or was just verified
                                                    emailVerified: editForm.email === profile.email ? profile.emailVerified : false,
                                                });
                                                setIsEditingProfile(false);
                                                setOtpMessage({ type: 'success', text: 'Profile updated!' });
                                            } catch (error: any) {
                                                setOtpMessage({ type: 'error', text: error.message || 'Failed to save' });
                                            } finally {
                                                setIsSavingProfile(false);
                                            }
                                        }}
                                        disabled={isSavingProfile}
                                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                                    >
                                        {isSavingProfile ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* View Mode */
                            <div className="space-y-4">
                                {/* Display Name */}
                                <div>
                                    <label className="block text-sm text-foreground/60 mb-1">Name</label>
                                    <p className="glass px-4 py-3 rounded-lg text-sm sm:text-base">
                                        {profile.firstName && profile.lastName 
                                            ? `${profile.firstName} ${profile.lastName}`
                                            : profile.displayName}
                                    </p>
                                </div>

                                {/* Email Section */}
                                <div>
                                    <label className="block text-sm text-foreground/60 mb-1">Email Address</label>
                                    {profile.email ? (
                                        <div className="flex items-center gap-2 glass px-4 py-3 rounded-lg">
                                            <span className="text-sm sm:text-base flex-1 truncate">{profile.email}</span>
                                            {profile.emailVerified ? (
                                                <span className="text-green-500 text-xs sm:text-sm whitespace-nowrap">✓ Verified</span>
                                            ) : (
                                                <span className="text-yellow-500 text-xs sm:text-sm whitespace-nowrap">⚠ Not Verified</span>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="glass px-4 py-3 rounded-lg text-foreground/50 text-sm">
                                            No email added - click Edit to add
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Wallet Section */}
                        <div className="border-t border-border pt-6">
                            <label className="block text-sm text-foreground/60 mb-2">Connected Wallet</label>
                            {walletAddress ? (
                                <div className="space-y-2">
                                    <p className="glass px-4 py-3 rounded-lg font-mono text-xs sm:text-sm break-all">{walletAddress}</p>
                                    <button
                                        onClick={() => {
                                            disconnectWallet();
                                            // Use window.location for a hard redirect
                                            setTimeout(() => {
                                                window.location.href = '/';
                                            }, 100);
                                        }}
                                        className="w-full bg-red-500/20 border border-red-500/50 text-red-500 px-4 py-2.5 rounded-lg font-medium hover:bg-red-500/30 transition-colors text-sm"
                                    >
                                        Disconnect Wallet
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-foreground/60 text-sm mb-2">No wallet connected</p>
                                    {availableWallets.length > 0 ? (
                                        <div className="space-y-2">
                                            {availableWallets.map((wallet) => (
                                                <button
                                                    key={wallet.name}
                                                    onClick={async () => {
                                                        setIsLinkingWallet(true);
                                                        try {
                                                            const walletInstance = await BrowserWallet.enable(wallet.name);
                                                            const address = await walletInstance.getChangeAddress();
                                                            await linkWallet(address);
                                                            await connectWallet(wallet.name);
                                                        } catch (error: any) {
                                                            alert(error.message || 'Failed to connect wallet');
                                                        } finally {
                                                            setIsLinkingWallet(false);
                                                        }
                                                    }}
                                                    disabled={isLinkingWallet}
                                                    className="w-full flex items-center gap-3 px-4 py-3 glass rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                                                >
                                                    <img src={wallet.icon} alt={wallet.name} className="w-8 h-8 rounded-lg" />
                                                    <span className="font-medium capitalize text-sm">{wallet.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-foreground/60 text-sm">No wallet extension found. Install a Cardano wallet to connect.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Two-Factor Authentication */}
                        {profile.email && (
                            <div className="border-t border-border pt-6">
                                <TwoFactorSetup email={profile.email} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Content() {
    return (
        <MeshProvider>
            <ProfilePageInner />
        </MeshProvider>
    );
}

