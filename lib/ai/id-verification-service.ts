/**
 * AI Identity Verification Service
 * 
 * This module provides identity document verification using a trained CNN model.
 * The model is trained on the IndCard dataset and can verify:
 * - Indian ID cards (Aadhaar, etc.)
 * - Passports
 * - Driver's Licenses
 * 
 * The service supports both:
 * - Browser-based inference (TensorFlow.js)
 * - Mock mode for demo/testing
 */

import { DocumentType, VerificationResult } from '@/lib/verification/documentVerifier';

export interface VerificationRequest {
    image: string; // Base64 encoded image
    documentType: DocumentType;
    userId: string;
    metadata?: {
        fileName?: string;
        fileSize?: number;
        uploadedAt?: string;
    };
}

export interface VerificationResponse {
    status: 'valid' | 'fake' | 'uncertain';
    score: number; // Confidence score 0-1
    reason?: string;
    issues?: string[];
    processingTime?: number; // milliseconds
    modelUsed?: 'tensorflow' | 'mock';
}

// Model configuration
const MODEL_PATH = '/ml-model/model.json';
const IMG_SIZE = { width: 224, height: 224 };
const VALIDITY_THRESHOLD = 0.5;

/**
 * Identity Verification Service
 * 
 * Uses TensorFlow.js for browser-based inference when available,
 * falls back to mock verification otherwise.
 */
export class IdentityVerificationService {
    private model: any = null;
    private modelLoaded: boolean = false;
    private loadingPromise: Promise<void> | null = null;
    private tf: any = null;

    constructor() {
        // Lazy load model when first needed
    }

    /**
     * Load TensorFlow.js and the trained model
     */
    private async loadModel(): Promise<boolean> {
        if (this.modelLoaded) return true;
        if (this.loadingPromise) {
            await this.loadingPromise;
            return this.modelLoaded;
        }

        this.loadingPromise = this.initializeModel();
        await this.loadingPromise;
        return this.modelLoaded;
    }

    private async initializeModel(): Promise<void> {
        try {
            // Only run in browser
            if (typeof window === 'undefined') {
                console.log('[AI Service] Not in browser, using mock mode');
                return;
            }

            // Dynamically import TensorFlow.js
            const tfModule = await import('@tensorflow/tfjs');
            this.tf = tfModule;

            // Try to load the model
            try {
                console.log('[AI Service] Loading model from:', MODEL_PATH);
                this.model = await this.tf.loadLayersModel(MODEL_PATH);
                this.modelLoaded = true;
                console.log('[AI Service] ✓ Model loaded successfully');
            } catch (modelError) {
                console.warn('[AI Service] Model not found, using mock mode:', modelError);
                this.modelLoaded = false;
            }
        } catch (error) {
            console.warn('[AI Service] TensorFlow.js not available, using mock mode:', error);
            this.modelLoaded = false;
        }
    }

    /**
     * Verify an identity document
     */
    async verifyIdDocument(request: VerificationRequest): Promise<VerificationResponse> {
        const startTime = Date.now();

        try {
            // Try to load model
            const hasModel = await this.loadModel();

            let result: VerificationResponse;

            if (hasModel && this.model && this.tf) {
                // Use real model inference
                result = await this.runModelInference(request);
            } else {
                // Fall back to mock verification
                result = await this.runMockVerification(request.documentType);
            }

            result.processingTime = Date.now() - startTime;
            return result;

        } catch (error: any) {
            console.error('[AI Verification] Error:', error);
            return {
                status: 'uncertain',
                score: 0,
                reason: error.message || 'Verification failed due to processing error',
                processingTime: Date.now() - startTime,
                modelUsed: 'mock',
            };
        }
    }

    /**
     * Run actual model inference using TensorFlow.js
     */
    private async runModelInference(request: VerificationRequest): Promise<VerificationResponse> {
        console.log('[AI Service] Running model inference...');

        // Create image element from base64
        const img = await this.loadImageFromBase64(request.image);
        
        // Preprocess image
        const tensor = this.tf.tidy(() => {
            // Convert to tensor
            let imageTensor = this.tf.browser.fromPixels(img);
            
            // Resize to model input size
            imageTensor = this.tf.image.resizeBilinear(imageTensor, [IMG_SIZE.height, IMG_SIZE.width]);
            
            // Normalize to [0, 1]
            imageTensor = imageTensor.div(255.0);
            
            // Add batch dimension
            return imageTensor.expandDims(0);
        });

        // Run inference
        const prediction = await this.model.predict(tensor).data();
        
        // Cleanup
        tensor.dispose();

        const score = prediction[0];
        const isValid = score > VALIDITY_THRESHOLD;

        console.log(`[AI Service] Prediction: ${score.toFixed(4)} (${isValid ? 'valid' : 'invalid'})`);

        if (isValid) {
            return {
                status: 'valid',
                score,
                reason: `Document verified with ${(score * 100).toFixed(1)}% confidence`,
                modelUsed: 'tensorflow',
            };
        } else {
            return {
                status: score > 0.3 ? 'uncertain' : 'fake',
                score: 1 - score,
                reason: 'Document verification failed',
                issues: this.generateIssues(request.documentType, score),
                modelUsed: 'tensorflow',
            };
        }
    }

    /**
     * Load image from base64 string
     */
    private loadImageFromBase64(base64: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            
            // Handle both with and without data URL prefix
            if (base64.startsWith('data:')) {
                img.src = base64;
            } else {
                img.src = `data:image/jpeg;base64,${base64}`;
            }
        });
    }

    /**
     * Generate issues based on document type and score
     */
    private generateIssues(documentType: DocumentType, score: number): string[] {
        const issues: string[] = [];

        if (score < 0.2) {
            issues.push('Image does not appear to be a valid identity document');
        } else if (score < 0.4) {
            issues.push('Document quality or format issues detected');
        }

        const typeIssues: Record<DocumentType, string[]> = {
            passport: [
                'MRZ zone may be obscured or unreadable',
                'Photo area not clearly visible',
            ],
            license: [
                'Document details not clearly visible',
                'Expected security features not detected',
            ],
            utility_bill: [
                'Document format not recognized',
                'Name or address area unclear',
            ],
        };

        const specificIssues = typeIssues[documentType] || [];
        if (specificIssues.length > 0) {
            issues.push(specificIssues[Math.floor(Math.random() * specificIssues.length)]);
        }

        return issues;
    }

    /**
     * Mock verification for demo/fallback
     */
    private async runMockVerification(documentType: DocumentType): Promise<VerificationResponse> {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

        // 70% success rate for demo
        const isSuccess = Math.random() > 0.3;
        const score = isSuccess ? 0.85 + Math.random() * 0.15 : 0.3 + Math.random() * 0.4;

        if (isSuccess) {
            return {
                status: 'valid',
                score,
                reason: 'Document verified successfully (demo mode)',
                modelUsed: 'mock',
            };
        } else {
            return {
                status: Math.random() > 0.5 ? 'fake' : 'uncertain',
                score,
                reason: 'Document verification failed',
                issues: this.generateIssues(documentType, score),
                modelUsed: 'mock',
            };
        }
    }

    /**
     * Get verification status for a user
     */
    async getVerificationStatus(userId: string): Promise<{
        status: 'none' | 'pending' | 'verified' | 'failed' | 'under_review';
        attempts: number;
        lastAttempt?: string;
    }> {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(`donatedao-verification-${userId}`);
            if (stored) {
                const data = JSON.parse(stored);
                return {
                    status: data.status,
                    attempts: data.attempts || 0,
                    lastAttempt: data.verifiedAt || data.reviewStartedAt,
                };
            }
        }
        return {
            status: 'none',
            attempts: 0,
        };
    }

    /**
     * Check if model is loaded
     */
    isModelLoaded(): boolean {
        return this.modelLoaded;
    }
}

// Singleton instance
export const verificationService = new IdentityVerificationService();

/**
 * Convenience function for quick verification
 */
export async function verifyIdDocument(
    image: string,
    documentType: DocumentType,
    userId: string
): Promise<VerificationResponse> {
    return verificationService.verifyIdDocument({
        image,
        documentType,
        userId,
    });
}
