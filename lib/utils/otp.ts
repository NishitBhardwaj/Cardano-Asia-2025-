/**
 * OTP Utilities
 * Generates and verifies one-time passwords for email verification and password reset
 */

export interface OTPData {
    otp: string;
    email: string;
    createdAt: string;
    expiresAt: string;
    type: 'email_verification' | 'password_reset';
    verified: boolean;
}

const OTP_STORAGE_KEY = 'donatedao-otp';
const OTP_EXPIRY_MINUTES = 10;

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP for later verification
 */
export function storeOTP(email: string, type: OTPData['type']): OTPData {
    const otp = generateOTP();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const otpData: OTPData = {
        otp,
        email: email.toLowerCase(),
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        type,
        verified: false,
    };

    // Store in localStorage
    if (typeof window !== 'undefined') {
        const allOTPs = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '[]');
        // Remove any existing OTPs for this email and type
        const filtered = allOTPs.filter(
            (o: OTPData) => !(o.email === email.toLowerCase() && o.type === type)
        );
        filtered.push(otpData);
        localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(filtered));
    }

    return otpData;
}

/**
 * Verify OTP
 */
export function verifyOTP(email: string, otp: string, type: OTPData['type']): boolean {
    if (typeof window === 'undefined') return false;

    const allOTPs: OTPData[] = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '[]');
    const otpData = allOTPs.find(
        (o) => o.email === email.toLowerCase() && o.type === type && o.otp === otp
    );

    if (!otpData) return false;

    // Check if expired
    if (new Date(otpData.expiresAt) < new Date()) {
        return false;
    }

    // Mark as verified
    const updatedOTPs = allOTPs.map((o) => {
        if (o.email === email.toLowerCase() && o.type === type) {
            return { ...o, verified: true };
        }
        return o;
    });
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(updatedOTPs));

    return true;
}

/**
 * Check if OTP was verified
 */
export function isOTPVerified(email: string, type: OTPData['type']): boolean {
    if (typeof window === 'undefined') return false;

    const allOTPs: OTPData[] = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '[]');
    const otpData = allOTPs.find(
        (o) => o.email === email.toLowerCase() && o.type === type && o.verified
    );

    return !!otpData;
}

/**
 * Clear OTP after use
 */
export function clearOTP(email: string, type: OTPData['type']): void {
    if (typeof window === 'undefined') return;

    const allOTPs: OTPData[] = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '[]');
    const filtered = allOTPs.filter(
        (o) => !(o.email === email.toLowerCase() && o.type === type)
    );
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Send OTP via email
 */
export async function sendOTP(email: string, type: OTPData['type']): Promise<{ success: boolean; otpData?: OTPData; error?: string }> {
    const otpData = storeOTP(email, type);
    
    try {
        // Send OTP via email API
        const response = await fetch('/api/email/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                otp: otpData.otp,
                type,
            }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log(`[OTP] Email sent to ${email} for ${type}`);
            return { success: true, otpData };
        } else {
            console.error('[OTP] Failed to send email:', data.message);
            // Fallback: Show OTP in console and alert for development
            console.log(`[OTP FALLBACK] ${type} for ${email}: ${otpData.otp}`);
            alert(`📧 OTP Email Service Issue\n\nYour OTP is: ${otpData.otp}\n\n(Check console for details)`);
            return { success: true, otpData, error: data.message };
        }
    } catch (error: any) {
        console.error('[OTP] Error sending email:', error);
        // Fallback: Show OTP in console and alert for development
        console.log(`[OTP FALLBACK] ${type} for ${email}: ${otpData.otp}`);
        alert(`📧 OTP Email Service Issue\n\nYour OTP is: ${otpData.otp}\n\n(Check console for details)`);
        return { success: true, otpData, error: error.message };
    }
}

/**
 * Resend OTP - generates a new OTP and sends it
 */
export async function resendOTP(email: string, type: OTPData['type']): Promise<{ success: boolean; otpData?: OTPData; error?: string }> {
    // Clear old OTP first
    clearOTP(email, type);
    // Send new OTP
    return sendOTP(email, type);
}
