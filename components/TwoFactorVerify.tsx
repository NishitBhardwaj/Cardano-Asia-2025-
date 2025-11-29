'use client';

import { useState } from 'react';
import { verify2FAToken } from '@/lib/utils/totp';

interface TwoFactorVerifyProps {
    email: string;
    onSuccess: () => void;
    onCancel?: () => void;
}

export default function TwoFactorVerify({ email, onSuccess, onCancel }: TwoFactorVerifyProps) {
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = () => {
        setError(null);

        if (!code || (code.length !== 6 && code.length !== 8)) {
            setError('Please enter a valid 6-digit code or backup code');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const isValid = verify2FAToken(email, code);
            if (isValid) {
                onSuccess();
            } else {
                setError('Invalid code. Please try again.');
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="glass p-8 rounded-2xl max-w-md w-full mx-4 space-y-6">
                <div className="text-center">
                    <div className="text-5xl mb-4">🔐</div>
                    <h2 className="text-2xl font-bold mb-2">Two-Factor Authentication</h2>
                    <p className="text-foreground/60">
                        Enter the 6-digit code from your authenticator app
                    </p>
                </div>

                <div className="space-y-4">
                    <input
                        type="text"
                        maxLength={8}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').toUpperCase())}
                        className="w-full px-4 py-4 rounded-lg border border-border bg-background text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="000000"
                        autoFocus
                    />
                    
                    <p className="text-xs text-foreground/60 text-center">
                        Or enter one of your backup codes
                    </p>

                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                </div>

                <div className="flex gap-2">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-3 glass rounded-lg hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={handleVerify}
                        disabled={isLoading}
                        className={`${onCancel ? 'flex-1' : 'w-full'} px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50`}
                    >
                        {isLoading ? 'Verifying...' : 'Verify'}
                    </button>
                </div>
            </div>
        </div>
    );
}

