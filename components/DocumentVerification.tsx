'use client';

import { useState, useRef, useEffect } from 'react';
import {
    submitDocumentVerification,
    getVerificationData,
    checkUtilityBillReview,
    DocumentType,
    VerificationResult,
    IdentityVerification,
} from '@/lib/verification/documentVerifier';

interface DocumentVerificationProps {
    userId: string;
    onVerified: () => void;
    onClose?: () => void;
}

export default function DocumentVerification({ userId, onVerified, onClose }: DocumentVerificationProps) {
    const [step, setStep] = useState<'select' | 'upload' | 'processing' | 'result'>('select');
    const [documentType, setDocumentType] = useState<DocumentType | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [verificationData, setVerificationData] = useState<IdentityVerification | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const data = getVerificationData(userId);
        setVerificationData(data);

        // If already verified, inform parent (but only after component is mounted)
        if (data?.status === 'verified') {
            // Delay to prevent immediate redirect on page load
            const timer = setTimeout(() => {
                onVerified();
            }, 500);
            return () => clearTimeout(timer);
        }

        // If under review, check status
        if (data?.status === 'under_review') {
            const reviewResult = checkUtilityBillReview(userId);
            if (reviewResult.status === 'verified') {
                const timer = setTimeout(() => {
                    onVerified();
                }, 500);
                return () => clearTimeout(timer);
            } else if (reviewResult.status !== 'under_review') {
                setVerificationData(getVerificationData(userId));
            }
        }
    }, [userId, onVerified]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Read file as base64
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setImagePreview(base64);
            setStep('upload');
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!documentType || !imagePreview) return;

        setIsProcessing(true);
        setStep('processing');

        try {
            const verifyResult = await submitDocumentVerification(userId, documentType, imagePreview);
            setResult(verifyResult);
            setVerificationData(getVerificationData(userId));
            setStep('result');

            if (verifyResult.status === 'verified') {
                setTimeout(() => {
                    onVerified();
                }, 2000);
            }
        } catch (error) {
            setResult({
                success: false,
                status: 'failed',
                message: 'An error occurred during verification. Please try again.',
            });
            setStep('result');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRetry = () => {
        setImagePreview(null);
        setResult(null);
        
        // If 3 attempts failed, offer utility bill
        if (verificationData && verificationData.attempts >= 3) {
            setDocumentType('utility_bill');
            setStep('select');
        } else {
            setStep('select');
        }
    };

    const getAttemptsRemaining = () => {
        if (!verificationData) return 3;
        return Math.max(0, 3 - verificationData.attempts);
    };

    const showUtilityBillOption = verificationData && verificationData.attempts >= 3;

    return (
        <div className="glass p-6 rounded-xl max-w-lg mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Identity Verification</h2>
                {onClose && (
                    <button onClick={onClose} className="text-foreground/60 hover:text-foreground">
                        ✕
                    </button>
                )}
            </div>

            {/* Already Verified */}
            {verificationData?.status === 'verified' && (
                <div className="text-center space-y-4 py-8">
                    <div className="text-6xl">✅</div>
                    <h3 className="text-xl font-bold text-green-500">Identity Verified</h3>
                    <p className="text-foreground/60">
                        Your identity has been verified on {new Date(verificationData.verifiedAt!).toLocaleDateString()}
                    </p>
                </div>
            )}

            {/* Under Review */}
            {verificationData?.status === 'under_review' && (
                <div className="text-center space-y-4 py-8">
                    <div className="text-6xl animate-pulse">🔍</div>
                    <h3 className="text-xl font-bold text-yellow-500">Under Manual Review</h3>
                    <p className="text-foreground/60">
                        Your document is being reviewed. This may take up to 3 hours.
                    </p>
                    <p className="text-sm text-foreground/40">
                        Started: {new Date(verificationData.reviewStartedAt!).toLocaleString()}
                    </p>
                    <button
                        onClick={() => {
                            const reviewResult = checkUtilityBillReview(userId);
                            if (reviewResult.status === 'verified') {
                                onVerified();
                            } else {
                                setVerificationData(getVerificationData(userId));
                                alert(reviewResult.message);
                            }
                        }}
                        className="px-6 py-2 glass rounded-lg hover:bg-white/10"
                    >
                        Check Status
                    </button>
                </div>
            )}

            {/* Select Document Type */}
            {step === 'select' && verificationData?.status !== 'verified' && verificationData?.status !== 'under_review' && (
                <div className="space-y-4">
                    <p className="text-foreground/70">
                        To create campaigns, we need to verify your identity. This helps prevent scams and builds trust with donors.
                    </p>

                    {!showUtilityBillOption && (
                        <div className="text-sm text-foreground/60 p-3 bg-white/5 rounded-lg">
                            Attempts remaining: {getAttemptsRemaining()}/3
                        </div>
                    )}

                    <div className="space-y-3">
                        {!showUtilityBillOption && (
                            <>
                                <button
                                    onClick={() => {
                                        setDocumentType('passport');
                                        fileInputRef.current?.click();
                                    }}
                                    className="w-full flex items-center gap-4 p-4 glass rounded-lg hover:bg-primary/10 transition-colors"
                                >
                                    <span className="text-3xl">🛂</span>
                                    <div className="text-left">
                                        <p className="font-medium">Passport</p>
                                        <p className="text-sm text-foreground/60">Upload photo of your passport</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setDocumentType('license');
                                        fileInputRef.current?.click();
                                    }}
                                    className="w-full flex items-center gap-4 p-4 glass rounded-lg hover:bg-primary/10 transition-colors"
                                >
                                    <span className="text-3xl">🪪</span>
                                    <div className="text-left">
                                        <p className="font-medium">Driving License</p>
                                        <p className="text-sm text-foreground/60">Upload photo of your driving license</p>
                                    </div>
                                </button>
                            </>
                        )}

                        {showUtilityBillOption && (
                            <div className="space-y-4">
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                                    <p className="text-yellow-500 font-medium mb-2">⚠️ Maximum attempts reached</p>
                                    <p className="text-sm text-foreground/70">
                                        You can now submit a utility bill for manual verification. This process takes up to 3 hours.
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setDocumentType('utility_bill');
                                        fileInputRef.current?.click();
                                    }}
                                    className="w-full flex items-center gap-4 p-4 glass rounded-lg hover:bg-primary/10 transition-colors"
                                >
                                    <span className="text-3xl">📄</span>
                                    <div className="text-left">
                                        <p className="font-medium">Utility Bill</p>
                                        <p className="text-sm text-foreground/60">Upload a recent electricity or water bill</p>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            )}

            {/* Upload Preview */}
            {step === 'upload' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">
                            {documentType === 'passport' ? '🛂' : documentType === 'license' ? '🪪' : '📄'}
                        </span>
                        <span className="font-medium capitalize">{documentType?.replace('_', ' ')}</span>
                    </div>

                    {imagePreview && (
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Document preview"
                                className="w-full h-64 object-contain rounded-lg border border-border"
                            />
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setImagePreview(null);
                                setStep('select');
                            }}
                            className="flex-1 px-4 py-2 glass rounded-lg hover:bg-white/10"
                        >
                            Change
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
                        >
                            Submit for Verification
                        </button>
                    </div>
                </div>
            )}

            {/* Processing */}
            {step === 'processing' && (
                <div className="text-center space-y-4 py-8">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <h3 className="text-xl font-bold">Analyzing Document...</h3>
                    <p className="text-foreground/60">
                        Our AI is verifying your document. This may take a few seconds.
                    </p>
                </div>
            )}

            {/* Result */}
            {step === 'result' && result && (
                <div className="space-y-4">
                    <div className={`text-center py-6 rounded-lg ${
                        result.status === 'verified' 
                            ? 'bg-green-500/10 border border-green-500/50' 
                            : result.status === 'under_review'
                            ? 'bg-yellow-500/10 border border-yellow-500/50'
                            : 'bg-red-500/10 border border-red-500/50'
                    }`}>
                        <div className="text-5xl mb-4">
                            {result.status === 'verified' ? '✅' : result.status === 'under_review' ? '🔍' : '❌'}
                        </div>
                        <h3 className={`text-xl font-bold ${
                            result.status === 'verified' 
                                ? 'text-green-500' 
                                : result.status === 'under_review'
                                ? 'text-yellow-500'
                                : 'text-red-500'
                        }`}>
                            {result.status === 'verified' 
                                ? 'Verification Successful!' 
                                : result.status === 'under_review'
                                ? 'Submitted for Manual Review'
                                : 'Verification Failed'
                            }
                        </h3>
                        <p className="text-foreground/70 mt-2">{result.message}</p>
                        
                        {result.confidence && (
                            <p className="text-sm text-foreground/50 mt-2">
                                Confidence: {Math.round(result.confidence * 100)}%
                            </p>
                        )}
                    </div>

                    {result.issues && result.issues.length > 0 && (
                        <div className="p-4 bg-white/5 rounded-lg">
                            <p className="font-medium mb-2">Issues detected:</p>
                            <ul className="list-disc list-inside text-sm text-foreground/70 space-y-1">
                                {result.issues.map((issue, i) => (
                                    <li key={i}>{issue}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.status === 'failed' && (
                        <button
                            onClick={handleRetry}
                            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
                        >
                            {getAttemptsRemaining() > 0 ? 'Try Again' : 'Submit Utility Bill'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

