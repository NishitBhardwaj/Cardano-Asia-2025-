# Admin Account Setup Guide

## ✅ AUTOMATIC SETUP (Recommended)

**The admin account is now automatically created when you start the app!**

No manual setup needed. Just:
1. Start the dev server: `npm run dev`
2. Open the app in your browser
3. The admin account is automatically created
4. Login with the credentials below

---

## Manual Setup (Browser Console) - Only if needed

### Step 1: Open Browser Console
1. Start your development server: `npm run dev`
2. Open the app in your browser: `http://localhost:3000`
3. Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac) to open Developer Tools
4. Go to the **Console** tab

### Step 2: Run Setup Script
Copy and paste this entire script into the console and press Enter:

```javascript
async function setupAdminAccount() {
    const ADMIN_EMAIL = 'admin@donatedao.io';
    const ADMIN_PASSWORD = 'Admin@1234';
    const ADMIN_FIRSTNAME = 'Admin';
    const ADMIN_LASTNAME = 'User';
    const ADMIN_USERNAME = 'admin';
    const ADMIN_WALLET = 'addr1q8gc0kzz496lhjavkyx4hydn9tpnd58a876d44uuwty59hymqzc3s3a2c3thyrle46n6ty5zmfsqc4jrhxhdtgmt8cgsushahj';
    
    try {
        async function hashPassword(password) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        
        const passwordHash = await hashPassword(ADMIN_PASSWORD);
        let existingUsers = JSON.parse(localStorage.getItem('donatedao-users') || '[]');
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
        } else {
            existingUsers.push({
                email: ADMIN_EMAIL,
                passwordHash,
                firstName: ADMIN_FIRSTNAME,
                lastName: ADMIN_LASTNAME,
                username: ADMIN_USERNAME,
                walletAddress: ADMIN_WALLET,
                profile: adminProfile,
            });
        }
        
        localStorage.setItem('donatedao-users', JSON.stringify(existingUsers));
        
        const verificationData = JSON.parse(localStorage.getItem('donatedao-verification') || '{}');
        verificationData[ADMIN_EMAIL] = {
            status: 'verified',
            documentType: 'passport',
            attempts: 1,
            verifiedAt: new Date().toISOString(),
        };
        localStorage.setItem('donatedao-verification', JSON.stringify(verificationData));
        
        console.log('✅ Admin account created successfully!');
        console.log('📧 Email:', ADMIN_EMAIL);
        console.log('🔑 Password:', ADMIN_PASSWORD);
        console.log('👤 Username:', ADMIN_USERNAME);
        console.log('✅ Verification: VERIFIED');
        console.log('💼 Wallet:', ADMIN_WALLET);
        
        return { success: true, email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
    } catch (error) {
        console.error('❌ Error:', error);
        return { success: false, error: error.message };
    }
}

setupAdminAccount();
```

### Step 3: Login
1. Go to `/auth` or click "Login" in the header
2. Select the **Email** tab
3. Enter:
   - **Email**: `admin@donatedao.io`
   - **Password**: `Admin@1234`
4. Click "Login"

### Step 4: Create Campaign
1. After login, go to `/create` or click "Create Campaign"
2. You should be able to create campaigns immediately (no verification required)

---

## Admin Account Details

| Field | Value |
|-------|-------|
| **Email** | `admin@donatedao.io` |
| **Password** | `Admin@1234` |
| **Username** | `admin` |
| **First Name** | `Admin` |
| **Last Name** | `User` |
| **Wallet Address** | `addr1q8gc0kzz496lhjavkyx4hydn9tpnd58a876d44uuwty59hymqzc3s3a2c3thyrle46n6ty5zmfsqc4jrhxhdtgmt8cgsushahj` |
| **Verification Status** | ✅ **VERIFIED** |
| **Email Verified** | ✅ **YES** |

---

## Security Note

⚠️ **Important**: This is a test account for development only. Change the password in production!

---

## Troubleshooting

### Account not created?
- Make sure you're on the app page (not just console)
- Check browser console for errors
- Try refreshing the page and running the script again

### Can't login?
- Make sure the script ran successfully
- Check that `localStorage` has the user data
- Try clearing browser cache and running the script again

### Still asks for verification?
- Check that verification data was saved: `localStorage.getItem('donatedao-verification')`
- Make sure the userId (email) matches in both user and verification data

---

## Alternative: Manual Setup

If the script doesn't work, you can manually set the data:

1. **Create User** (in localStorage `donatedao-users`):
```json
{
  "email": "admin@donatedao.io",
  "passwordHash": "<hashed_password>",
  "firstName": "Admin",
  "lastName": "User",
  "username": "admin",
  "walletAddress": "addr1q8gc0kzz496lhjavkyx4hydn9tpnd58a876d44uuwty59hymqzc3s3a2c3thyrle46n6ty5zmfsqc4jrhxhdtgmt8cgsushahj",
  "profile": {
    "email": "admin@donatedao.io",
    "emailVerified": true,
    "firstName": "Admin",
    "lastName": "User",
    "username": "admin",
    "displayName": "Admin User",
    "avatar": "👑",
    "bio": "DonateDAO Administrator",
    "walletAddress": "addr1q8gc0kzz496lhjavkyx4hydn9tpnd58a876d44uuwty59hymqzc3s3a2c3thyrle46n6ty5zmfsqc4jrhxhdtgmt8cgsushahj",
    "createdAt": "2025-01-15T00:00:00.000Z",
    "lastLoginAt": "2025-01-15T00:00:00.000Z",
    "preferences": {
      "theme": "dark",
      "currency": "ADA",
      "notifications": true,
      "emailNotifications": true,
      "email": "admin@donatedao.io"
    },
    "authMethod": "both"
  }
}
```

2. **Set Verification** (in localStorage `donatedao-verification`):
```json
{
  "admin@donatedao.io": {
    "status": "verified",
    "documentType": "passport",
    "attempts": 1,
    "verifiedAt": "2025-01-15T00:00:00.000Z"
  }
}
```

