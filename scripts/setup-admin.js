/**
 * Browser Console Script to Create Admin Account
 * 
 * Copy and paste this entire script into your browser console
 * after the app is loaded, then run: setupAdminAccount()
 */

async function setupAdminAccount() {
    // Admin credentials
    const ADMIN_EMAIL = 'admin@donatedao.io';
    const ADMIN_PASSWORD = 'Admin@1234';
    const ADMIN_FIRSTNAME = 'Admin';
    const ADMIN_LASTNAME = 'User';
    const ADMIN_USERNAME = 'admin';
    const ADMIN_WALLET = 'addr1q8gc0kzz496lhjavkyx4hydn9tpnd58a876d44uuwty59hymqzc3s3a2c3thyrle46n6ty5zmfsqc4jrhxhdtgmt8cgsushahj';
    
    try {
        // Import password hashing (simplified version)
        async function hashPassword(password) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        
        // Hash password
        const passwordHash = await hashPassword(ADMIN_PASSWORD);
        
        // Get existing users
        let existingUsers = [];
        try {
            existingUsers = JSON.parse(localStorage.getItem('donatedao-users') || '[]');
        } catch (e) {
            existingUsers = [];
        }
        
        // Check if admin exists
        const adminIndex = existingUsers.findIndex(u => u.email === ADMIN_EMAIL);
        
        const adminProfile = {
            email: ADMIN_EMAIL,
            emailVerified: true,
            firstName: ADMIN_FIRSTNAME,
            lastName: ADMIN_LASTNAME,
            username: ADMIN_USERNAME,
            displayName: `${ADMIN_FIRSTNAME} ${ADMIN_LASTNAME}`,
            avatar: '👑',
            bio: 'DonateDAO Administrator',
            walletAddress: ADMIN_WALLET,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            preferences: {
                theme: 'dark',
                currency: 'ADA',
                notifications: true,
                emailNotifications: true,
                email: ADMIN_EMAIL,
            },
            authMethod: 'both',
        };
        
        if (adminIndex >= 0) {
            // Update existing
            existingUsers[adminIndex] = {
                ...existingUsers[adminIndex],
                email: ADMIN_EMAIL,
                passwordHash,
                firstName: ADMIN_FIRSTNAME,
                lastName: ADMIN_LASTNAME,
                username: ADMIN_USERNAME,
                walletAddress: ADMIN_WALLET,
                profile: adminProfile,
            };
            console.log('✅ Admin account updated');
        } else {
            // Create new
            existingUsers.push({
                email: ADMIN_EMAIL,
                passwordHash,
                firstName: ADMIN_FIRSTNAME,
                lastName: ADMIN_LASTNAME,
                username: ADMIN_USERNAME,
                walletAddress: ADMIN_WALLET,
                profile: adminProfile,
            });
            console.log('✅ Admin account created');
        }
        
        // Save users
        localStorage.setItem('donatedao-users', JSON.stringify(existingUsers));
        
        // Set verification status
        const verificationData = JSON.parse(localStorage.getItem('donatedao-verification') || '{}');
        verificationData[ADMIN_EMAIL] = {
            status: 'verified',
            documentType: 'passport',
            attempts: 1,
            verifiedAt: new Date().toISOString(),
        };
        localStorage.setItem('donatedao-verification', JSON.stringify(verificationData));
        
        console.log('✅ Verification status set to verified');
        console.log('');
        console.log('═══════════════════════════════════════');
        console.log('   ADMIN ACCOUNT CREATED SUCCESSFULLY');
        console.log('═══════════════════════════════════════');
        console.log('');
        console.log('📧 Email:', ADMIN_EMAIL);
        console.log('🔑 Password:', ADMIN_PASSWORD);
        console.log('👤 Username:', ADMIN_USERNAME);
        console.log('✅ Verification: VERIFIED');
        console.log('💼 Wallet:', ADMIN_WALLET);
        console.log('');
        console.log('💡 You can now login and create campaigns!');
        console.log('═══════════════════════════════════════');
        
        return {
            success: true,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            username: ADMIN_USERNAME,
        };
    } catch (error) {
        console.error('❌ Error creating admin account:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

// Make it available globally
window.setupAdminAccount = setupAdminAccount;

console.log('💡 Admin setup script loaded!');
console.log('   Run: setupAdminAccount()');

