'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserStore } from '@/lib/store/userStore';
import Header from '@/components/Header';
import TwoFactorVerify from '@/components/TwoFactorVerify';
import { is2FAEnabled } from '@/lib/utils/totp';

export default function LoginContent() {
    const router = useRouter();
    const { loginWithEmail, _hasHydrated, isAuthenticated } = useUserStore();
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');

    // Redirect if already authenticated
    useEffect(() => {
        if (_hasHydrated && isAuthenticated) {
            router.push('/profile');
        }
    }, [_hasHydrated, isAuthenticated, router]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
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
            // First check if 2FA is enabled for this email
            const has2FA = is2FAEnabled(formData.email);
            
            await loginWithEmail({
                email: formData.email,
                password: formData.password,
            });

            // If 2FA is enabled, show verification modal
            if (has2FA) {
                setPendingEmail(formData.email);
                setShow2FA(true);
                setIsLoading(false);
                return;
            }

            // Redirect to profile
            router.push('/profile');
        } catch (error: any) {
            setErrors({ submit: error.message || 'Login failed. Please check your credentials.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handle2FASuccess = () => {
        setShow2FA(false);
        router.push('/profile');
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    if (!_hasHydrated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            {show2FA && (
                <TwoFactorVerify
                    email={pendingEmail}
                    onSuccess={handle2FASuccess}
                    onCancel={() => setShow2FA(false)}
                />
            )}
            <div className="min-h-screen bg-background">
                <Header />
            <div className="container mx-auto px-6 py-12 max-w-md">
                <div className="glass p-8 rounded-2xl">
                    <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-foreground/60 mb-8">
                        Sign in to your account to continue
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    errors.email ? 'border-red-500' : 'border-border'
                                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                                placeholder="john@example.com"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium">
                                    Password
                                </label>
                                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    errors.password ? 'border-red-500' : 'border-border'
                                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500">
                                <p className="text-red-500">{errors.submit}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>

                        {/* Signup Link */}
                        <p className="text-center text-foreground/60">
                            Don&apos;t have an account?{' '}
                            <Link href="/auth/signup" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
        </>
    );
}

