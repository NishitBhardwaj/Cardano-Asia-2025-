/**
 * TOTP (Time-based One-Time Password) Utilities
 * For Two-Factor Authentication with Google Authenticator
 */

import { authenticator } from 'otplib';

const APP_NAME = 'DonateDAO';
const TOTP_STORAGE_KEY = 'donatedao-2fa';

export interface TwoFactorData {
    enabled: boolean;
    secret: string;
    verifiedAt?: string;
    backupCodes: string[];
}

/**
 * Generate a new TOTP secret
 */
export function generateTOTPSecret(): string {
    return authenticator.generateSecret();
}

/**
 * Generate authenticator URI for QR code
 */
export function generateTOTPUri(secret: string, email: string): string {
    return authenticator.keyuri(email, APP_NAME, secret);
}

/**
 * Verify a TOTP token
 */
export function verifyTOTP(token: string, secret: string): boolean {
    try {
        return authenticator.verify({ token, secret });
    } catch {
        return false;
    }
}

/**
 * Generate backup codes
 */
export function generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        codes.push(code);
    }
    return codes;
}

/**
 * Get 2FA data for a user
 */
export function get2FAData(email: string): TwoFactorData | null {
    if (typeof window === 'undefined') return null;
    
    const allData = JSON.parse(localStorage.getItem(TOTP_STORAGE_KEY) || '{}');
    return allData[email.toLowerCase()] || null;
}

/**
 * Save 2FA data for a user
 */
export function save2FAData(email: string, data: TwoFactorData): void {
    if (typeof window === 'undefined') return;
    
    const allData = JSON.parse(localStorage.getItem(TOTP_STORAGE_KEY) || '{}');
    allData[email.toLowerCase()] = data;
    localStorage.setItem(TOTP_STORAGE_KEY, JSON.stringify(allData));
}

/**
 * Remove 2FA data for a user
 */
export function remove2FAData(email: string): void {
    if (typeof window === 'undefined') return;
    
    const allData = JSON.parse(localStorage.getItem(TOTP_STORAGE_KEY) || '{}');
    delete allData[email.toLowerCase()];
    localStorage.setItem(TOTP_STORAGE_KEY, JSON.stringify(allData));
}

/**
 * Check if 2FA is enabled for a user
 */
export function is2FAEnabled(email: string): boolean {
    const data = get2FAData(email);
    return data?.enabled === true;
}

/**
 * Setup 2FA for a user (returns secret and URI)
 */
export function setup2FA(email: string): { secret: string; uri: string; backupCodes: string[] } {
    const secret = generateTOTPSecret();
    const uri = generateTOTPUri(secret, email);
    const backupCodes = generateBackupCodes();
    
    // Store but don't enable yet (needs verification)
    save2FAData(email, {
        enabled: false,
        secret,
        backupCodes,
    });
    
    return { secret, uri, backupCodes };
}

/**
 * Enable 2FA after verification
 */
export function enable2FA(email: string, token: string): boolean {
    const data = get2FAData(email);
    if (!data) return false;
    
    // Verify the token
    if (!verifyTOTP(token, data.secret)) {
        return false;
    }
    
    // Enable 2FA
    save2FAData(email, {
        ...data,
        enabled: true,
        verifiedAt: new Date().toISOString(),
    });
    
    return true;
}

/**
 * Disable 2FA for a user
 */
export function disable2FA(email: string, token: string): boolean {
    const data = get2FAData(email);
    if (!data || !data.enabled) return false;
    
    // Verify the token
    if (!verifyTOTP(token, data.secret)) {
        return false;
    }
    
    remove2FAData(email);
    return true;
}

/**
 * Verify 2FA token (for login)
 */
export function verify2FAToken(email: string, token: string): boolean {
    const data = get2FAData(email);
    if (!data || !data.enabled) return false;
    
    // Check backup codes first
    const backupIndex = data.backupCodes.indexOf(token.toUpperCase());
    if (backupIndex !== -1) {
        // Remove used backup code
        data.backupCodes.splice(backupIndex, 1);
        save2FAData(email, data);
        return true;
    }
    
    // Check TOTP
    return verifyTOTP(token, data.secret);
}

