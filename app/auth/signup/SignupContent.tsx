'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserStore } from '@/lib/store/userStore';
import Captcha from '@/components/Captcha';
import Header from '@/components/Header';

export default function SignupContent() {
    const router = useRouter();
    const { loginWithEmail, _hasHydrated, isAuthenticated, checkUsernameAvailability } = useUserStore();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [captchaValid, setCaptchaValid] = useState(false);
    const [captchaReset, setCaptchaReset] = useState(0);

    // Redirect if already authenticated
    useEffect(() => {
        if (_hasHydrated && isAuthenticated) {
            router.push('/profile');
        }
    }, [_hasHydrated, isAuthenticated, router]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        } else if (!checkUsernameAvailability(formData.username.trim())) {
            newErrors.username = 'Username is already taken';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!captchaValid) {
            newErrors.captcha = 'Please complete the captcha';
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
            await loginWithEmail({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
            });

            // Redirect to profile
            router.push('/profile');
        } catch (error: any) {
            setErrors({ submit: error.message || 'Signup failed. Please try again.' });
            setCaptchaReset(prev => prev + 1); // Reset captcha on error
        } finally {
            setIsLoading(false);
        }
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
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-6 py-12 max-w-2xl">
                <div className="glass p-8 rounded-2xl">
                    <h1 className="text-4xl font-bold mb-2">Create Account</h1>
                    <p className="text-foreground/60 mb-8">
                        Join our community and start making a difference
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.firstName ? 'border-red-500' : 'border-border'
                                    } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                                    placeholder="John"
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.lastName ? 'border-red-500' : 'border-border'
                                    } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                                    placeholder="Doe"
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                                )}
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Username *
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => handleChange('username', e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    errors.username ? 'border-red-500' : 'border-border'
                                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                                placeholder="johndoe"
                            />
                            {errors.username && (
                                <p className="text-sm text-red-500 mt-1">{errors.username}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email Address *
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

                        {/* Password Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Password *
                                </label>
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

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.confirmPassword ? 'border-red-500' : 'border-border'
                                    } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        {/* Captcha */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Captcha *
                            </label>
                            <Captcha
                                onVerify={setCaptchaValid}
                                resetKey={captchaReset}
                            />
                            {errors.captcha && (
                                <p className="text-sm text-red-500 mt-1">{errors.captcha}</p>
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
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>

                        {/* Login Link */}
                        <p className="text-center text-foreground/60">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

