/**
 * Password Migration Utility
 * 
 * This script helps migrate existing users to the new PBKDF2 password hashing.
 * 
 * IMPORTANT: Existing users will need to reset their passwords OR
 * you can ask them to re-enter their password once to migrate.
 * 
 * For a smoother migration, we recommend:
 * 1. Clear all user data (since this is demo/development)
 * 2. Users will sign up fresh with new secure hashes
 */

import { hashPassword } from './password';

/**
 * Check if a hash is from the old SHA-256 system
 */
export function isOldHashFormat(hash: string): boolean {
    // Old hashes were 64 characters (SHA-256)
    // New hashes are also 64 characters (PBKDF2)
    // But we can't distinguish them, so we assume all existing are old
    return hash.length === 64;
}

/**
 * Clear all user authentication data
 * Call this to force all users to sign up again with new hashes
 */
export function clearAllUserData(): void {
    if (typeof window === 'undefined') {
        console.warn('[Migration] Can only run in browser');
        return;
    }

    const confirmation = confirm(
        'This will clear ALL user accounts and require everyone to sign up again.\n\n' +
        'This is recommended for migrating to the new password system.\n\n' +
        'Continue?'
    );

    if (confirmation) {
        localStorage.removeItem('donatedao-users');
        localStorage.removeItem('donatedao-user-storage');
        console.log('[Migration] ✓ All user data cleared');
        alert('User data cleared successfully! All users must sign up again.');
    }
}

/**
 * Migrate a single user's password
 * 
 * This requires the user to enter their password again
 * (we can't decrypt old hashes)
 */
export async function migrateUserPassword(
    email: string,
    plainPassword: string
): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
        // Get all users
        const usersJson = localStorage.getItem('donatedao-users');
        if (!usersJson) {
            console.error('[Migration] No users found');
            return false;
        }

        const users = JSON.parse(usersJson);
        const userIndex = users.findIndex((u: any) => u.email === email);

        if (userIndex === -1) {
            console.error('[Migration] User not found:', email);
            return false;
        }

        // Hash password with new system
        const newHash = await hashPassword(plainPassword);

        // Update user
        users[userIndex].passwordHash = newHash;
        localStorage.setItem('donatedao-users', JSON.stringify(users));

        console.log('[Migration] ✓ Password migrated for:', email);
        return true;

    } catch (error) {
        console.error('[Migration] Error:', error);
        return false;
    }
}

/**
 * Dev tool: Test if password hashing is deterministic
 */
export async function testPasswordConsistency(): Promise<void> {
    console.log('=== Testing Password Consistency ===');

    const testPasswords = ['test123', 'MyPassword!123', 'secure_pass_2025'];

    for (const password of testPasswords) {
        const hash1 = await hashPassword(password);
        const hash2 = await hashPassword(password);
        const hash3 = await hashPassword(password);

        const isConsistent = hash1 === hash2 && hash2 === hash3;

        console.log(`Password: "${password}"`);
        console.log(`  Hash 1: ${hash1.substring(0, 20)}...`);
        console.log(`  Hash 2: ${hash2.substring(0, 20)}...`);
        console.log(`  Hash 3: ${hash3.substring(0, 20)}...`);
        console.log(`  Consistent: ${isConsistent ? '✓ YES' : '✗ NO'}`);
        console.log('');
    }
}

// Export as global for browser console access
if (typeof window !== 'undefined') {
    (window as any).passwordMigration = {
        clearAllUserData,
        migrateUserPassword,
        testConsistency: testPasswordConsistency,
    };

    console.log('[Migration] Tools available in console as: passwordMigration');
    console.log('  - passwordMigration.clearAllUserData()');
    console.log('  - passwordMigration.migrateUserPassword(email, password)');
    console.log('  - password Migration.testConsistency()');
}
