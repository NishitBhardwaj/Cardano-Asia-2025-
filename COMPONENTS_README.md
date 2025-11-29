# DApp Components Documentation

> **Complete guide to every component in the Cardano Donation DApp**
> 
> **Last Updated**: November 29, 2025

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
| `app/profile/page.tsx` | `/profile` | `Content.tsx` |
| `app/campaigns/page.tsx` | `/campaigns` | `CampaignsContent.tsx` |
| `app/campaigns/[id]/page.tsx` | `/campaigns/:id` | `Content.tsx` |
| `app/campaigns/[id]/edit/page.tsx` | `/campaigns/:id/edit` | `Content.tsx` |
| `app/campaigns/[id]/withdraw/page.tsx` | `/campaigns/:id/withdraw` | `Content.tsx` |
| `app/create/page.tsx` | `/create` | `Content.tsx` |
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
- Profile creation on first connect
- Redirect to profile after auth

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
- Transaction history
- Data visualization (Recharts)
- Created campaigns list
- Supported campaigns list
- Voting power display

### Create Content.tsx
**Purpose**: Campaign creation form

**Fields**:
- Title
- Purpose (short summary)
- Description
- Category
- Goal amount (ADA)
- Deadline

### Campaign Detail Content.tsx
**Purpose**: Full campaign view with donation

**Features**:
- Campaign info display
- Donation form
- Progress tracking
- Recent donations list
- Owner actions (edit, withdraw)

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
    login: (address: string) => Promise<void>;
    logout: () => void;
    updateProfile: (updates) => void;
    addTransaction: (tx) => void;
    addCampaign: (campaign) => void;
    addSupportedCampaign: (campaign) => void;
    addDonationRecord: (record) => void;
    refreshStats: () => void;
}
```

### campaignStore.ts (Zustand)
**Purpose**: Global campaign state

```typescript
interface CampaignState {
    campaigns: Campaign[];
    
    // Actions
    addCampaign: (campaign) => void;
    updateCampaign: (id, updates) => void;
    removeCampaign: (id) => void;
    getCampaign: (id) => Campaign | undefined;
    addDonation: (campaignId, donation) => void;
    initializeWithMockData: () => void;
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
