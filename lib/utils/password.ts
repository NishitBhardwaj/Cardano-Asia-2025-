/**
 * Password hashing utilities using Web Crypto API
 */

// Simple hash function fallback for non-secure contexts
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    // Add salt and make it longer
    const salted = `donatedao_${str}_${hash}_salt`;
    let finalHash = '';
    for (let i = 0; i < salted.length; i++) {
        finalHash += salted.charCodeAt(i).toString(16);
    }
    return finalHash.slice(0, 64);
}

// Hash password using SHA-256 (for demo - in production use bcrypt or Argon2)
export async function hashPassword(password: string): Promise<string> {
    // Check if crypto.subtle is available (requires secure context)
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.warn('crypto.subtle not available, using fallback hash');
            return simpleHash(password);
        }
    }
    // Fallback for SSR or non-secure contexts
    return simpleHash(password);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
}

