# Security Features Documentation

> **Comprehensive guide to security features in DonateDAO**
> 
> **Last Updated**: November 29, 2025

---

## 🔐 Quick Security Summary for Beginners

| Feature | What It Does | How to Use |
|---------|--------------|------------|
| **2FA** | Extra login protection with 6-digit code | Profile → Settings → Enable 2FA |
| **ID Verification** | Proves you're real before creating campaigns | Create Campaign → Verify Identity |
| **Password Reset** | Get back into your account | Login → Forgot Password? |
| **Email Verification** | Confirms your email is real | Profile → Settings → Verify Email |
| **Backup Codes** | Emergency access if you lose 2FA device | Saved when enabling 2FA (8 codes) |
| **Multi-sig** | Multiple people must approve withdrawals | Automatic for campaign funds |

### Is My Data Safe?

✅ **Your wallet private key**: Never leaves your wallet  
✅ **Your password**: Hashed (can't be read)  
✅ **Your transactions**: On public blockchain (transparent)  
✅ **Your profile**: Stored in your browser (localStorage)  
✅ **Campaign funds**: Protected by 3-of-5 multi-signature  

---

## Table of Contents

1. [Overview](#overview)
2. [Two-Factor Authentication (2FA)](#two-factor-authentication-2fa)
3. [Identity Verification](#identity-verification)
4. [Password Security](#password-security)
5. [OTP-Based Verification](#otp-based-verification)
6. [Wallet Security](#wallet-security)
7. [Multi-Signature Withdrawals](#multi-signature-withdrawals)
8. [Best Practices](#best-practices)

---

## Overview

DonateDAO implements multiple layers of security to protect users and their funds:

| Layer | Feature | Description |
|-------|---------|-------------|
| Authentication | 2FA | Optional TOTP-based two-factor authentication |
| Identity | Document Verification | AI-powered passport/license verification |
| Account | Password Hashing | SHA-256 hashing with Web Crypto API |
| Recovery | OTP System | Time-limited one-time passwords |
| Wallet | CIP-30 | Standard Cardano wallet integration |
| Funds | Multi-sig | 3-of-5 signature requirement for withdrawals |

---

## Two-Factor Authentication (2FA)

### What is 2FA?

Two-factor authentication adds an extra layer of security by requiring a time-based code from your authenticator app when logging in.

### Compatible Authenticator Apps

- Google Authenticator
- Authy
- Microsoft Authenticator
- 1Password
- Any TOTP-compatible app

### How to Enable 2FA

1. **Navigate to Profile → Settings**
2. **Find "Two-Factor Authentication" section**
3. **Click "Enable 2FA"**
4. **Scan QR code** with your authenticator app
   - Or manually enter the secret key
5. **Enter 6-digit verification code** from the app
6. **Save backup codes** (8 one-time codes for recovery)
7. **2FA is now active**

### Backup Codes

When you enable 2FA, you receive 8 backup codes:
- Each code can only be used once
- Use if you lose access to your authenticator
- Store securely (write down or save in password manager)
- Codes are 8 characters long (alphanumeric)

### Using 2FA

When logging in with 2FA enabled:
1. Enter email and password
2. Modal appears requesting 6-digit code
3. Open authenticator app and enter current code
4. Or enter one of your backup codes
5. Login completes on successful verification

### Disabling 2FA

1. Go to Profile → Settings
2. Click "Disable 2FA"
3. Enter current 6-digit code from authenticator
4. 2FA will be removed from your account

### Technical Details

```typescript
// Library used: otplib
// Algorithm: SHA-1 (TOTP standard)
// Code length: 6 digits
// Time step: 30 seconds
// Backup codes: 8 x 8-character alphanumeric

import { authenticator } from 'otplib';

// Generate secret
const secret = authenticator.generateSecret();

// Generate URI for QR code
const uri = authenticator.keyuri(email, 'DonateDAO', secret);

// Verify token
const isValid = authenticator.verify({ token, secret });
```

---

## Identity Verification

### Why Identity Verification?

To prevent scams and protect donors, campaign creators must verify their identity before creating campaigns.

### Supported Documents

1. **Passport** - Primary verification
2. **Driving License** - Primary verification
3. **Utility Bill** - Fallback option (manual review)

### Verification Process

#### Step 1: Select Document Type
- Choose passport or driving license
- Upload a clear photo of the document

#### Step 2: AI Verification
- Our mock ML model analyzes the document
- Processing takes 2-3 seconds
- 70% success rate (for demo purposes)

#### Step 3: Result
- **Success**: Account verified, can create campaigns
- **Failure**: Up to 3 attempts allowed

#### Step 4: Fallback (After 3 Failures)
If primary verification fails 3 times:
1. Utility bill option becomes available
2. Upload a recent utility bill
3. Manual review takes up to 3 hours
4. 80% success rate after manual review

### Verification Status

| Status | Description |
|--------|-------------|
| `none` | Not yet started |
| `pending` | Verification in progress |
| `verified` | Successfully verified |
| `failed` | Verification failed |
| `under_review` | Utility bill under manual review |

### Technical Implementation

```typescript
// Location: lib/verification/documentVerifier.ts

interface VerificationResult {
    success: boolean;
    status: VerificationStatus;
    message: string;
    confidence?: number;
    issues?: string[];
}

// Submit document for verification
await submitDocumentVerification(userId, 'passport', imageBase64);

// Check if user is verified
const isVerified = isUserVerified(userId);

// Check utility bill review status (after 3 hours)
const reviewResult = checkUtilityBillReview(userId);
```

---

## Password Security

### Password Requirements

- Minimum 8 characters
- Stored as SHA-256 hash
- Never stored in plain text

### Hashing Implementation

```typescript
// Location: lib/utils/password.ts

async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
}
```

### Production Recommendations

For production deployment, consider:
- Use bcrypt or Argon2 instead of SHA-256
- Implement server-side hashing
- Add password strength validation
- Rate-limit login attempts
- Implement account lockout

---

## OTP-Based Verification

### Use Cases

1. **Email Verification** - Verify email ownership
2. **Password Reset** - Recover account access

### OTP Characteristics

| Property | Value |
|----------|-------|
| Length | 6 digits |
| Expiry | 10 minutes |
| Type | Numeric |
| Delivery | Simulated (alert) |

### Password Reset Flow

1. Go to `/auth/forgot-password`
2. Enter your email address
3. Receive 6-digit OTP (shown in alert for demo)
4. Enter OTP on verification page
5. Create new password
6. Login with new password

### Email Verification Flow

1. Sign up with email
2. Go to Profile → Settings
3. Click "Send Verification Email"
4. Receive 6-digit OTP
5. Enter OTP to verify

### Technical Implementation

```typescript
// Location: lib/utils/otp.ts

// Generate and send OTP (simulated)
const otpData = sendOTP(email, 'password_reset');
// Shows alert: "Your OTP is: 123456"

// Verify OTP
const isValid = verifyOTP(email, '123456', 'password_reset');

// Check if verified
const wasVerified = isOTPVerified(email, 'password_reset');

// Clear OTP after use
clearOTP(email, 'password_reset');
```

---

## Wallet Security

### CIP-30 Standard

DonateDAO uses the CIP-30 standard for wallet integration:
- Private keys never leave your wallet
- Connection requires wallet approval
- Each transaction requires wallet signature

### Supported Wallets

- Nami
- Eternl
- Flint
- Typhon
- Yoroi
- Gero
- Any CIP-30 compatible wallet

### Security Best Practices

1. **Never share your seed phrase**
2. **Verify transaction details** before signing
3. **Use a hardware wallet** for large holdings
4. **Disconnect wallet** when done
5. **Check network** (testnet vs mainnet)

---

## Multi-Signature Withdrawals

### How It Works

Campaign withdrawals require approval from multiple admins:

| Requirement | Value |
|-------------|-------|
| Total Admins | Up to 7 |
| Required Signatures | 3 of 5 |
| Time Lock | Optional |

### Withdrawal Process

1. Campaign creator initiates withdrawal request
2. Request specifies amount and purpose
3. Other admins review and sign
4. Once 3 signatures collected, withdrawal executes
5. Funds sent to creator's wallet

### Security Benefits

- No single person can withdraw funds
- Transparent approval process
- All signatures recorded on-chain
- Prevents unauthorized withdrawals

---

## Best Practices

### For Users

1. **Enable 2FA** on your account
2. **Use a strong, unique password**
3. **Verify your email** for account recovery
4. **Save backup codes** securely
5. **Keep your wallet secure**
6. **Review transactions** before signing

### For Campaign Creators

1. **Complete identity verification**
2. **Add multiple trusted admins**
3. **Use clear withdrawal purposes**
4. **Communicate with donors**
5. **Keep campaign information updated**

### For Platform Security

1. All sensitive data hashed client-side
2. No passwords stored server-side
3. All wallet interactions use CIP-30
4. Transaction data on public blockchain
5. Open-source smart contracts

---

## Security Roadmap

### Planned Improvements

- [ ] Server-side password hashing (bcrypt/Argon2)
- [ ] Real email OTP delivery (SendGrid/Resend)
- [ ] Hardware wallet support (Ledger/Trezor)
- [ ] WebAuthn/passkey support
- [ ] Real ML document verification API
- [ ] Rate limiting and DDOS protection
- [ ] Audit logging dashboard

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** disclose publicly
2. Contact the development team
3. Provide detailed description
4. Allow time for fix before disclosure

---

## Related Documentation

- [README.md](./README.md) - Main documentation
- [COMPONENTS_README.md](./COMPONENTS_README.md) - Component details
- [validators/README.md](./validators/README.md) - Smart contract security

