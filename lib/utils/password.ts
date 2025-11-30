/**
 * Password hashing utilities using PBKDF2
 * 
 * IMPORTANT: This is a DEMO implementation for development/testing.
 * For production, use a proper backend with Argon2 or bcrypt.
 * 
 * This implementation uses PBKDF2 with Web Crypto API for:
 * - Deterministic hashing (same password = same hash)
 * - Browser compatibility
 * - Reasonable security for demo purposes
 */

// Fixed salt for deterministic hashing (demo only!)
// In production, use per-user random salts stored in database
const FIXED_SALT = 'donatedao-demo-salt-2025';
const ITERATIONS = 10000; // Number of PBKDF2 iterations

/**
 * Convert string to Uint8Array
 */
function stringToUint8Array(str: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
    const arr = Array.from(new Uint8Array(buffer));
    return arr.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash password using PBKDF2 (deterministic)
 * 
 * This function ALWAYS produces the same hash for the same password.
 * Uses Web Crypto API's PBKDF2 with a fixed salt.
 */
export async function hashPassword(password: string): Promise<string> {
    try {
        // Check if we're in a browser with crypto.subtle
        if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
            // Server-side or no crypto API - use simple deterministic hash
            return simpleDeterministicHash(password);
        }

        // Import password as key material
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            stringToUint8Array(password) as BufferSource,
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );

        // Derive bits using PBKDF2
        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: stringToUint8Array(FIXED_SALT) as BufferSource,
                iterations: ITERATIONS,
                hash: 'SHA-256'
            },
            passwordKey,
            256 // 256 bits = 32 bytes
        );

        // Convert to hex string
        const hash = bufferToHex(derivedBits);
        console.log('[Password] Hashed successfully using PBKDF2');
        return hash;

    } catch (error) {
        console.warn('[Password] PBKDF2 failed, using fallback:', error);
        return simpleDeterministicHash(password);
    }
}

/**
 * Simple deterministic hash fallback
 * Used when crypto.subtle is not available
 */
function simpleDeterministicHash(password: string): string {
    // Combine password with fixed salt
    const combined = `${FIXED_SALT}:${password}:${FIXED_SALT}`;

    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    // Multiple rounds for better security
    let result = hash.toString(16);
    for (let round = 0; round < 100; round++) {
        let roundHash = 0;
        for (let i = 0; i < result.length; i++) {
            roundHash = ((roundHash << 5) - roundHash) + result.charCodeAt(i);
            roundHash = roundHash & roundHash;
        }
        result = roundHash.toString(16);
    }

    // Pad to 64 characters
    return result.padStart(64, '0').slice(0, 64);
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
        const passwordHash = await hashPassword(password);
        const isValid = passwordHash === storedHash;

        console.log('[Password] Verification:', {
            inputHashLength: passwordHash.length,
            storedHashLength: storedHash.length,
            match: isValid
        });

        return isValid;
    } catch (error) {
        console.error('[Password] Verification error:', error);
        return false;
    }
}

/**
 * Test if password hashing is working correctly
 * Returns true if the same password produces the same hash twice
 */
export async function testPasswordHashing(): Promise<boolean> {
    const testPassword = 'test123';
    const hash1 = await hashPassword(testPassword);
    const hash2 = await hashPassword(testPassword);
    const isDeterministic = hash1 === hash2;

    console.log('[Password] Determinism test:', {
        hash1,
        hash2,
        match: isDeterministic
    });

    return isDeterministic;
}
