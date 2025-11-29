'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import { sendOTP, verifyOTP } from '@/lib/utils/otp';

interface WalletInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    walletAddress: string;
    onComplete: () => void;
}

export default function WalletInfoModal({ isOpen, onClose, walletAddress, onComplete }: WalletInfoModalProps) {
    const { updateProfile, profile } = useUserStore();
    
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    
    // Email verification state
    const [emailVerificationSent, setEmailVerificationSent] = useState(false);
    const [isSendingOTP, setIsSendingOTP] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpMessage, setOtpMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    if (!isOpen) return null;

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSendOTP = async () => {
        if (!formData.email.trim()) {
            setErrors(prev => ({ ...prev, email: 'Email is required' }));
            return;
        }
        if (!validateEmail(formData.email)) {
            setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
            return;
        }

        setIsSendingOTP(true);
        setOtpMessage(null);
        setErrors(prev => ({ ...prev, email: '' }));

        try {
            const result = await sendOTP(formData.email, 'email_verification');
            if (result.success) {
                setEmailVerificationSent(true);
                setOtpMessage({ type: 'success', text: 'Verification code sent to your email!' });
            } else {
                setOtpMessage({ type: 'error', text: result.error || 'Failed to send verification code' });
            }
        } catch (error: any) {
            setOtpMessage({ type: 'error', text: error.message || 'Failed to send verification code' });
        } finally {
            setIsSendingOTP(false);
        }
    };

    const handleVerifyOTP = () => {
        if (!otpInput.trim() || otpInput.length !== 6) {
            setOtpMessage({ type: 'error', text: 'Please enter a valid 6-digit code' });
            return;
        }

        setIsVerifyingOTP(true);
        setOtpMessage(null);

        try {
            const isValid = verifyOTP(formData.email, otpInput, 'email_verification');
            if (isValid) {
                setEmailVerified(true);
                setOtpMessage({ type: 'success', text: '✓ Email verified successfully!' });
            } else {
                setOtpMessage({ type: 'error', text: 'Invalid or expired code. Please try again.' });
            }
        } catch (error: any) {
            setOtpMessage({ type: 'error', text: error.message || 'Verification failed' });
        } finally {
            setIsVerifyingOTP(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Update profile with email info
            updateProfile({
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                displayName: `${formData.firstName} ${formData.lastName}`,
                emailVerified: emailVerified,
                preferences: {
                    ...(profile?.preferences || {
                        theme: 'dark',
                        currency: 'ADA',
                        notifications: true,
                        emailNotifications: false,
                    }),
                    email: formData.email,
                },
            });

            // Save password hash to localStorage (for demo)
            const existingUsers = JSON.parse(localStorage.getItem('donatedao-users') || '[]');
            const passwordHash = await import('@/lib/utils/password').then(m => m.hashPassword(formData.password));
            
            // Remove any existing user with this email or wallet
            const filteredUsers = existingUsers.filter(
                (u: any) => u.email !== formData.email && u.profile?.walletAddress !== walletAddress
            );
            
            filteredUsers.push({
                email: formData.email,
                passwordHash,
                profile: {
                    walletAddress,
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    emailVerified: emailVerified,
                },
            });
            localStorage.setItem('donatedao-users', JSON.stringify(filteredUsers));

            onComplete();
            onClose();
        } catch (error: any) {
            setErrors({ submit: error.message || 'Failed to save information' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="glass p-6 sm:p-8 rounded-2xl max-w-md w-full mx-auto space-y-6 max-h-[90vh] overflow-y-auto">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">Complete Your Profile</h2>
                    <p className="text-foreground/60 text-sm">
                        Add your details to enable full account features
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">First Name *</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                className={`w-full px-3 sm:px-4 py-2 rounded-lg border ${
                                    errors.firstName ? 'border-red-500' : 'border-border'
                                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base`}
                                placeholder="John"
                            />
                            {errors.firstName && (
                                <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Last Name *</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                className={`w-full px-3 sm:px-4 py-2 rounded-lg border ${
                                    errors.lastName ? 'border-red-500' : 'border-border'
                                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base`}
                                placeholder="Doe"
                            />
                            {errors.lastName && (
                                <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
                            )}
                        </div>
                    </div>

                    {/* Email with Verification */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Email * {emailVerified && <span className="text-green-500 text-xs ml-1">✓ Verified</span>}
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, email: e.target.value }));
                                    // Reset verification if email changes
                                    if (emailVerificationSent) {
                                        setEmailVerificationSent(false);
                                        setEmailVerified(false);
                                        setOtpInput('');
                                        setOtpMessage(null);
                                    }
                                }}
                                disabled={emailVerified}
                                className={`flex-1 px-3 sm:px-4 py-2 rounded-lg border ${
                                    errors.email ? 'border-red-500' : emailVerified ? 'border-green-500' : 'border-border'
                                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base disabled:opacity-60`}
                                placeholder="john@example.com"
                            />
                            {!emailVerified && (
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={isSendingOTP || !formData.email.trim()}
                                    className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                                >
                                    {isSendingOTP ? '...' : emailVerificationSent ? 'Resend' : 'Verify'}
                                </button>
                            )}
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* OTP Input - Shows after sending verification */}
                    {emailVerificationSent && !emailVerified && (
                        <div className="space-y-2 p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/30">
                            <label className="block text-sm font-medium">Enter Verification Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="flex-1 px-3 sm:px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg tracking-widest font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyOTP}
                                    disabled={isVerifyingOTP || otpInput.length !== 6}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {isVerifyingOTP ? '...' : 'Verify'}
                                </button>
                            </div>
                            <p className="text-xs text-foreground/60">
                                Enter the 6-digit code sent to your email
                            </p>
                        </div>
                    )}

                    {/* OTP Message */}
                    {otpMessage && (
                        <p className={`text-sm ${otpMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {otpMessage.text}
                        </p>
                    )}

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Password *</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            className={`w-full px-3 sm:px-4 py-2 rounded-lg border ${
                                errors.password ? 'border-red-500' : 'border-border'
                            } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base`}
                            placeholder="Create a password (min 8 characters)"
                        />
                        {errors.password && (
                            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                        )}
                    </div>

                    {errors.submit && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500">
                            <p className="text-sm text-red-500">{errors.submit}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 glass rounded-lg font-medium hover:bg-primary/20 transition-colors text-sm sm:text-base"
                        >
                            Skip for Now
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm sm:text-base"
                        >
                            {isLoading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
