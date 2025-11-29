# DApp Components Documentation

> **Complete guide to every component in the Cardano Donation DApp**
> 
> **Last Updated**: November 29, 2025

---

## 🎯 Quick Reference for Beginners

**New to this codebase?** Here's what each major feature does:

### Pages (What Users See)

| Page | URL | What It Does |
|------|-----|--------------|
| Home | `/` | Landing page with intro and featured campaigns |
| Campaigns | `/campaigns` | Browse all fundraising campaigns |
| Campaign Detail | `/campaigns/[id]` | View single campaign, donate, manage admins |
| Create | `/create` | Create a new fundraising campaign |
| Profile | `/profile` | View your account, transactions, settings |
| Login | `/auth/login` | Sign in with email/password |
| Signup | `/auth/signup` | Create new account with email |
| Auth | `/auth` | Connect wallet or choose login method |
| Forgot Password | `/auth/forgot-password` | Reset password using OTP |
| Verify Identity | `/auth/verify-identity` | Upload ID document for verification |
| Public Donate | `/donate/[id]` | Donate without account (wallet only) |

### Key Components (Building Blocks)

| Component | What It Does |
|-----------|--------------|
| `Header` | Top navigation bar with login/wallet buttons |
| `Chatbot` | AI assistant that answers questions |
| `QRCodeGenerator` | Creates downloadable QR codes for campaigns |
| `ImageUpload` | Handles image selection and compression |
| `TwoFactorSetup` | Sets up Google Authenticator 2FA |
| `DocumentVerification` | Handles ID verification flow |
| `AdminManagement` | Add/remove campaign admins, sharing links |

### Data Storage (Where Info Lives)

| Store | What It Stores |
|-------|----------------|
| `userStore` | User profile, login state, transactions |
| `campaignStore` | All campaigns, donations, admin lists |
| `localStorage` | Chat history, 2FA data, OTP codes |

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [SSR/CSR Split Pattern](#ssrcsr-split-pattern)
- [Technology Stack](#technology-stack)
- [Page Components](#page-components)
- [Content Components](#content-components)
- [Shared Components](#shared-components)
- [Custom Hooks](#custom-hooks)
- [State Management](#state-management)
- [Smart Contracts](#smart-contracts)
- [Utility Libraries](#utility-libraries)
- [Styling System](#styling-system)

---

## Getting Started

### Prerequisites

- **Node.js**: v18.17.0 or higher
- **npm**: v9.0.0 or higher (or yarn/pnpm)
- **Cardano Wallet**: Nami, Eternl, or Flint installed in browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cardano-donation-dapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.local.example .env.local
   ```
   Update `.env.local` with your Blockfrost API key.

### Running the App

```bash
npm run dev
# Open http://localhost:3000
```

### Building for Production

```bash
npm run build
npm start
```

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Next.js Frontend                      │  │
│  │                                                          │  │
│  │   ┌─────────────────────────────────────────────────┐  │  │
│  │   │              ClientProviders                      │  │  │
│  │   │               (MeshProvider)                      │  │  │
│  │   │  ┌─────────────────────────────────────────┐    │  │  │
│  │   │  │   page.tsx (SSR Wrapper)                │    │  │  │
│  │   │  │     └── dynamic import (ssr: false)     │    │  │  │
│  │   │  │          └── Content.tsx (CSR)          │    │  │  │
│  │   │  │               ├── Header                │    │  │  │
│  │   │  │               ├── useAuth Hook          │    │  │  │
│  │   │  │               └── Page Logic            │    │  │  │
│  │   │  └─────────────────────────────────────────┘    │  │  │
│  │   └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Mesh SDK      │ │   Blockfrost    │ │  Zustand Store  │
│   (Wallet)      │ │   (API)         │ │  (State)        │
└─────────────────┘ └─────────────────┘ └─────────────────┘
              │               │
              └───────┬───────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │    CARDANO BLOCKCHAIN   │
        │    (Smart Contracts)    │
        └─────────────────────────┘
```

### Project Structure

```
cardano-donation-dapp/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Landing (SSR wrapper)
│   ├── HomeWalletSection.tsx    # Landing (CSR content)
│   ├── layout.tsx               # Root layout + ClientProviders
│   ├── globals.css              # Global styles
│   │
│   ├── auth/
│   │   ├── page.tsx             # Auth wrapper
│   │   └── AuthContent.tsx      # Auth content
│   │
│   ├── profile/
│   │   ├── page.tsx             # Profile wrapper
│   │   └── Content.tsx          # Profile content
│   │
│   ├── campaigns/
│   │   ├── page.tsx             # Campaigns wrapper
│   │   ├── CampaignsContent.tsx # Campaigns content
│   │   └── [id]/
│   │       ├── page.tsx         # Detail wrapper
│   │       ├── Content.tsx      # Detail content
│   │       ├── edit/
│   │       │   ├── page.tsx     # Edit wrapper
│   │       │   └── Content.tsx  # Edit content
│   │       └── withdraw/
│   │           ├── page.tsx     # Withdraw wrapper
│   │           └── Content.tsx  # Withdraw content
│   │
│   ├── create/
│   │   ├── page.tsx             # Create wrapper
│   │   └── Content.tsx          # Create content
│   │
│   ├── governance/
│   │   ├── page.tsx             # Governance wrapper
│   │   └── Content.tsx          # Governance content
│   │
│   ├── admin/
│   │   ├── page.tsx             # Admin wrapper
│   │   └── Content.tsx          # Admin content
│   │
│   ├── dashboard/
│   │   ├── page.tsx             # Dashboard wrapper
│   │   └── Content.tsx          # Dashboard content
│   │
│   └── my-campaigns/
│       ├── page.tsx             # My campaigns wrapper
│       └── Content.tsx          # My campaigns content
│
├── components/                   # Shared components
│   ├── ClientProviders.tsx      # MeshProvider wrapper
│   ├── Header.tsx               # Navigation header
│   ├── WalletConnect.tsx        # Wallet connection
│   ├── PageWrapper.tsx          # Generic page wrapper
│   └── Charts.tsx               # Recharts components
│
├── lib/                         # Utilities & helpers
│   ├── api/
│   │   └── blockfrost.ts        # Blockchain API
│   ├── cardano/
│   │   ├── transactions.ts      # TX builders
│   │   └── wallet.ts            # Wallet utilities
│   ├── hooks/
│   │   ├── useAuth.ts           # Authentication hook
│   │   └── useTransaction.ts    # Transaction hook
│   └── store/
│       ├── userStore.ts         # User state
│       ├── campaignStore.ts     # Campaign state
│       └── syncStore.ts         # Sync state
│
└── validators/                  # Aiken smart contracts
    └── validators/
        ├── campaign_validator.ak
        ├── donation_validator.ak
        ├── multisig_validator.ak
        └── governance_validator.ak
```

---

## SSR/CSR Split Pattern

### Why This Pattern?

Mesh SDK uses **WebAssembly (WASM)** which cannot run during Server-Side Rendering. To solve this:

1. **page.tsx** - Minimal server-rendered shell
2. **Content.tsx** - All wallet logic, client-side only

### Pattern Implementation

```typescript
// page.tsx (Server wrapper)
'use client';
import dynamic from 'next/dynamic';

const PageContent = dynamic(() => import('./Content'), {
    ssr: false,  // CRITICAL: Disable SSR
    loading: () => (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

export default function Page() {
    return <PageContent />;
}
```

```typescript
// Content.tsx (Client-side content)
'use client';
import useAuth from '@/lib/hooks/useAuth';
import Header from '@/components/Header';

export default function PageContent() {
    const { isAuthenticated, walletAddress, profile } = useAuth();
    
    // All wallet-dependent logic here
    return (
        <div className="min-h-screen bg-background">
            <Header />
            {/* Page content */}
        </div>
    );
}
```

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | Next.js | 14.2.0 | React framework with App Router |
| **Language** | TypeScript | 5.x | Type-safe development |
| **Styling** | Tailwind CSS | 3.4.0 | Utility-first CSS |
| **Wallet** | Mesh SDK | 1.7.0 | Cardano wallet integration |
| **Blockchain** | Lucid Cardano | 0.10.0 | Transaction building |
| **Contracts** | Aiken | 1.1.19+ | Plutus V3 validators |
| **API** | Blockfrost | - | Blockchain queries |
| **State** | Zustand | 4.5.0 | Global state management |
| **Animation** | Framer Motion | 11.0.0 | UI animations |
| **Charts** | Recharts | 2.12.0 | Data visualization |
| **Validation** | Zod | 3.23.0 | Schema validation |

---

## Page Components

### Page Wrappers (SSR)

All page.tsx files follow the same pattern:

| Page | Route | Content Component |
|------|-------|-------------------|
| `app/page.tsx` | `/` | `HomeWalletSection.tsx` |
| `app/auth/page.tsx` | `/auth` | `AuthContent.tsx` |
| `app/auth/login/page.tsx` | `/auth/login` | `LoginContent.tsx` |
| `app/auth/signup/page.tsx` | `/auth/signup` | `SignupContent.tsx` |
| `app/auth/verify-email/page.tsx` | `/auth/verify-email` | `VerifyEmailContent.tsx` |
| `app/profile/page.tsx` | `/profile` | `Content.tsx` |
| `app/campaigns/page.tsx` | `/campaigns` | `CampaignsContent.tsx` |
| `app/campaigns/[id]/page.tsx` | `/campaigns/:id` | `Content.tsx` |
| `app/campaigns/[id]/edit/page.tsx` | `/campaigns/:id/edit` | `Content.tsx` |
| `app/campaigns/[id]/withdraw/page.tsx` | `/campaigns/:id/withdraw` | `Content.tsx` |
| `app/campaigns/[id]/admin-invite/page.tsx` | `/campaigns/:id/admin-invite` | `AdminInviteContent.tsx` |
| `app/create/page.tsx` | `/create` | `Content.tsx` |
| `app/donate/[id]/page.tsx` | `/donate/:id` | `DonateContent.tsx` |
| `app/governance/page.tsx` | `/governance` | `Content.tsx` |
| `app/admin/page.tsx` | `/admin` | `Content.tsx` |
| `app/dashboard/page.tsx` | `/dashboard` | `Content.tsx` |
| `app/my-campaigns/page.tsx` | `/my-campaigns` | `Content.tsx` |

---

## Content Components

### HomeWalletSection.tsx
**Purpose**: Landing page with hero, stats, features, and footer

**Features**:
- Personalized greeting for authenticated users
- Dynamic CTAs based on auth state
- User stats display (if logged in)
- Platform features showcase

### AuthContent.tsx
**Purpose**: Wallet connection and authentication

**Features**:
- Wallet detection and connection
- Email/Password authentication option
- Profile creation on first connect
- Redirect to profile after auth
- Wallet info modal for adding email

### LoginContent.tsx
**Purpose**: Email/password login

**Features**:
- Email and password form
- Form validation
- Error handling
- Redirect to profile after login

### SignupContent.tsx
**Purpose**: User registration with email

**Features**:
- First name, last name, username fields
- Email and password fields
- Password confirmation
- Custom captcha verification
- Form validation
- Password strength requirements
- Redirect to profile after signup

### VerifyEmailContent.tsx
**Purpose**: Email verification handler

**Features**:
- Token-based verification
- Verification status display
- Auto-redirect after verification
- Error handling for expired tokens

### CampaignsContent.tsx
**Purpose**: Browse and filter campaigns

**Features**:
- Campaign listing with pagination
- Category filtering
- Search functionality
- Progress indicators

### Profile Content.tsx
**Purpose**: User dashboard with full analytics

**Features**:
- Edit profile (display name, avatar)
- Email verification status and button
- Link wallet option (for email users)
- Disconnect wallet option
- Transaction history
- Data visualization (Recharts)
- Created campaigns list
- Supported campaigns list
- Voting power display
- Settings tab with account management

### Create Content.tsx
**Purpose**: Campaign creation form

**Fields**:
- Title
- Purpose (short summary)
- Description
- Category
- Goal amount (ADA)
- Deadline
- **Campaign Mode** (NEW):
  - Normal Mode (default): Standard L1 transactions
  - Hydra Event Mode: ⚡ Fast donations via Hydra Head
  - Long Campaign Mode: Extended duration campaigns
  - Small Campaign Mode: Quick campaigns with smaller goals

### Campaign Detail Content.tsx
**Purpose**: Full campaign view with donation

**Features**:
- Campaign info display
- **Campaign Mode Indicators**: Badges showing Normal, Hydra Event, Long, or Small mode
- **Hydra Event Mode Support** (NEW):
  - Real-time donation updates (every 2 seconds)
  - Hydra Gateway integration
  - Lower fees indicator
  - Near-instant confirmation messages
  - Live stats display
- Donation form (adapts to campaign mode)
- Progress tracking
- Recent donations list
- Owner actions (edit, withdraw)
- Admin management section (for creator)
- Social sharing buttons
- Public donation link

### AdminInviteContent.tsx
**Purpose**: Accept admin invitation

**Features**:
- Display campaign information
- Show invitation details
- Accept invitation button
- Login prompt if not authenticated
- Success confirmation
- Auto-redirect to campaign page

### DonateContent.tsx
**Purpose**: Public donation page (accessible via shared link)

**Features**:
- Full campaign information
- **Campaign Mode Detection**: Automatically detects and handles Hydra Event Mode
- **Hydra Support**: Processes donations through Hydra Gateway when in Event Mode
- Progress tracking
- Donation form (adapts to campaign mode)
- Wallet connection (if not connected)
- Quick amount buttons (10, 50, 100, 500 ₳)
- No login required
- Success confirmation (different messages for Hydra vs Normal)

### Governance Content.tsx
**Purpose**: View and vote on proposals

**Features**:
- Proposal listing
- Voting interface
- Voting power display
- Results visualization

### Admin Content.tsx
**Purpose**: Multi-sig withdrawal management

**Features**:
- Pending withdrawals list
- Signature collection
- Execution controls

---

## Shared Components

### Header.tsx
**Purpose**: Navigation with auth state

```typescript
function Header({ showNav = true, variant = 'default' }) {
    // Uses useAuth hook
    // Shows profile menu if authenticated
    // Shows wallet connect if not authenticated
}
```

**Key Feature**: Wrapped in MeshProvider to ensure wallet context

### ClientProviders.tsx
**Purpose**: Global MeshProvider wrapper

```typescript
'use client';
import { MeshProvider } from '@meshsdk/react';

export default function ClientProviders({ children }) {
    return <MeshProvider>{children}</MeshProvider>;
}
```

### Charts.tsx
**Purpose**: Recharts wrapper components

**Components**:
- `SimpleAreaChart` - For time series data
- `SimplePieChart` - For category distribution
- `SimpleBarChart` - For comparisons

### Chatbot.tsx
**Purpose**: Production-ready AI chatbot with knowledge base, user data collection, and Telegram agent handoff

**Features**:
- 20+ Q&A knowledge base with step-by-step guidance
- Smart keyword matching for instant answers
- User data collection form (email/username) for non-logged-in users
- Persistent chat history (localStorage)
- Telegram agent connection when bot can't help
- Message history with timestamps
- Typing indicators
- Quick action buttons (Connect Wallet, Donate, Create Campaign, etc.)
- Clear chat history option
- Responsive chat interface

**Props**:
```typescript
interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Knowledge Base Topics**:
- Wallet connection (step-by-step)
- How to donate (step-by-step)
- Campaign creation (step-by-step)
- Identity verification (step-by-step)
- 2FA setup (step-by-step)
- Password reset (step-by-step)
- Admin management (step-by-step)
- Email verification
- Governance & voting
- QR codes
- Hydra mode
- Security features
- Fees and costs
- General platform info

### ChatbotButton.tsx
**Purpose**: Floating chat button (bottom-right corner)

**Features**:
- Always visible on all pages
- Opens/closes chatbot
- Positioned with fixed positioning
- Smooth animations
- Messenger-style design (WhatsApp-like)

**Usage**: Automatically included in root layout

### CookieConsent.tsx
**Purpose**: GDPR-compliant cookie consent banner

**Features**:
- Appears after 1.5s delay for new visitors
- Accept/Decline options
- Stores preferences in localStorage
- Records timestamp of consent
- Separate preferences for analytics, marketing, and functional cookies
- Responsive design for all screen sizes
- Modern glassmorphism styling

**Props**: None (self-contained component)

**Storage**:
```typescript
interface CookieConsent {
  accepted: boolean;
  timestamp: string;
  preferences: {
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
  };
}
```

**Usage**: Automatically included in root layout

### ThemeToggle.tsx
**Purpose**: Light/Dark mode toggle button

**Features**:
- Sun icon (☀️) to switch to light mode
- Moon icon (🌙) to switch to dark mode
- Persists preference in localStorage
- Smooth transition animations
- Updates HTML class for CSS theme switching
- Prevents hydration mismatch

**Props**: None (self-contained component)

**Storage Key**: `donatedao-theme`

**Theme Classes**:
- `.dark` - Dark mode (default)
- `.light` - Light mode

**Usage**: Included in Header component

**CSS Variables Changed**:
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--border`, `--glass-bg`, `--glass-border`
- All color variables adapt to current theme

### Captcha.tsx
**Purpose**: Custom captcha component for signup protection

**Features**:
- Canvas-based visual captcha
- Random text generation (5 characters)
- Visual noise and rotation
- Refresh button
- Real-time validation
- Case-insensitive matching

**Props**:
```typescript
interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  resetKey?: number;  // Triggers reset when changed
}
```

### WalletInfoModal.tsx
**Purpose**: Modal for wallet users to add email/password

**Features**:
- First name, last name fields
- Email field
- Password field
- Form validation
- Optional (can be skipped)
- Updates user profile
- Saves password hash to localStorage

**Props**:
```typescript
interface WalletInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  onComplete: () => void;
}
```

### AdminManagement.tsx
**Purpose**: Campaign admin management component

**Features**:
- Username search and validation
- Add admin by username (max 7 admins)
- Remove admin (except creator)
- Admin invite link generation and copying
- Public donation link generation and copying
- Social media sharing buttons (Twitter, Facebook, LinkedIn, WhatsApp)
- Admin list display with details
- Only visible to campaign creator

**Props**:
```typescript
interface AdminManagementProps {
  campaignId: string;
}
```

**Usage**:
```typescript
<AdminManagement campaignId={campaignId} />
```

### QRCodeGenerator.tsx
**Purpose**: Generate and download QR codes for campaigns

**Features**:
- QR code generation using qrcode.react
- Download QR as PNG image (using html2canvas)
- Copy link to clipboard
- Customizable size and title
- Campaign title display

**Props**:
```typescript
interface QRCodeGeneratorProps {
  value: string;        // URL to encode in QR
  title?: string;       // Title above QR
  size?: number;        // QR size (default: 180)
  campaignTitle?: string; // Campaign name for file download
}
```

### ImageUpload.tsx
**Purpose**: Image upload component with compression

**Features**:
- Drag and drop support
- File type validation
- Image compression/resize (max 800px dimension)
- Base64 encoding for storage
- Preview display
- Remove image button
- Customizable max size

**Props**:
```typescript
interface ImageUploadProps {
  onImageChange: (base64: string | null) => void;
  currentImage?: string | null;
  maxSizeKB?: number;   // Default: 500
  label?: string;
  placeholder?: string;
}
```

### TwoFactorSetup.tsx
**Purpose**: Setup two-factor authentication with Google Authenticator

**Features**:
- QR code for authenticator app scanning
- Manual secret key entry option
- 6-digit code verification
- Backup codes generation (8 codes)
- Enable/disable 2FA
- Backup codes copy functionality

**Props**:
```typescript
interface TwoFactorSetupProps {
  email: string;
  onComplete?: () => void;
}
```

### TwoFactorVerify.tsx
**Purpose**: Modal for 2FA verification during login

**Features**:
- 6-digit TOTP code input
- Backup code support (8 characters)
- Error handling
- Loading state
- Cancel option

**Props**:
```typescript
interface TwoFactorVerifyProps {
  email: string;
  onSuccess: () => void;
  onCancel?: () => void;
}
```

### DocumentVerification.tsx
**Purpose**: AI-powered identity verification for campaign creators

**Features**:
- Passport/License upload
- Mock ML verification (70% success rate)
- 3 attempts before utility bill fallback
- Utility bill manual review (3-hour simulated)
- Status tracking (none, pending, verified, failed, under_review)
- File preview
- Progress indicators

**Props**:
```typescript
interface DocumentVerificationProps {
  userId: string;
  onVerified: () => void;
  onClose?: () => void;
}
```

**Verification Flow**:
1. User uploads passport or driving license
2. Mock ML model analyzes (2-3 second delay)
3. 70% chance of success
4. If failed 3 times, offer utility bill option
5. Utility bill review takes 3 hours (simulated)

### PageWrapper.tsx
**Purpose**: Generic client-side wrapper

```typescript
export default function PageWrapper({ children, loadingMessage }) {
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => { setIsClient(true); }, []);
    
    if (!isClient) return <LoadingSpinner />;
    
    return <MeshProvider>{children}</MeshProvider>;
}
```

---

## Custom Hooks

### useAuth.ts
**Purpose**: Wallet-based authentication

```typescript
function useAuth(): UseAuthReturn {
    return {
        // State
        isConnected: boolean;
        isAuthenticated: boolean;
        isLoading: boolean;
        
        // User Data
        walletAddress: string | null;
        profile: UserProfile | null;
        balance: number;
        
        // Available Wallets
        availableWallets: WalletInfo[];
        
        // Actions
        connectWallet: (walletName: string) => Promise<void>;
        disconnectWallet: () => void;
        updateProfile: (updates: Partial<UserProfile>) => void;
        formatWalletAddress: (length?: number) => string;
        refreshBalance: () => Promise<void>;
    };
}
```

**Client Guard**:
```typescript
const [isClient, setIsClient] = useState(false);
useEffect(() => { setIsClient(true); }, []);

// Only access BrowserWallet on client
useEffect(() => {
    if (isClient) {
        const wallets = BrowserWallet.getInstalledWallets();
        // ...
    }
}, [isClient]);
```

### useTransaction.ts
**Purpose**: Transaction state management

```typescript
function useTransaction(): UseTransactionReturn {
    return {
        // State
        loading: boolean;
        error: string | null;
        txHash: string | null;
        txStatus: string | null;
        feeEstimate: FeeEstimate | null;
        
        // Actions
        reset: () => void;
        estimateFee: (type, data) => Promise<FeeEstimate>;
        createCampaign: (data) => Promise<TransactionResult>;
        donate: (data) => Promise<TransactionResult>;
        proposeWithdrawal: (data) => Promise<TransactionResult>;
        castVote: (data) => Promise<TransactionResult>;
    };
}
```

---

## State Management

### userStore.ts (Zustand)
**Purpose**: User profile and statistics

```typescript
interface UserState {
    // Auth
    isAuthenticated: boolean;
    isLoading: boolean;
    
    // Profile
    profile: UserProfile | null;
    
    // Data
    campaigns: Campaign[];           // Created campaigns
    supportedCampaigns: Campaign[];  // Donated to
    donationRecords: DonationRecord[];
    
    // Stats
    stats: {
        totalDonated: number;
        campaignsSupported: number;
        votesCount: number;
        votingPower: number;
        donationStreak: number;
        rank: string;
        donationsByCategory: Record<string, number>;
    };
    
    // Actions
    // Wallet Authentication
    login: (address: string) => Promise<void>;
    
    // Email Authentication
    loginWithEmail: (credentials: {
        email: string;
        password: string;
        firstName?: string;  // Required for signup
        lastName?: string;   // Required for signup
        username?: string;   // Required for signup
    }) => Promise<void>;
    
    // Email Verification
    sendVerificationEmail: () => Promise<void>;
    verifyEmail: (token: string) => Promise<boolean>;
    
    // Account Linking
    linkWallet: (walletAddress: string) => Promise<void>;
    
    // Profile Management
    logout: () => void;
    updateProfile: (updates) => void;
    addTransaction: (tx) => void;
    addCampaign: (campaign) => void;
    addSupportedCampaign: (campaign) => void;
    addDonationRecord: (record) => void;
    refreshStats: () => void;
    
    // Hydration
    setHasHydrated: (state: boolean) => void;
    _hasHydrated: boolean;
    
    // Username Management
    checkUsernameAvailability: (username: string) => boolean;
    findUserByUsername: (username: string) => { 
        email?: string; 
        walletAddress?: string; 
        displayName: string;
    } | null;
}
```

**Username Uniqueness:**
- Usernames are checked across all users in localStorage
- Case-insensitive matching
- Minimum 3 characters
- Only letters, numbers, and underscores allowed
- Validated during signup

### campaignStore.ts (Zustand)
**Purpose**: Global campaign state

```typescript
interface CampaignState {
    campaigns: CampaignFull[];
    
    // Actions
    addCampaign: (campaign) => string; // Returns campaign ID
    updateCampaign: (id, updates) => void;
    deleteCampaign: (id) => void;
    getCampaign: (id) => CampaignFull | undefined;
    addDonation: (campaignId, donation) => void;
    
    // Admin Management
    addAdmin: (campaignId, username, addedBy) => Promise<boolean>;
    removeAdmin: (campaignId, username) => void;
    generateAdminInviteLink: (campaignId) => string;
    generatePublicDonationLink: (campaignId) => string;
    isAdmin: (campaignId, username) => boolean;
    canManageAdmins: (campaignId, username) => boolean;
    
    // Utilities
    initializeWithMockData: () => void;
}

interface CampaignFull {
    // ... campaign fields
    creatorUsername?: string;
    campaignMode?: 'normal' | 'hydra-event' | 'long-campaign' | 'small-campaign';
    hydraHeadId?: string;
    hydraSettled?: boolean;
    hydraSettlementTxHash?: string;
    admins: Array<{
        username: string;
        walletAddress?: string;
        email?: string;
        addedAt: string;
        addedBy: string;
    }>;
    adminInviteLink?: string;
    publicDonationLink?: string;
}
```

### syncStore.ts (Zustand)
**Purpose**: Data synchronization

```typescript
interface SyncState {
    lastSync: Date | null;
    isSyncing: boolean;
    
    // Actions
    sync: () => Promise<void>;
    setLastSync: (date: Date) => void;
}
```

---

## API Routes

### Telegram API Routes

#### `/api/telegram/connect` (POST)
**Purpose**: Connect user to Telegram agent

**Request Body**:
```typescript
{
  userMessage: string;
  userInfo: {
    timestamp: string;
  };
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
  chatId?: string;
  error?: string;
}
```

#### `/api/telegram/get-chat-id` (GET)
**Purpose**: Get all Telegram chat IDs

**Response**:
```typescript
{
  success: boolean;
  chats: Array<{
    chatId: number;
    chatType: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    lastMessage?: string;
    lastMessageDate: string;
  }>;
  instructions: string[];
}
```

#### `/api/telegram/webhook` (POST)
**Purpose**: Receive messages from Telegram

**Request Body**: Telegram webhook payload

**Response**:
```typescript
{
  ok: boolean;
  error?: string;
}
```

**GET Method**: Set webhook URL
```
GET /api/telegram/webhook?action=set-webhook&url=https://yourdomain.com/api/telegram/webhook
```

---

## Utility Libraries

### password.ts
**Purpose**: Password hashing utilities

**Functions**:
- `hashPassword(password: string): Promise<string>` - Hash password with SHA-256
- `verifyPassword(password: string, hash: string): Promise<boolean>` - Verify password against hash

**Usage**:
```typescript
import { hashPassword, verifyPassword } from '@/lib/utils/password';

const hash = await hashPassword('myPassword123');
const isValid = await verifyPassword('myPassword123', hash);
```

### telegram.ts
**Purpose**: Telegram Bot API utilities

**Functions**:
- `sendTelegramMessage(message: TelegramMessage): Promise<boolean>` - Send message to Telegram
- `getTelegramUpdates(offset?: number)` - Get bot updates
- `setTelegramWebhook(webhookUrl: string): Promise<boolean>` - Set webhook URL

### otp.ts
**Purpose**: OTP generation and verification for password reset and email verification

**Functions**:
- `generateOTP(): string` - Generate 6-digit OTP
- `storeOTP(email, type): OTPData` - Store OTP for verification
- `verifyOTP(email, otp, type): boolean` - Verify OTP
- `isOTPVerified(email, type): boolean` - Check if OTP was verified
- `clearOTP(email, type): void` - Clear OTP after use
- `sendOTP(email, type): OTPData` - Generate and "send" OTP (simulated)

**OTP Types**: `'email_verification' | 'password_reset'`

**Usage**:
```typescript
import { sendOTP, verifyOTP, clearOTP } from '@/lib/utils/otp';

// Send OTP for password reset (simulated - shows in alert)
const otpData = sendOTP(email, 'password_reset');

// Verify OTP (expires in 10 minutes)
const isValid = verifyOTP(email, '123456', 'password_reset');

// Clear after use
if (isValid) clearOTP(email, 'password_reset');
```

### totp.ts
**Purpose**: TOTP (Time-based One-Time Password) for Two-Factor Authentication

**Functions**:
- `generateTOTPSecret(): string` - Generate new TOTP secret
- `generateTOTPUri(secret, email): string` - Generate URI for QR code
- `verifyTOTP(token, secret): boolean` - Verify TOTP token
- `generateBackupCodes(count?): string[]` - Generate backup codes (default 8)
- `get2FAData(email): TwoFactorData | null` - Get 2FA data
- `save2FAData(email, data): void` - Save 2FA data
- `is2FAEnabled(email): boolean` - Check if 2FA is enabled
- `setup2FA(email): SetupData` - Initialize 2FA setup
- `enable2FA(email, token): boolean` - Enable after verification
- `disable2FA(email, token): boolean` - Disable 2FA
- `verify2FAToken(email, token): boolean` - Verify on login

**Usage**:
```typescript
import { setup2FA, enable2FA, verify2FAToken, is2FAEnabled } from '@/lib/utils/totp';

// Setup 2FA (returns secret, URI for QR, backup codes)
const { secret, uri, backupCodes } = setup2FA(email);

// User scans QR and enters code to enable
const enabled = enable2FA(email, '123456');

// On login, check if 2FA required
if (is2FAEnabled(email)) {
  const valid = verify2FAToken(email, userCode);
}
```

### documentVerifier.ts
**Purpose**: Mock AI document verification for identity verification

**Location**: `lib/verification/documentVerifier.ts`

**Key Features**:
- Mock ML model with 70% success rate
- Support for passport, license, and utility bill
- 3 attempts before utility bill fallback
- 3-hour manual review simulation

**Functions**:
- `getVerificationData(userId): IdentityVerification | null`
- `submitDocumentVerification(userId, type, image): Promise<VerificationResult>`
- `checkUtilityBillReview(userId): VerificationResult`
- `isUserVerified(userId): boolean`
- `getRemainingAttempts(userId): number`

**Verification Flow**:
1. User uploads passport/license
2. Mock ML analyzes (2-3 second delay)
3. 70% success rate for demo
4. After 3 failures, utility bill option
5. Utility bill takes 3 hours (simulated)

### hydraGateway.ts
**Purpose**: Hydra Gateway Service for fast, low-fee donations during live events

**Location**: `lib/hydra/hydraGateway.ts`

**Key Features**:
- Initialize Hydra Head for campaigns
- Process donations through Hydra Head
- Real-time donation statistics
- Settle Hydra Head to L1 (aggregated transactions)

**Main Functions**:
```typescript
// Initialize or get Hydra Head for a campaign
hydraGateway.initializeHydraHead(campaignId: string): Promise<HydraHead>

// Process a donation through Hydra Head
hydraGateway.processDonation(
    campaignId: string,
    donorAddress: string,
    amount: number
): Promise<HydraDonation>

// Get real-time stats (for live updates)
hydraGateway.getRealTimeStats(campaignId: string): Promise<{
    totalAmount: number;
    donationCount: number;
    lastDonationAt?: string;
}>

// Settle Hydra Head to L1 (after event)
hydraGateway.settleHydraHead(campaignId: string): Promise<string>
```

**Usage**:
```typescript
import { hydraGateway } from '@/lib/hydra/hydraGateway';

// Initialize Hydra Head
const head = await hydraGateway.initializeHydraHead(campaignId);

// Process donation
const donation = await hydraGateway.processDonation(
    campaignId,
    walletAddress,
    amountInLovelace
);

// Get real-time stats
const stats = await hydraGateway.getRealTimeStats(campaignId);
```

**Hydra Event Mode Benefits**:
- ⚡ Near-instant confirmations (vs ~20 seconds for L1)
- 💰 Lower fees (aggregated transactions)
- 📊 Real-time updates (every 2 seconds)
- 🔄 Automatic L1 settlement after event
- `getBotInfo()` - Get bot information

---

## Smart Contracts

### Campaign Validator
**Purpose**: Campaign lifecycle management

**Actions**: CreateCampaign, UpdateCampaign, CancelCampaign, CompleteCampaign

### Donation Validator
**Purpose**: Track donations and voting power

**Actions**: Donate, Withdraw, ClaimRefund

### Multi-Sig Validator
**Purpose**: 3-of-5 admin withdrawal approval

**Actions**: ProposeWithdrawal, SignWithdrawal, ExecuteWithdrawal, CancelWithdrawal

### Governance Validator
**Purpose**: Democratic proposal voting

**Actions**: CreateProposal, Vote, ExecuteProposal, CancelProposal

---

## Utility Libraries

### blockfrost.ts
**Purpose**: Blockchain API integration

**Functions**:
- `getAddressInfo(address)` - Address details
- `getAddressUtxos(address)` - UTxOs
- `getAddressBalance(address)` - Balance
- `getTransaction(txHash)` - TX details
- `submitTransaction(cbor)` - Submit TX
- `waitForConfirmation(txHash)` - Poll confirmation

### transactions.ts
**Purpose**: Datum and transaction building

**Functions**:
- `createCampaignDatum(params)` - Campaign datum
- `createDonationDatum(params)` - Donation datum
- `createWithdrawalDatum(params)` - Withdrawal datum
- `createVotingDatum(params)` - Voting datum
- `formatAda(lovelace, decimals)` - Format ADA display
- `getCardanoscanUrl(txHash)` - Block explorer URL

### wallet.ts
**Purpose**: Wallet utilities

**Functions**:
- `formatAddress(address, length)` - Truncate address
- `lovelaceToAda(lovelace)` - Convert to ADA
- `adaToLovelace(ada)` - Convert to lovelace
- `signTransaction(tx, wallet)` - Sign TX
- `submitTransaction(tx, wallet)` - Submit TX

---

## Styling System

### CSS Variables (globals.css)

```css
:root {
    --primary: 220 100% 60%;        /* Blue */
    --secondary: 280 80% 60%;       /* Purple */
    --background: 222 47% 11%;      /* Dark navy */
    --foreground: 213 31% 91%;      /* Light gray */
    --card: 224 37% 15%;            /* Card background */
    --border: 216 34% 17%;          /* Borders */
    --accent: 142 76% 36%;          /* Green */
}
```

### Utility Classes

```css
.glass {
    @apply bg-white/5 backdrop-blur-xl border border-white/10;
}

.gradient-primary {
    @apply bg-gradient-to-br from-primary/80 to-secondary/80;
}

.gradient-accent {
    @apply bg-gradient-to-r from-accent to-primary;
}
```

### Animations

```javascript
// tailwind.config.js
animation: {
    "fade-in": "fadeIn 0.5s ease-in-out",
    "slide-up": "slideUp 0.5s ease-out",
}
```

---

## Verification

All pages verified working (200 OK):

| Route | Status |
|-------|--------|
| `/` | ✅ 200 |
| `/auth` | ✅ 200 |
| `/profile` | ✅ 200 |
| `/campaigns` | ✅ 200 |
| `/campaigns/[id]` | ✅ 200 |
| `/campaigns/[id]/edit` | ✅ 200 |
| `/campaigns/[id]/withdraw` | ✅ 200 |
| `/create` | ✅ 200 |
| `/governance` | ✅ 200 |
| `/admin` | ✅ 200 |
| `/dashboard` | ✅ 200 |
| `/my-campaigns` | ✅ 200 |

---

**Last Updated**: November 29, 2025
