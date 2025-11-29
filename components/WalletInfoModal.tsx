'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/store/userStore';

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

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
            
            existingUsers.push({
                email: formData.email,
                passwordHash,
                profile: {
                    walletAddress,
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                },
            });
            localStorage.setItem('donatedao-users', JSON.stringify(existingUsers));

            onComplete();
            onClose();
        } catch (error: any) {
            setErrors({ submit: error.message || 'Failed to save information' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="glass p-8 rounded-2xl max-w-md w-full mx-4 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
                    <p className="text-foreground/60 text-sm">
                        Add your email and personal information for better account management
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">First Name *</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    errors.firstName ? 'border-red-500' : 'border-border'
                                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                            />
                            {errors.firstName && (
                                <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Last Name *</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    errors.lastName ? 'border-red-500' : 'border-border'
                                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                            />
                            {errors.lastName && (
                                <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                errors.email ? 'border-red-500' : 'border-border'
                            } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Password *</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                errors.password ? 'border-red-500' : 'border-border'
                            } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                            placeholder="Create a password"
                        />
                        {errors.password && (
                            <p className="text-sm text-red-500 mt-1">{errors.password}</p>
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
                            className="flex-1 px-4 py-2 glass rounded-lg font-medium hover:bg-primary/20 transition-colors"
                        >
                            Skip
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

