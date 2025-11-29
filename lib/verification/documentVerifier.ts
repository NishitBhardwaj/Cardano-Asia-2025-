/**
 * Mock Document Verification System
 * 
 * In production, this would connect to a real ID verification API like:
 * - Jumio, Onfido, IDnow, etc.
 * 
 * For demo purposes, this simulates document verification with:
 * - Random success/failure (70% success rate)
 * - Simulated processing delays
 * - Multiple document type support
 */

export type DocumentType = 'passport' | 'license' | 'utility_bill';
export type VerificationStatus = 'none' | 'pending' | 'verified' | 'failed' | 'under_review';

export interface VerificationResult {
    success: boolean;
    status: VerificationStatus;
    message: string;
    confidence?: number;
    issues?: string[];
}

export interface IdentityVerification {
    status: VerificationStatus;
    documentType?: DocumentType;
    attempts: number;
    verifiedAt?: string;
    reviewStartedAt?: string;
    documentImage?: string;
    failureReasons?: string[];
}

const VERIFICATION_STORAGE_KEY = 'donatedao-verification';

// Simulated verification issues
const POSSIBLE_ISSUES = {
    passport: [
        'Document appears to be expired',
        'Image quality too low',
        'Face not clearly visible',
        'Document partially obscured',
        'Possible tampering detected',
        'MRZ zone unreadable',
    ],
    license: [
        'Image quality too low',
        'Document appears to be expired',
        'Photo area unclear',
        'Barcode unreadable',
        'Hologram not visible',
        'Address partially obscured',
    ],
    utility_bill: [
        'Document date too old',
        'Name not clearly visible',
        'Address partially obscured',
        'Bill total unclear',
        'Provider logo not visible',
    ],
};

/**
 * Get stored verification data for a user
 */
export function getVerificationData(userId: string): IdentityVerification | null {
    if (typeof window === 'undefined') return null;
    
    const allData = JSON.parse(localStorage.getItem(VERIFICATION_STORAGE_KEY) || '{}');
    return allData[userId] || null;
}

/**
 * Save verification data
 */
export function saveVerificationData(userId: string, data: IdentityVerification): void {
    if (typeof window === 'undefined') return;
    
    const allData = JSON.parse(localStorage.getItem(VERIFICATION_STORAGE_KEY) || '{}');
    allData[userId] = data;
    localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(allData));
}

/**
 * Initialize or reset verification for a user
 */
export function initializeVerification(userId: string): IdentityVerification {
    const data: IdentityVerification = {
        status: 'none',
        attempts: 0,
    };
    saveVerificationData(userId, data);
    return data;
}

/**
 * Analyze document using AI verification service
 * This now uses the centralized AI service abstraction
 */
async function analyzeDocument(
    documentType: DocumentType,
    imageBase64: string,
    userId: string
): Promise<VerificationResult> {
    // Import AI service
    const { verifyIdDocument } = await import('@/lib/ai/id-verification-service');

    // Check if image is valid base64
    if (!imageBase64 || !imageBase64.startsWith('data:image')) {
        return {
            success: false,
            status: 'failed',
            message: 'Invalid image format. Please upload a valid image file.',
            issues: ['Invalid image format'],
        };
    }

    // Check image size (rough estimate from base64 length)
    const imageSizeKB = (imageBase64.length * 0.75) / 1024;
    if (imageSizeKB < 10) {
        return {
            success: false,
            status: 'failed',
            message: 'Image appears too small. Please upload a clearer image.',
            issues: ['Image resolution too low'],
        };
    }

    // Use AI verification service
    try {
        const response = await verifyIdDocument(imageBase64, documentType, userId);

        // Utility bills always go to "under review"
        if (documentType === 'utility_bill') {
            return {
                success: true,
                status: 'under_review',
                message: 'Document submitted for manual review. This may take up to 3 hours.',
                confidence: response.score,
                issues: response.issues,
            };
        }

        // Map AI service response to verification result
        if (response.status === 'valid') {
            return {
                success: true,
                status: 'verified',
                message: 'Document verified successfully!',
                confidence: response.score,
            };
        } else {
            return {
                success: false,
                status: response.status === 'fake' ? 'failed' : 'failed',
                message: response.reason || 'Document verification failed. Please resubmit with a clearer image.',
                confidence: response.score,
                issues: response.issues,
            };
        }
    } catch (error: any) {
        console.error('[Document Verification] Error:', error);
        return {
            success: false,
            status: 'failed',
            message: error.message || 'Verification service error. Please try again.',
            issues: ['Service error'],
        };
    }
}

/**
 * Submit document for verification
 */
export async function submitDocumentVerification(
    userId: string,
    documentType: DocumentType,
    imageBase64: string
): Promise<VerificationResult> {
    // Get current verification data
    let verificationData = getVerificationData(userId);
    
    if (!verificationData) {
        verificationData = initializeVerification(userId);
    }

    // Update to pending
    verificationData.status = 'pending';
    verificationData.documentType = documentType;
    verificationData.documentImage = imageBase64;
    verificationData.attempts += 1;
    saveVerificationData(userId, verificationData);

    // Analyze the document using AI service
    const result = await analyzeDocument(documentType, imageBase64, userId);

    // Update verification data based on result
    verificationData.status = result.status;
    
    if (result.success && result.status === 'verified') {
        verificationData.verifiedAt = new Date().toISOString();
    } else if (result.status === 'under_review') {
        verificationData.reviewStartedAt = new Date().toISOString();
    } else if (result.status === 'failed') {
        verificationData.failureReasons = result.issues;
    }

    saveVerificationData(userId, verificationData);

    return result;
}

/**
 * Check if utility bill review period has passed (3 hours)
 */
export function checkUtilityBillReview(userId: string): VerificationResult {
    const verificationData = getVerificationData(userId);
    
    if (!verificationData || verificationData.status !== 'under_review') {
        return {
            success: false,
            status: 'failed',
            message: 'No pending review found',
        };
    }

    if (!verificationData.reviewStartedAt) {
        return {
            success: false,
            status: 'under_review',
            message: 'Review is still in progress',
        };
    }

    const reviewStart = new Date(verificationData.reviewStartedAt);
    const now = new Date();
    const hoursPassed = (now.getTime() - reviewStart.getTime()) / (1000 * 60 * 60);

    if (hoursPassed >= 3) {
        // 80% chance of success after manual review
        const isSuccess = Math.random() < 0.8;
        
        if (isSuccess) {
            verificationData.status = 'verified';
            verificationData.verifiedAt = new Date().toISOString();
            saveVerificationData(userId, verificationData);
            
            return {
                success: true,
                status: 'verified',
                message: 'Manual review completed. Your identity has been verified!',
                confidence: 0.95,
            };
        } else {
            verificationData.status = 'failed';
            verificationData.failureReasons = ['Document could not be verified by manual review'];
            saveVerificationData(userId, verificationData);
            
            return {
                success: false,
                status: 'failed',
                message: 'Manual review completed. Unfortunately, we could not verify your document.',
                issues: ['Document could not be verified by manual review'],
            };
        }
    }

    const hoursRemaining = Math.ceil(3 - hoursPassed);
    return {
        success: false,
        status: 'under_review',
        message: `Review in progress. Approximately ${hoursRemaining} hour(s) remaining.`,
    };
}

/**
 * Check if user is verified
 */
export function isUserVerified(userId: string): boolean {
    const data = getVerificationData(userId);
    return data?.status === 'verified';
}

/**
 * Get remaining attempts before utility bill option
 */
export function getRemainingAttempts(userId: string): number {
    const data = getVerificationData(userId);
    if (!data) return 3;
    return Math.max(0, 3 - data.attempts);
}

