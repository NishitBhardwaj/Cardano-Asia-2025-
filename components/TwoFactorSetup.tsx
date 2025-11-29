'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { setup2FA, enable2FA, disable2FA, get2FAData } from '@/lib/utils/totp';

interface TwoFactorSetupProps {
    email: string;
    onComplete?: () => void;
}

export default function TwoFactorSetup({ email, onComplete }: TwoFactorSetupProps) {
    const [step, setStep] = useState<'check' | 'setup' | 'verify' | 'enabled' | 'disable'>('check');
    const [setupData, setSetupData] = useState<{ secret: string; uri: string; backupCodes: string[] } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check if 2FA is already enabled
        const data = get2FAData(email);
        if (data?.enabled) {
            setStep('enabled');
        }
    }, [email]);

    const handleSetup = () => {
        const data = setup2FA(email);
        setSetupData(data);
        setStep('setup');
    };

    const handleVerify = () => {
        setError(null);
        
        if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const success = enable2FA(email, verificationCode);
            if (success) {
                setStep('enabled');
                setShowBackupCodes(true);
                onComplete?.();
            } else {
                setError('Invalid verification code. Please try again.');
            }
            setIsLoading(false);
        }, 500);
    };

    const handleDisable = () => {
        setError(null);
        
        if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter your current 6-digit code');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const success = disable2FA(email, verificationCode);
            if (success) {
                setStep('check');
                setVerificationCode('');
                setSetupData(null);
                onComplete?.();
            } else {
                setError('Invalid verification code. Please try again.');
            }
            setIsLoading(false);
        }, 500);
    };

    const copyBackupCodes = () => {
        if (setupData?.backupCodes) {
            navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
            alert('Backup codes copied to clipboard!');
        }
    };

    return (
        <div className="glass p-6 rounded-xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Two-Factor Authentication</h3>
                    <p className="text-sm text-foreground/60">
                        Add an extra layer of security to your account
                    </p>
                </div>
                {step === 'enabled' && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-medium">
                        Enabled
                    </span>
                )}
            </div>

            {step === 'check' && (
                <div className="space-y-4">
                    <p className="text-foreground/70">
                        Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app when logging in.
                    </p>
                    <button
                        onClick={handleSetup}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Enable 2FA
                    </button>
                </div>
            )}

            {step === 'setup' && setupData && (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <p className="text-foreground/70">
                            1. Install an authenticator app like Google Authenticator or Authy
                        </p>
                        <p className="text-foreground/70">
                            2. Scan this QR code with your authenticator app:
                        </p>
                        <div className="flex justify-center p-4 bg-white rounded-lg">
                            <QRCodeSVG
                                value={setupData.uri}
                                size={200}
                                level="M"
                                bgColor="#ffffff"
                                fgColor="#000000"
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-foreground/60 mb-2">Or enter this code manually:</p>
                            <code className="px-4 py-2 bg-background rounded-lg text-sm font-mono select-all">
                                {setupData.secret}
                            </code>
                        </div>
                    </div>

                    <button
                        onClick={() => setStep('verify')}
                        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        I&apos;ve scanned the QR code
                    </button>
                </div>
            )}

            {step === 'verify' && (
                <div className="space-y-4">
                    <p className="text-foreground/70">
                        Enter the 6-digit code from your authenticator app to verify setup:
                    </p>
                    <input
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="000000"
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStep('setup')}
                            className="flex-1 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleVerify}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Enable'}
                        </button>
                    </div>
                </div>
            )}

            {step === 'enabled' && (
                <div className="space-y-4">
                    {showBackupCodes && setupData?.backupCodes && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg space-y-4">
                            <p className="text-yellow-500 font-medium">⚠️ Save your backup codes!</p>
                            <p className="text-sm text-foreground/70">
                                These codes can be used to access your account if you lose your authenticator device. 
                                Each code can only be used once.
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {setupData.backupCodes.map((code, i) => (
                                    <code key={i} className="px-3 py-2 bg-background rounded text-sm font-mono text-center">
                                        {code}
                                    </code>
                                ))}
                            </div>
                            <button
                                onClick={copyBackupCodes}
                                className="w-full px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors text-sm"
                            >
                                Copy Backup Codes
                            </button>
                        </div>
                    )}

                    <p className="text-foreground/70">
                        Two-factor authentication is enabled. You&apos;ll need to enter a code from your authenticator app when logging in.
                    </p>

                    <button
                        onClick={() => {
                            setStep('disable');
                            setVerificationCode('');
                        }}
                        className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        Disable 2FA
                    </button>
                </div>
            )}

            {step === 'disable' && (
                <div className="space-y-4">
                    <p className="text-foreground/70">
                        Enter your current 6-digit code to disable 2FA:
                    </p>
                    <input
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="000000"
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStep('enabled')}
                            className="flex-1 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDisable}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Disabling...' : 'Disable 2FA'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

