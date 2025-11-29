'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendOTP, verifyOTP, resendOTP } from '@/lib/utils/otp';
import Header from '@/components/Header';
import { MeshProvider } from '@meshsdk/react';

function ForgotPasswordInner() {
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            // Check if email exists in our "database"
            const users = JSON.parse(localStorage.getItem('donatedao-users') || '[]');
            const userExists = users.some((u: any) => u.profile?.email?.toLowerCase() === email.toLowerCase());

            if (!userExists) {
                setError('No account found with this email address');
                setIsLoading(false);
                return;
            }

            // Send OTP via email
            const result = await sendOTP(email, 'password_reset');
            
            if (result.success) {
                setSuccess('OTP sent to your email! Check your inbox.');
                setStep('otp');
            } else {
                setError(result.error || 'Failed to send OTP');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            const isValid = verifyOTP(email, otp, 'password_reset');

            if (!isValid) {
                setError('Invalid or expired OTP. Please try again.');
                setIsLoading(false);
                return;
            }

            // OTP verified, redirect to reset password page
            router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            setError(err.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError(null);
        setSuccess(null);
        setIsLoading(true);
        
        try {
            const result = await resendOTP(email, 'password_reset');
            if (result.success) {
                setSuccess('New OTP sent to your email!');
            } else {
                setError(result.error || 'Failed to resend OTP');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-md mx-auto">
                    <div className="glass p-8 rounded-2xl">
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">🔐</div>
                            <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
                            <p className="text-foreground/60">
                                {step === 'email' 
                                    ? "Enter your email to receive a password reset OTP"
                                    : "Enter the OTP sent to your email"
                                }
                            </p>
                        </div>

                        {step === 'email' ? (
                            <form onSubmit={handleSendOTP} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                        <p className="text-sm text-red-400">{error}</p>
                                    </div>
                                )}

                                {success && (
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                        <p className="text-sm text-green-400">{success}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full gradient-primary py-4 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending OTP...
                                        </>
                                    ) : (
                                        <>
                                            📧 Send OTP
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Enter OTP</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-full glass px-4 py-3 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="000000"
                                    />
                                    <p className="text-xs text-foreground/60 mt-2 text-center">
                                        OTP sent to: <span className="text-primary">{email}</span>
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                        <p className="text-sm text-red-400">{error}</p>
                                    </div>
                                )}

                                {success && (
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                        <p className="text-sm text-green-400">{success}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full gradient-primary py-4 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            ✓ Verify OTP
                                        </>
                                    )}
                                </button>

                                <div className="text-center space-y-2">
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={isLoading}
                                        className="text-primary hover:underline text-sm disabled:opacity-50"
                                    >
                                        🔄 Resend OTP
                                    </button>
                                    <p className="text-xs text-foreground/60">OTP expires in 10 minutes</p>
                                </div>
                            </form>
                        )}

                        <div className="mt-6 text-center">
                            <Link href="/auth/login" className="text-primary hover:underline text-sm">
                                ← Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ForgotPasswordContent() {
    return (
        <MeshProvider>
            <ForgotPasswordInner />
        </MeshProvider>
    );
}
