<p align="center">
  <h1 align="center">🎯 DonateDAO - Cardano Community Donation Platform</h1>
  <p align="center">
    <strong>Enterprise-grade Decentralized Application for Transparent Community Fundraising on Cardano Blockchain</strong>
  </p>
  <p align="center">
    Multi-signature Treasury • On-chain Governance • Milestone Tracking • Full Audit Trail
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Cardano-Hackathon%202025-blue?style=for-the-badge" alt="Hackathon" />
  <img src="https://img.shields.io/badge/Track-General-green?style=for-the-badge" alt="Track" />
  <img src="https://img.shields.io/badge/Aiken-v1.1.19-purple?style=for-the-badge" alt="Aiken" />
  <img src="https://img.shields.io/badge/Plutus-V3-red?style=for-the-badge" alt="Plutus" />
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge" alt="Next.js" />
</p>

---

## 🚀 Quick Start for Beginners

**New to DonateDAO? Start here!** This section gets you up and running in 5 minutes.

### What You Need (Prerequisites)

Before you start, make sure you have:

1. **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
2. **A Cardano Wallet Extension** - Install one of these in your browser:
   - [Nami Wallet](https://namiwallet.io/) (Recommended for beginners)
   - [Eternl Wallet](https://eternl.io/)
   - [Flint Wallet](https://flint-wallet.com/)

### Step-by-Step Setup

```bash
# Step 1: Clone the project
git clone https://github.com/your-repo/cardano-donation-dapp.git

# Step 2: Go into the project folder
cd cardano-donation-dapp

# Step 3: Install all dependencies
npm install

# Step 4: Start the development server
npm run dev
```

**That's it!** Open your browser and go to: `http://localhost:3000`

### What Can You Do?

| Action | How to Do It |
|--------|--------------|
| **Create an Account** | Click "Login" → Choose "Wallet" or "Email" authentication |
| **Browse Campaigns** | Click "Campaigns" in the menu to see all active fundraisers |
| **Donate to a Campaign** | Click any campaign → Enter amount → Click "Donate" |
| **Create a Campaign** | Login → Verify Identity → Click "Create" |
| **Enable 2FA Security** | Profile → Settings → Two-Factor Authentication |

### Demo Credentials (For Testing)

- **Demo Mode**: The app works without real ADA (simulated transactions)
- **OTP/Email**: Shown in browser alert (no real email sent)
- **Identity Verification**: 70% success rate (demo simulation)

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [Smart Contracts (Detailed)](#-smart-contracts-detailed)
6. [Frontend Components](#-frontend-components)
7. [State Management](#-state-management)
8. [API Integration](#-api-integration)
9. [Authentication System](#-authentication-system)
10. [Project Structure](#-project-structure)
11. [Installation & Setup](#-installation--setup)
12. [Configuration](#-configuration)
13. [Usage Guide](#-usage-guide)
14. [Data Flow](#-data-flow)
15. [Security Features](#-security-features)
16. [Deployment Guide](#-deployment-guide)
17. [Testing](#-testing)
18. [Troubleshooting](#-troubleshooting)
19. [Contributing](#-contributing)
20. [License](#-license)

---

## 🎯 Overview

### What is DonateDAO?

**DonateDAO** is a full-stack decentralized application (DApp) built on the Cardano blockchain that revolutionizes community fundraising through:

- **Transparent Fund Management**: Every transaction is recorded on-chain for complete accountability
- **Multi-signature Security**: 3-of-5 admin approval required for all fund withdrawals
- **Democratic Governance**: Token-weighted voting system where 1 ₳ donated = 1 vote
- **Milestone Tracking**: Real-time progress tracking for campaign goals
- **Premium User Experience**: Web2-level UX with Web3 security

### Problem We Solve

Traditional crowdfunding platforms suffer from:
- ❌ Lack of transparency in fund usage
- ❌ Single points of failure (one person controls funds)
- ❌ No donor voting rights
- ❌ High platform fees
- ❌ Geographic restrictions

### Our Solution

DonateDAO addresses all these issues:
- ✅ **Full Transparency**: All transactions on public blockchain
- ✅ **Multi-sig Security**: No single person can access funds
- ✅ **Democratic Governance**: Donors have voting power
- ✅ **Low Fees**: ~0.2 ₳ per transaction (~$0.10 USD)
- ✅ **Global Access**: Anyone with a Cardano wallet can participate

### Innovation Highlights

**First Cardano DApp** to combine:
1. Multi-signature fund management (3-of-5)
2. On-chain democratic governance
3. Milestone-based fund release
4. Integrated user profiles with transaction history
5. Data visualization dashboard

---

## ✨ Key Features

### 1. Campaign Management
| Feature | Description |
|---------|-------------|
| **Create Campaign** | Launch fundraising campaigns with goals, deadlines, and milestones |
| **Campaign Modes** | Choose from Normal, Hydra Event, Long Campaign, or Small Campaign modes |
| **Hydra Event Mode** | ⚡ Fast donations via Hydra Head - lower fees, near-instant confirmations for live events |
| **Browse Campaigns** | Filter and discover active campaigns by category |
| **Track Progress** | Real-time funding progress with visual indicators |
| **Milestone System** | Track fund usage against predefined milestones |
| **Admin Management** | Add up to 7 admins per campaign with shareable invite links |
| **Public Sharing** | Share campaign donation links on social media (Twitter, Facebook, LinkedIn, WhatsApp) |
| **Username-Based Admin** | Add admins by searching unique usernames |
| **Public Donation Page** | Standalone donation page accessible via shared link |

### 2. Donation System
| Feature | Description |
|---------|-------------|
| **ADA Donations** | Send donations in ADA cryptocurrency |
| **Dual Donation Modes** | Normal L1 transactions or Hydra Event Mode for fast, low-fee donations |
| **Hydra Event Mode** | ⚡ Near-instant confirmations, lower fees, real-time updates for live events |
| **Quick Amounts** | One-click donation buttons (10, 50, 100 ₳) |
| **Fee Transparency** | See exact transaction fees before confirming |
| **Voting Power** | Earn 1 vote per 1 ₳ donated |
| **Real-time Updates** | Live donation counter updates every 2 seconds for Hydra campaigns |

### 3. Multi-Signature Withdrawals
| Feature | Description |
|---------|-------------|
| **3-of-5 Approval** | Requires 3 admin signatures from 5 total |
| **Time Lock** | Optional delay before execution |
| **Signature Tracking** | Visual progress of collected signatures |
| **Audit Trail** | All withdrawal requests logged on-chain |

### 4. Governance System
| Feature | Description |
|---------|-------------|
| **Create Proposals** | Community members can propose changes |
| **Weighted Voting** | Vote power based on total donations |
| **Quorum Requirements** | Minimum participation for valid votes |
| **Auto-execution** | Passed proposals execute on-chain |

### 5. User Profiles & Dashboard
| Feature | Description |
|---------|-------------|
| **Dual Authentication** | Login via Cardano wallet (Web3) or Email/Password (Web2) |
| **Transaction History** | Complete record of all user transactions |
| **Data Visualization** | Charts showing donation patterns |
| **Rank System** | Bronze → Silver → Gold → Platinum → Diamond |
| **Donation Streaks** | Track consecutive months of giving |
| **Email Verification** | Secure email verification with verification links |
| **Profile Management** | Edit profile, link wallet to email account |

### 6. Authentication System
| Feature | Description |
|---------|-------------|
| **Wallet Authentication** | Connect Cardano wallet (Nami, Eternl, etc.) for Web3 login |
| **Email Authentication** | Traditional email/password signup and login |
| **Email Verification** | OTP-based email verification system |
| **Password Security** | SHA-256 hashing with Web Crypto API |
| **Forgot Password** | OTP-based password reset (simulated email) |
| **Two-Factor Authentication** | Optional TOTP-based 2FA with Google Authenticator |
| **Account Linking** | Link wallet to email account or vice versa |
| **Custom Captcha** | System-generated captcha for signup protection |

### 7. Security Features
| Feature | Description |
|---------|-------------|
| **Two-Factor Authentication (2FA)** | Optional TOTP-based 2FA compatible with Google Authenticator, Authy, etc. |
| **2FA Setup QR Codes** | Scan QR code with authenticator app to enable 2FA |
| **Backup Codes** | 8 one-time backup codes for 2FA recovery (save securely!) |
| **Identity Verification** | **Required** AI-powered document verification before campaign creation |
| **Document Types** | Passport, Driving License, or Utility Bill (fallback) |
| **AI Verification Service** | Centralized service abstraction (`lib/ai/id-verification-service.ts`) |
| **3-Attempt Limit** | Maximum 3 attempts for passport/license verification |
| **Utility Bill Fallback** | After 3 failed attempts, users can submit utility bill for manual review |
| **3-Hour Review Period** | Simulated manual verification for utility bills (realistic delay) |
| **Verification Status Tracking** | Track verification status: none, pending, verified, failed, under_review |
| **Password Reset via Email OTP** | Secure password reset using 6-digit OTP sent via email (Brevo API) |
| **OTP Expiry** | OTP codes expire after 10 minutes |
| **Rate Limiting** | Protection against OTP spam (built into service) |

### 8. Campaign Sharing & QR Codes
| Feature | Description |
|---------|-------------|
| **QR Code Generator** | Auto-generated QR codes for every campaign donation link |
| **QR Code Display** | Visible on campaign detail page, dashboard, and my-campaigns |
| **Show QR Button** | Quick access to QR codes from campaign cards |
| **QR Download** | One-click save QR as PNG image (high resolution) |
| **QR Modal** | Beautiful modal popup for QR code viewing |
| **Copy Link** | One-click copy donation link to clipboard |
| **Social Media Sharing** | Share to Twitter, Facebook, LinkedIn, WhatsApp |
| **Admin Invite Links** | Shareable links to add campaign admins |
| **Public Donation Links** | Direct donation links for social media sharing |
| **Campaign Images** | Upload custom images (base64, max 500KB, auto-compressed) |
| **Image Compression** | Automatic resize to 800px max dimension |

### 9. AI-Powered Features & Chatbot
| Feature | Description |
|---------|-------------|
| **Smart Chatbot** | Production-ready knowledge-based chatbot with step-by-step guidance |
| **Pre-Login Support** | Chatbot works for non-authenticated users (collects email/username) |
| **Persistent Chat History** | Chat history saved in localStorage (survives page refresh) |
| **User Data Collection** | Collects email/username for personalized support |
| **Step-by-Step Guidance** | Detailed instructions for: account creation, verification, campaign creation, donations, 2FA setup |
| **Agent Handoff** | Connects to human support (Telegram) when needed |
| **Identity Verification Guidance** | Explains verification process, status checks, next steps |
| **QR Code Explanations** | Explains how QR codes work and how to use them |
| **2FA Setup Help** | Guides users through 2FA setup process |
| **Password Reset Help** | Explains password reset via email OTP |
| **Document Verification AI** | Centralized AI service abstraction for identity verification |
| **AI Service Interface** | Clean API boundary for ML model integration (`lib/ai/id-verification-service.ts`) |
| **Model Training Placeholder** | Ready for TensorFlow.js, ONNX.js, or backend API integration |

### 10. Wallet Integration
| Feature | Description |
|---------|-------------|
| **Multi-wallet Support** | Nami, Eternl, Flint, Typhon, Yoroi, Gero |
| **CIP-30 Compatible** | Works with any standard Cardano wallet |
| **Network Detection** | Automatic testnet/mainnet detection |
| **Balance Display** | Real-time wallet balance |
| **Wallet Linking** | Add wallet to email-authenticated accounts |
| **Wallet-only Donations** | Donate without full account (just wallet connection) |

### 11. Visual Design
| Feature | Description |
|---------|-------------|
| **Background Patterns** | Dots, grid, diagonal, mesh gradient patterns |
| **Animated Backgrounds** | Floating elements, pulsing effects |
| **Glassmorphism UI** | Modern glass effect on components |
| **Responsive Design** | Mobile-first, works on all screen sizes |

### 8. AI Chatbot & Support
| Feature | Description |
|---------|-------------|
| **Intelligent Chatbot** | AI-powered assistant with 15+ Q&A knowledge base |
| **Context-Aware Responses** | Smart keyword matching for instant answers |
| **Telegram Agent Handoff** | Seamless connection to human agent (Sumanth) via Telegram |
| **Quick Actions** | One-click buttons for common questions |
| **Always Available** | Floating chat button on all pages |
| **Multi-topic Support** | Help with wallet, donations, campaigns, governance, and more |

---

## 🛠 Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.0 | React framework with App Router |
| **React** | 18.3.0 | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 3.4.0 | Utility-first CSS framework |
| **Zustand** | 4.5.0 | Lightweight state management |
| **Recharts** | 2.12.0 | Data visualization charts |
| **Framer Motion** | 11.0.0 | Animation library |
| **Zod** | 3.23.0 | Schema validation |
| **date-fns** | 3.6.0 | Date manipulation |

### Blockchain Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Aiken** | 1.1.19 | Smart contract language |
| **Plutus** | V3 | Cardano smart contract platform |
| **Mesh SDK** | 1.7.0 | Cardano wallet integration |
| **Lucid Cardano** | 0.10.0 | Transaction building |
| **Blockfrost** | API v0 | Blockchain data queries |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **PostCSS** | CSS processing |
| **Autoprefixer** | CSS vendor prefixes |
| **Jest** | Unit testing |
| **Playwright** | E2E testing |

### Infrastructure

| Service | Purpose |
|---------|---------|
| **Cardano Network** | PreProd testnet / Mainnet |
| **Blockfrost** | Blockchain API service |
| **Vercel/Netlify** | Frontend hosting |
| **GitHub** | Version control |

---

## 🏗 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Next.js Frontend                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │  Pages   │ │Components│ │  Hooks   │ │  Store   │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Mesh SDK      │ │   Blockfrost    │ │  Local Storage  │
│   (Wallet)      │ │   (API)         │ │  (User Data)    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
              │               │
              └───────┬───────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │    CARDANO BLOCKCHAIN   │
        │  ┌───────────────────┐  │
        │  │  Smart Contracts  │  │
        │  │  ┌─────────────┐  │  │
        │  │  │  Campaign   │  │  │
        │  │  │  Validator  │  │  │
        │  │  ├─────────────┤  │  │
        │  │  │  Donation   │  │  │
        │  │  │  Validator  │  │  │
        │  │  ├─────────────┤  │  │
        │  │  │  Multi-Sig  │  │  │
        │  │  │  Validator  │  │  │
        │  │  ├─────────────┤  │  │
        │  │  │ Governance  │  │  │
        │  │  │  Validator  │  │  │
        │  │  └─────────────┘  │  │
        │  └───────────────────┘  │
        └─────────────────────────┘
```

### Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      USER ACTIONS                             │
│  Connect Wallet → Create Campaign → Donate → Vote → Withdraw │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                             │
│                                                               │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐         │
│  │  useAuth   │───▶│ userStore  │───▶│  Profile   │         │
│  │   Hook     │    │  (Zustand) │    │   Page     │         │
│  └────────────┘    └────────────┘    └────────────┘         │
│         │                                                     │
│         ▼                                                     │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐         │
│  │useTransact │───▶│Transaction │───▶│ Blockfrost │         │
│  │   Hook     │    │  Builder   │    │    API     │         │
│  └────────────┘    └────────────┘    └────────────┘         │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   BLOCKCHAIN LAYER                            │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Transaction                        │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │  Inputs  │  │  Outputs │  │   Datum  │          │    │
│  │  │  (UTxOs) │  │  (UTxOs) │  │  (State) │          │    │
│  │  └──────────┘  └──────────┘  └──────────┘          │    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐                         │    │
│  │  │ Redeemer │  │  Script  │                         │    │
│  │  │ (Action) │  │ (Plutus) │                         │    │
│  │  └──────────┘  └──────────┘                         │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 📜 Smart Contracts (Detailed)

### Overview

All smart contracts are written in **Aiken v1.1.19** and compile to **Plutus V3** for the Cardano blockchain.

```
validators/
└── validators/
    ├── campaign_validator.ak    (78 lines)
    ├── donation_validator.ak    (42 lines)
    ├── multisig_validator.ak    (70 lines)
    └── governance_validator.ak  (91 lines)
```

---

### 1. Campaign Validator (`campaign_validator.ak`)

**Purpose**: Manages the complete lifecycle of fundraising campaigns.

#### Datum Structure (On-chain State)

```aiken
pub type CampaignDatum {
  campaign_id: ByteArray,        // Unique campaign identifier
  creator: VerificationKeyHash,  // Campaign creator's public key hash
  title: ByteArray,              // Campaign title (hex encoded)
  goal_lovelace: Int,            // Funding goal in lovelace (1 ADA = 1,000,000 lovelace)
  deadline_posix: Int,           // Unix timestamp for campaign deadline
  total_raised: Int,             // Current amount raised
  status: CampaignStatus,        // Active | Completed | Cancelled
}

pub type CampaignStatus {
  Active      // Campaign is accepting donations
  Completed   // Goal reached, funds can be withdrawn
  Cancelled   // Campaign cancelled, donors can claim refunds
}
```

#### Redeemer Actions (Transaction Triggers)

```aiken
pub type CampaignRedeemer {
  CreateCampaign      // Initialize new campaign
  UpdateCampaign      // Modify campaign details
  CancelCampaign      // Cancel and enable refunds
  CompleteCampaign    // Mark as successfully funded
}
```

#### Validation Logic

| Action | Validation Rules |
|--------|------------------|
| **CreateCampaign** | • Goal > 0 lovelace<br>• Deadline in future<br>• Initial raised = 0<br>• Status = Active<br>• Creator must sign |
| **UpdateCampaign** | • Only creator can update<br>• Creator signature required |
| **CancelCampaign** | • Only creator can cancel<br>• Must have no funds raised<br>• Creator signature required |
| **CompleteCampaign** | • Goal must be reached<br>• Creator signature required |

#### Example Transaction Flow

```
CREATE CAMPAIGN:
┌──────────────────────────────────────────────────────────────┐
│ Input: User's wallet UTxO (2+ ADA)                          │
│                                                              │
│ Output: Script address with CampaignDatum                    │
│   - campaign_id: "campaign_1234567890_abc123"               │
│   - creator: "e7c8a12b..."                                  │
│   - title: "Community School Renovation"                     │
│   - goal_lovelace: 50000000000 (50,000 ADA)                 │
│   - deadline_posix: 1735689600 (Jan 1, 2025)                │
│   - total_raised: 0                                         │
│   - status: Active                                          │
│                                                              │
│ Redeemer: CreateCampaign                                    │
│ Required Signature: Creator's wallet                         │
└──────────────────────────────────────────────────────────────┘
```

---

### 2. Donation Validator (`donation_validator.ak`)

**Purpose**: Records donations and allocates voting power to donors.

#### Datum Structure

```aiken
pub type DonationDatum {
  campaign_id: ByteArray,        // Links to specific campaign
  donor: VerificationKeyHash,    // Donor's public key hash
  amount_lovelace: Int,          // Donation amount
  timestamp_posix: Int,          // When donation was made
  voting_power: Int,             // Governance voting power (= amount)
}
```

#### Redeemer Actions

```aiken
pub type DonationRedeemer {
  Donate       // Make a new donation
  Withdraw     // Campaign owner withdraws funds
  ClaimRefund  // Donor claims refund (if campaign cancelled)
}
```

#### Validation Logic

| Action | Validation Rules |
|--------|------------------|
| **Donate** | • Amount > 0<br>• Donor signature required<br>• Voting power = donation amount |
| **Withdraw** | • Always allowed (for campaign owner) |
| **ClaimRefund** | • Only original donor can claim<br>• Donor signature required |

#### Voting Power Calculation

```
Voting Power = Total Donations by User

Example:
- User donates 100 ADA to Campaign A → 100 voting power
- User donates 50 ADA to Campaign B → 50 voting power
- Total voting power = 150 (can vote on any proposal)
```

---

### 3. Multi-Signature Validator (`multisig_validator.ak`)

**Purpose**: Implements secure 3-of-5 multi-signature withdrawal system.

#### Datum Structure

```aiken
pub type MultiSigDatum {
  admins: List<VerificationKeyHash>,  // 5 admin public key hashes
  threshold: Int,                      // Required signatures (3)
  time_lock: Option<Int>,             // Optional delay timestamp
  withdrawal_request: WithdrawalRequest,
}

pub type WithdrawalRequest {
  campaign_id: ByteArray,
  amount_lovelace: Int,
  recipient: VerificationKeyHash,
  proposed_at: Int,
  signatures: List<VerificationKeyHash>,  // Collected signatures
}
```

#### Redeemer Actions

```aiken
pub type MultiSigRedeemer {
  ProposeWithdrawal   // Create new withdrawal request
  SignWithdrawal      // Add signature to request
  ExecuteWithdrawal   // Execute after threshold reached
  CancelWithdrawal    // Cancel request (requires threshold)
}
```

#### Multi-Sig Flow

```
WITHDRAWAL PROCESS:
═══════════════════════════════════════════════════════════════

Step 1: PROPOSE
┌─────────────────────────────────────────────────────────────┐
│ Admin #1 creates withdrawal request                         │
│ Signatures: [Admin #1] → 1/3 ✗                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
Step 2: SIGN (Admin #2)
┌─────────────────────────────────────────────────────────────┐
│ Admin #2 reviews and signs                                  │
│ Signatures: [Admin #1, Admin #2] → 2/3 ✗                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
Step 3: SIGN (Admin #3)
┌─────────────────────────────────────────────────────────────┐
│ Admin #3 reviews and signs                                  │
│ Signatures: [Admin #1, Admin #2, Admin #3] → 3/3 ✓         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
Step 4: EXECUTE
┌─────────────────────────────────────────────────────────────┐
│ Any admin can trigger execution                             │
│ Time lock check (if set): current_time > unlock_time       │
│ → Funds transferred to recipient                            │
└─────────────────────────────────────────────────────────────┘
```

#### Security Features

1. **No Single Point of Failure**: No individual can access funds alone
2. **Signature Uniqueness**: Each admin can only sign once
3. **Time Lock**: Optional delay adds additional security
4. **On-chain Audit**: All signatures recorded permanently

---

### 4. Governance Validator (`governance_validator.ak`)

**Purpose**: Enables democratic decision-making through token-weighted voting.

#### Datum Structure

```aiken
pub type GovernanceDatum {
  proposal_id: ByteArray,
  proposer: VerificationKeyHash,
  title: ByteArray,
  description: ByteArray,
  proposal_type: ProposalType,
  votes_for: Int,
  votes_against: Int,
  voting_start: Int,
  voting_end: Int,
  status: ProposalStatus,
  quorum: Int,                    // Minimum votes required
}

pub type ProposalType {
  AllocateFunds { campaign_id: ByteArray, amount: Int }
  ChangeParameter { parameter_name: ByteArray, new_value: ByteArray }
  AddAdmin { new_admin: VerificationKeyHash }
  RemoveAdmin { admin_to_remove: VerificationKeyHash }
}

pub type ProposalStatus {
  Proposed   // Initial state
  Active     // Voting in progress
  Passed     // Quorum met, majority for
  Rejected   // Quorum met, majority against (or quorum not met)
  Executed   // Passed and executed
}
```

#### Voting Mechanism

```
VOTING POWER CALCULATION:
═══════════════════════════════════════════════════════════════

Total Voting Power = Sum of all user donations (in lovelace)

QUORUM CHECK:
- Quorum = 20% of total voting power
- Example: If total donations = 100,000 ADA
  → Quorum = 20,000 ADA worth of votes required

MAJORITY CHECK:
- Majority = votes_for > votes_against
- Simple majority (50%+ of votes cast)

OUTCOME DETERMINATION:
┌─────────────────────────────────────────────────────────────┐
│ IF quorum_met AND votes_for > votes_against:               │
│   → status = Passed                                        │
│ ELSE:                                                      │
│   → status = Rejected                                      │
└─────────────────────────────────────────────────────────────┘
```

---

### Contract Compilation & Deployment

#### Building Contracts

```bash
# Navigate to validators directory
cd validators

# Compile all contracts
aiken build

# Output: validators/plutus.json
# Contains:
# - Compiled Plutus Core bytecode
# - Script hashes
# - Cost model parameters
```

#### Deployment Process

```bash
# 1. Get testnet ADA from faucet
# https://docs.cardano.org/cardano-testnet/tools/faucet/

# 2. Build reference script transaction
cardano-cli transaction build \
  --testnet-magic 1 \
  --tx-in <your-utxo> \
  --tx-out <script-address>+2000000 \
  --tx-out-reference-script-file campaign_validator.plutus \
  --change-address <your-address> \
  --out-file tx.raw

# 3. Sign and submit
cardano-cli transaction sign \
  --testnet-magic 1 \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --out-file tx.signed

cardano-cli transaction submit \
  --testnet-magic 1 \
  --tx-file tx.signed
```

---

## 🧩 Frontend Components

### Page Architecture (SSR/CSR Split Pattern)

> **Important**: Due to Mesh SDK's WebAssembly (WASM) requirements, all wallet-dependent components use a special SSR/CSR split pattern.

Each page follows this structure:
```
app/[page]/
├── page.tsx           # Server-rendered wrapper (minimal shell)
└── Content.tsx        # Client-side content (wallet logic, ssr: false)
```

### Page Components

| Page File | Content File | Route | Purpose |
|-----------|--------------|-------|---------|
| `app/page.tsx` | `HomeWalletSection.tsx` | `/` | Landing page with hero, stats, features |
| `app/auth/page.tsx` | `AuthContent.tsx` | `/auth` | Wallet connection & authentication |
| `app/profile/page.tsx` | `Content.tsx` | `/profile` | User dashboard with charts |
| `app/campaigns/page.tsx` | `CampaignsContent.tsx` | `/campaigns` | Browse all campaigns |
| `app/campaigns/[id]/page.tsx` | `Content.tsx` | `/campaigns/:id` | Campaign details & donate |
| `app/campaigns/[id]/edit/page.tsx` | `Content.tsx` | `/campaigns/:id/edit` | Edit campaign |
| `app/campaigns/[id]/withdraw/page.tsx` | `Content.tsx` | `/campaigns/:id/withdraw` | Withdrawal request |
| `app/create/page.tsx` | `Content.tsx` | `/create` | Create new campaign form |
| `app/governance/page.tsx` | `Content.tsx` | `/governance` | View & vote on proposals |
| `app/admin/page.tsx` | `Content.tsx` | `/admin` | Admin multi-sig dashboard |
| `app/dashboard/page.tsx` | `Content.tsx` | `/dashboard` | User analytics dashboard |
| `app/my-campaigns/page.tsx` | `Content.tsx` | `/my-campaigns` | User's created campaigns |

### Shared Components

| Component | File | Purpose |
|-----------|------|---------|
| **Header** | `components/Header.tsx` | Navigation with auth state (wrapped in MeshProvider) |
| **WalletConnect** | `components/WalletConnect.tsx` | Wallet connection button |
| **ClientProviders** | `components/ClientProviders.tsx` | Mesh SDK context wrapper |
| **PageWrapper** | `components/PageWrapper.tsx` | Generic client-side wrapper for pages |
| **Charts** | `components/Charts.tsx` | Recharts wrappers (AreaChart, PieChart, BarChart) |

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      APP LAYOUT                              │
│   (layout.tsx wraps everything in ClientProviders)          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   MeshProvider                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              PAGE CONTENT                        │  │  │
│  │  │                                                   │  │  │
│  │  │   ┌─────────────────────────────────────────┐   │  │  │
│  │  │   │  page.tsx (Server-side shell)           │   │  │  │
│  │  │   │    └── dynamic import (ssr: false)      │   │  │  │
│  │  │   │         └── Content.tsx (Client-side)   │   │  │  │
│  │  │   │              └── Header.tsx             │   │  │  │
│  │  │   │              └── Page Logic (hooks)     │   │  │  │
│  │  │   │              └── UI Components          │   │  │  │
│  │  │   └─────────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### SSR/CSR Split Pattern (Critical for WASM)

Due to Mesh SDK's WebAssembly requirements, wallet-dependent code cannot run during Server-Side Rendering. The solution:

```typescript
// page.tsx (Server-rendered wrapper)
'use client';
import dynamic from 'next/dynamic';

const PageContent = dynamic(() => import('./Content'), {
    ssr: false,  // Disable SSR for wallet code
    loading: () => <LoadingSpinner />
});

export default function Page() {
    return <PageContent />;
}
```

```typescript
// Content.tsx (Client-side only)
'use client';
import useAuth from '@/lib/hooks/useAuth';
import Header from '@/components/Header';

export default function PageContent() {
    const { isAuthenticated, walletAddress } = useAuth();
    // All wallet logic here...
}
```

---

## 📦 State Management

### Zustand Store Structure

```typescript
// lib/store/userStore.ts

interface UserState {
  // Authentication
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Profile
  profile: {
    walletAddress: string;
    displayName: string;
    avatar: string;        // Emoji based on address
    bio: string;
    createdAt: string;
    lastLoginAt: string;
    preferences: {
      theme: 'dark' | 'light';
      currency: 'ADA' | 'USD';
      notifications: boolean;
    };
  } | null;
  
  // Transaction History
  transactions: Transaction[];
  
  // Statistics
  stats: {
    totalDonated: number;      // in lovelace
    totalReceived: number;
    campaignsCreated: number;
    campaignsSupported: number;
    votesCount: number;
    votingPower: number;       // = totalDonated
    donationStreak: number;    // consecutive months
    rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  };
  
  // Campaigns
  campaigns: Campaign[];           // User's created campaigns
  supportedCampaigns: Campaign[];  // Campaigns user donated to
  
  // Actions
  login: (walletAddress: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Profile>) => void;
  addTransaction: (transaction: Transaction) => void;
  refreshStats: () => void;
  // ... more actions
}
```

### Rank System

| Rank | Total Donated | Badge |
|------|---------------|-------|
| Bronze | 0 - 99 ₳ | 🥉 |
| Silver | 100 - 999 ₳ | 🥈 |
| Gold | 1,000 - 4,999 ₳ | 🥇 |
| Platinum | 5,000 - 9,999 ₳ | 💎 |
| Diamond | 10,000+ ₳ | 👑 |

### State Persistence

```typescript
// Zustand persist middleware
persist(
  (set, get) => ({
    // ... state and actions
  }),
  {
    name: 'donatedao-user-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      profile: state.profile,
      transactions: state.transactions,
      stats: state.stats,
      campaigns: state.campaigns,
      supportedCampaigns: state.supportedCampaigns,
    }),
  }
)
```

---

## 🔌 API Integration

### Blockfrost API (`lib/api/blockfrost.ts`)

#### Configuration

```typescript
const BLOCKFROST_API_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;
const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'preprod';
const BASE_URL = NETWORK === 'mainnet'
  ? 'https://cardano-mainnet.blockfrost.io/api/v0'
  : 'https://cardano-preprod.blockfrost.io/api/v0';
```

#### Available Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `getAddressInfo(address)` | Get address details | AddressInfo |
| `getAddressUtxos(address)` | Get UTxOs at address | UTxO[] |
| `getAddressBalance(address)` | Get ADA balance | { lovelace, assets } |
| `getTransaction(txHash)` | Get transaction details | Transaction |
| `getTransactionUtxos(txHash)` | Get TX inputs/outputs | TransactionUtxos |
| `getLatestBlock()` | Get current block | Block |
| `getProtocolParameters()` | Get fee parameters | ProtocolParameters |
| `submitTransaction(cbor)` | Submit signed TX | txHash |
| `evaluateTransaction(cbor)` | Get execution units | ExecutionUnits |
| `getTransactionStatus(txHash)` | Check confirmation | TransactionStatus |
| `waitForConfirmation(txHash)` | Poll until confirmed | TransactionStatus |

#### Fee Calculation

```typescript
// Fee formula: fee = min_fee_a * tx_size + min_fee_b
async function estimateTransactionFee(txSizeBytes: number): Promise<FeeEstimate> {
  const params = await getProtocolParameters();
  
  const baseFee = params.min_fee_b;        // ~155,381 lovelace
  const sizeFee = params.min_fee_a * txSizeBytes;  // ~44 lovelace/byte
  
  return {
    estimatedFee: baseFee + sizeFee,
    breakdown: { baseFee, sizeFee, scriptFee: 0 }
  };
}

// Typical fees:
// Simple transfer: ~0.17 ADA
// With datum: ~0.20 ADA
// With Plutus script: ~0.30-0.50 ADA
```

### Telegram Bot API (`app/api/telegram/`)

#### Configuration

```typescript
const TELEGRAM_BOT_TOKEN = '8405397592:AAF6SdgC5MvVBwlKUuOBO-xEcQG0aDGxlQk';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
```

#### Available Endpoints

| Endpoint | Method | Purpose | Returns |
|----------|--------|---------|---------|
| `/api/telegram/connect` | POST | Connect user to agent | `{ success, message, chatId }` |
| `/api/telegram/get-chat-id` | GET | Get all chat IDs | `{ success, chats[] }` |
| `/api/telegram/webhook` | POST | Receive Telegram messages | `{ ok: true }` |
| `/api/telegram/webhook?action=set-webhook` | GET | Set webhook URL | `{ success, message }` |

#### Usage Example

```typescript
// Connect user to Telegram agent
const response = await fetch('/api/telegram/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userMessage: 'User needs help with wallet connection',
    userInfo: { timestamp: new Date().toISOString() }
  })
});

const data = await response.json();
// { success: true, message: 'Connected to agent Sumanth successfully' }
```

---

## 🔐 Authentication System

DonateDAO supports **dual authentication methods** - both Web3 wallet-based and traditional email/password authentication.

### 1. Wallet Authentication (Web3)

**Wallet-based authentication** - Connect your Cardano wallet for instant login:

```
┌─────────────────────────────────────────────────────────────┐
│              WALLET AUTHENTICATION FLOW                     │
│                                                              │
│  1. User clicks "Connect Wallet"                            │
│                    │                                         │
│                    ▼                                         │
│  2. Available wallets detected (CIP-30)                     │
│     [Nami] [Eternl] [Flint] [Typhon] [Gero]               │
│                    │                                         │
│                    ▼                                         │
│  3. User selects wallet                                     │
│                    │                                         │
│                    ▼                                         │
│  4. Wallet prompts for connection approval                  │
│                    │                                         │
│                    ▼                                         │
│  5. Get wallet address (unique identifier)                  │
│     addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3... │
│                    │                                         │
│                    ▼                                         │
│  6. Optional: Add email/name for better account management  │
│                    │                                         │
│                    ▼                                         │
│  7. Create/Load user profile in Zustand store               │
│                    │                                         │
│                    ▼                                         │
│  8. User is "logged in" - no password needed!               │
└─────────────────────────────────────────────────────────────┘
```

### 2. Email Authentication (Web2)

**Traditional email/password authentication** for users who prefer Web2 login:

```
┌─────────────────────────────────────────────────────────────┐
│              EMAIL AUTHENTICATION FLOW                       │
│                                                              │
│  SIGNUP FLOW:                                                │
│  1. User clicks "Sign Up"                                    │
│                    │                                         │
│                    ▼                                         │
│  2. Fill registration form:                                  │
│     - First Name, Last Name                                  │
│     - Username                                               │
│     - Email Address                                          │
│     - Password (min 8 chars, uppercase, lowercase, number)  │
│     - Confirm Password                                       │
│     - Complete Captcha                                       │
│                    │                                         │
│                    ▼                                         │
│  3. Password hashed with SHA-256                            │
│                    │                                         │
│                    ▼                                         │
│  4. User profile created in Zustand store                   │
│                    │                                         │
│                    ▼                                         │
│  5. Redirect to profile page                                 │
│                    │                                         │
│                    ▼                                         │
│  6. Email verification link sent                            │
│                    │                                         │
│                    ▼                                         │
│  7. User verifies email via link                            │
│                                                              │
│  LOGIN FLOW:                                                 │
│  1. User enters email & password                            │
│                    │                                         │
│                    ▼                                         │
│  2. Credentials verified against stored hash                │
│                    │                                         │
│                    ▼                                         │
│  3. Load user profile                                        │
│                    │                                         │
│                    ▼                                         │
│  4. User logged in                                           │
└─────────────────────────────────────────────────────────────┘
```

### 3. Account Linking

Users can link wallet to email account or vice versa:

- **Email → Wallet**: Add wallet address to email-authenticated account
- **Wallet → Email**: Add email/password to wallet-authenticated account
- **Both Methods**: Use either wallet or email to login

### Authentication Features

| Feature | Wallet Auth | Email Auth |
|---------|------------|------------|
| **Signup Required** | No | Yes (with captcha) |
| **Password Required** | No | Yes |
| **Email Verification** | Optional | Required |
| **Account Recovery** | Via wallet | Via email |
| **Multi-device** | Yes | Yes |
| **Security** | Private keys in wallet | Password hashed (SHA-256) |

### Auth Hook (`lib/hooks/useAuth.ts`)

```typescript
function useAuth(): UseAuthReturn {
  return {
    // State
    isConnected: boolean;      // Wallet connected
    isAuthenticated: boolean;  // Profile loaded (wallet or email)
    isLoading: boolean;
    
    // User Data
    walletAddress: string | null;
    profile: UserProfile | null;
    
    // Wallet Info
    walletName: string | null;
    walletIcon: string | null;
    balance: number;  // in ADA
    
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

### User Store Auth Methods (`lib/store/userStore.ts`)

```typescript
interface UserState {
  // Wallet Authentication
  login: (walletAddress: string) => Promise<void>;
  
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
  
  // Logout
  logout: () => void;
}
```

### Security Considerations

**Wallet Authentication:**
1. **Private Keys Never Leave Wallet**: All signing happens in wallet
2. **No Password Storage**: Nothing to breach
3. **Address as Identity**: Cryptographically secure identifier
4. **Session via Local Storage**: Survives page refresh
5. **Disconnect = Logout**: Clear and simple

**Email Authentication:**
1. **Password Hashing**: SHA-256 hashing via Web Crypto API
2. **Email Verification**: Token-based verification (24-hour expiry)
3. **Captcha Protection**: Custom captcha prevents bot signups
4. **Secure Storage**: Passwords stored as hashes in localStorage
5. **Session Management**: Profile persists across sessions

**Best Practices:**
- Use wallet auth for maximum security
- Link email to wallet account for recovery options
- Verify email for important notifications
- Use strong passwords (min 8 chars, mixed case, numbers)

---

## 🤖 AI Chatbot & Support System

### Overview

DonateDAO includes an intelligent chatbot that helps users with common questions and seamlessly connects them to a human agent via Telegram when needed.

### Features

- **15+ Q&A Knowledge Base**: Instant answers to common questions
- **Smart Keyword Matching**: Context-aware responses
- **Telegram Agent Handoff**: Connect to human agent (Sumanth) when needed
- **Always Available**: Floating chat button on all pages
- **Quick Actions**: One-click buttons for common questions

### Knowledge Base Topics

The chatbot can help with:

| Topic | Questions Covered |
|-------|------------------|
| **Wallet Connection** | How to connect, supported wallets, connection issues |
| **Donations** | How to donate, donation process, transaction fees |
| **Campaigns** | Creating campaigns, managing campaigns, campaign status |
| **Withdrawals** | How to withdraw, withdrawal process, approval |
| **Email Verification** | Verify email, resend verification, email issues |
| **Governance** | Voting, proposals, voting power |
| **Security** | Account security, transaction safety |
| **General** | Platform features, network info, troubleshooting |

### Chatbot Component (`components/Chatbot.tsx`)

```typescript
interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

// Usage
<Chatbot isOpen={isOpen} onClose={() => setIsOpen(false)} />
```

### Chatbot Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CHATBOT FLOW                              │
│                                                              │
│  1. User clicks chat button (bottom-right)                   │
│                    │                                         │
│                    ▼                                         │
│  2. Chatbot opens with welcome message                       │
│                    │                                         │
│                    ▼                                         │
│  3. User asks question                                       │
│                    │                                         │
│                    ▼                                         │
│  4. Bot searches knowledge base                             │
│                    │                                         │
│         ┌──────────┴──────────┐                             │
│         │                     │                             │
│         ▼                     ▼                             │
│   Answer Found          No Answer Found                     │
│         │                     │                             │
│         │                     ▼                             │
│         │            Offer to connect to agent              │
│         │                     │                             │
│         │                     ▼                             │
│         │            User clicks "Connect to Agent"         │
│         │                     │                             │
│         │                     ▼                             │
│         │            Message sent to Telegram                │
│         │                     │                             │
│         │                     ▼                             │
│         │            Agent (Sumanth) receives message       │
│         │                     │                             │
│         │                     ▼                             │
│         │            Agent responds via Telegram            │
│         │                                                     │
│         ▼                                                     │
│   User gets instant answer                                   │
└─────────────────────────────────────────────────────────────┘
```

### Telegram Integration

The chatbot integrates with Telegram Bot API to connect users to a human agent:

**Setup Required:**
1. Get Telegram bot token (already configured)
2. Get agent chat ID: Visit `/api/telegram/get-chat-id`
3. Set environment variable: `TELEGRAM_AGENT_CHAT_ID=your_chat_id`

**API Endpoints:**
- `POST /api/telegram/connect` - Send user message to agent
- `GET /api/telegram/get-chat-id` - Get all chat IDs
- `POST /api/telegram/webhook` - Receive messages from Telegram

See `TELEGRAM_SETUP.md` for detailed setup instructions.

---

## 📁 Project Structure

```
cardano-donation-dapp/
│
├── 📂 app/                          # Next.js App Router
│   ├── 📂 admin/
│   │   ├── page.tsx                 # Admin dashboard (SSR wrapper)
│   │   └── Content.tsx              # Admin content (CSR)
│   ├── 📂 api/
│   │   └── 📂 telegram/
│   │       ├── 📂 connect/
│   │       │   └── route.ts         # Telegram agent connection API
│   │       ├── 📂 get-chat-id/
│   │       │   └── route.ts         # Get Telegram chat IDs
│   │       └── 📂 webhook/
│   │           └── route.ts         # Telegram webhook handler
│   ├── 📂 auth/
│   │   ├── page.tsx                 # Auth page (SSR wrapper)
│   │   ├── AuthContent.tsx          # Auth content (CSR)
│   │   ├── 📂 login/
│   │   │   ├── page.tsx             # Login page (SSR wrapper)
│   │   │   └── LoginContent.tsx     # Login form with 2FA support (CSR)
│   │   ├── 📂 signup/
│   │   │   ├── page.tsx             # Signup page (SSR wrapper)
│   │   │   └── SignupContent.tsx    # Signup form with captcha (CSR)
│   │   ├── 📂 verify-email/
│   │   │   ├── page.tsx             # Email verification (SSR wrapper)
│   │   │   └── VerifyEmailContent.tsx # Verification handler (CSR)
│   │   ├── 📂 forgot-password/
│   │   │   ├── page.tsx             # Forgot password (SSR wrapper)
│   │   │   └── ForgotPasswordContent.tsx # OTP-based reset (CSR)
│   │   ├── 📂 reset-password/
│   │   │   ├── page.tsx             # Reset password (SSR wrapper)
│   │   │   └── ResetPasswordContent.tsx # New password form (CSR)
│   │   └── 📂 verify-identity/
│   │       ├── page.tsx             # Identity verification (SSR wrapper)
│   │       └── VerifyIdentityContent.tsx # Document upload (CSR)
│   ├── 📂 campaigns/
│   │   ├── 📂 [id]/
│   │   │   ├── page.tsx             # Campaign detail (SSR wrapper)
│   │   │   ├── Content.tsx          # Campaign detail (CSR)
│   │   │   ├── 📂 edit/
│   │   │   │   ├── page.tsx         # Edit page (SSR wrapper)
│   │   │   │   └── Content.tsx      # Edit content (CSR)
│   │   │   ├── 📂 withdraw/
│   │   │   │   ├── page.tsx         # Withdraw page (SSR wrapper)
│   │   │   │   └── Content.tsx      # Withdraw content (CSR)
│   │   │   └── 📂 admin-invite/
│   │   │       ├── page.tsx         # Admin invite page (SSR wrapper)
│   │   │       └── AdminInviteContent.tsx # Accept admin invitation (CSR)
│   │   ├── page.tsx                 # Campaign listing (SSR wrapper)
│   │   └── CampaignsContent.tsx     # Campaigns list (CSR)
├── 📂 donate/
│   │   └── 📂 [id]/
│   │       ├── page.tsx             # Public donation page (SSR wrapper)
│   │       └── DonateContent.tsx    # Donation form (CSR)
│   ├── 📂 create/
│   │   ├── page.tsx                 # Create page (SSR wrapper)
│   │   └── Content.tsx              # Create form (CSR)
│   ├── 📂 dashboard/
│   │   ├── page.tsx                 # Dashboard (SSR wrapper)
│   │   └── Content.tsx              # Dashboard content (CSR)
│   ├── 📂 governance/
│   │   ├── page.tsx                 # Governance (SSR wrapper)
│   │   └── Content.tsx              # Governance voting (CSR)
│   ├── 📂 my-campaigns/
│   │   ├── page.tsx                 # My campaigns (SSR wrapper)
│   │   └── Content.tsx              # User campaigns list (CSR)
│   ├── 📂 profile/
│   │   ├── page.tsx                 # Profile (SSR wrapper)
│   │   └── Content.tsx              # Profile dashboard (CSR)
│   ├── globals.css                  # Global styles & CSS variables
│   ├── layout.tsx                   # Root layout (wraps ClientProviders)
│   ├── page.tsx                     # Landing page (SSR wrapper)
│   └── HomeWalletSection.tsx        # Home content (CSR)
│
├── 📂 components/                   # React components
│   ├── ClientProviders.tsx          # Mesh SDK provider (client-side)
│   ├── Header.tsx                   # Navigation header with auth
│   ├── PageWrapper.tsx              # Generic page wrapper component
│   ├── Charts.tsx                   # Recharts wrapper components
│   ├── WalletConnect.tsx            # Wallet connection button
│   ├── Chatbot.tsx                  # AI chatbot with step-by-step guidance
│   ├── ChatbotButton.tsx            # Floating chat button
│   ├── Captcha.tsx                  # Custom captcha component
│   ├── WalletInfoModal.tsx          # Modal for wallet users to add email
│   ├── AdminManagement.tsx          # Campaign admin management component
│   ├── QRCodeGenerator.tsx          # QR code generator with download
│   ├── ImageUpload.tsx              # Image upload with compression
│   ├── TwoFactorSetup.tsx           # 2FA setup with QR code
│   ├── TwoFactorVerify.tsx          # 2FA verification modal
│   └── DocumentVerification.tsx     # Identity verification component
│
├── 📂 lib/                          # Utilities & helpers
│   ├── 📂 api/
│   │   └── blockfrost.ts            # Blockfrost API integration
│   ├── 📂 cardano/
│   │   ├── transactions.ts          # Transaction builders
│   │   └── wallet.ts                # Wallet utilities
│   ├── 📂 hydra/
│   │   └── hydraGateway.ts          # Hydra Gateway Service for Event Mode
│   ├── 📂 hooks/
│   │   ├── useAuth.ts               # Authentication hook (client-side guards)
│   │   └── useTransaction.ts        # Transaction management hook
│   ├── 📂 store/
│   │   ├── userStore.ts             # Zustand user state management
│   │   ├── campaignStore.ts         # Zustand campaign state management
│   │   └── syncStore.ts             # Data synchronization store
│   ├── 📂 verification/
│   │   └── documentVerifier.ts      # Mock AI document verification
│   └── 📂 utils/
│       ├── password.ts              # Password hashing utilities
│       ├── telegram.ts              # Telegram bot utilities
│       ├── otp.ts                   # OTP generation/verification
│       └── totp.ts                  # TOTP for 2FA (Google Authenticator)
│
├── 📂 validators/                   # Aiken smart contracts (Plutus V3)
│   ├── 📂 validators/
│   │   ├── campaign_validator.ak    # Campaign management
│   │   ├── donation_validator.ak    # Donation tracking
│   │   ├── governance_validator.ak  # Voting system
│   │   └── multisig_validator.ak    # Multi-sig withdrawals
│   ├── aiken.toml                   # Aiken configuration
│   └── aiken.lock                   # Dependency lock file
│
├── 📂 aiken/                        # Alternative Aiken folder (Plutus V2)
│   └── 📂 validators/
│       └── *.ak                     # Older contract versions
│
├── 📂 public/                       # Static assets
│
├── 📄 Configuration Files
│   ├── next.config.js               # Next.js + WASM config
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── tsconfig.json                # TypeScript config
│   ├── postcss.config.js            # PostCSS config
│   └── package.json                 # Dependencies
│
├── 📄 Documentation
│   ├── README.md                    # This file
│   ├── ENV_SETUP.md                 # Environment setup guide
│   ├── COMPONENTS_README.md         # Component documentation
│   ├── ERROR_FIXES.md               # Common error solutions
│   ├── COMMON_ISSUES.md             # FAQ & troubleshooting
│   └── TELEGRAM_SETUP.md            # Telegram bot setup guide
│
└── 📄 Scripts
    └── setup-github.sh              # GitHub repository setup
```

---

## 🚀 Installation & Setup

### Prerequisites

| Requirement | Version | Installation |
|-------------|---------|--------------|
| Node.js | 18.0.0+ | https://nodejs.org |
| npm | 9.0.0+ | Comes with Node.js |
| Aiken CLI | 1.1.19+ | `cargo install aiken` |
| Git | Latest | https://git-scm.com |
| Cardano Wallet | Any | Nami, Eternl, Flint |

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/cardano-donation-dapp.git
cd cardano-donation-dapp

# 2. Install dependencies
npm install

# 3. Create environment file
cp ENV_SETUP.md .env.local
# Edit .env.local with your Blockfrost API key

# 4. Build smart contracts (optional)
cd validators
aiken build
cd ..

# 5. Start development server
npm run dev

# 6. Open in browser
# http://localhost:3000
```

### Detailed Installation

#### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/cardano-donation-dapp.git
cd cardano-donation-dapp
```

#### Step 2: Install Dependencies

```bash
npm install

# Installs:
# - next@14.2.0
# - react@18.3.0
# - @meshsdk/core@1.7.0
# - @meshsdk/react@1.7.0
# - lucid-cardano@0.10.0
# - zustand@4.5.0
# - recharts@2.12.0
# - tailwindcss@3.4.0
# - typescript@5.x
# - and more...
```

#### Step 3: Configure Environment

Create `.env.local` in project root:

```bash
# Blockfrost API (required)
# Get key from https://blockfrost.io
NEXT_PUBLIC_BLOCKFROST_API_KEY=preprodYOURAPIKEYHERE

# Network (preprod for testing, mainnet for production)
NEXT_PUBLIC_NETWORK=preprod

# Email Service (required for OTP emails)
# Get API key from https://www.brevo.com
BREVO_API_KEY=your_brevo_api_key_here

# AI Verification Service (optional - for production ML model)
# Option 1: Use backend API endpoint
# AI_VERIFICATION_API_URL=https://your-ai-service.com/api/verify
# Option 2: Use local TensorFlow.js model
# AI_VERIFICATION_MODEL_PATH=/models/id-verification-v1.json

# Contract Addresses (after deployment)
NEXT_PUBLIC_CAMPAIGN_SCRIPT_ADDRESS=addr_test1...
NEXT_PUBLIC_DONATION_SCRIPT_ADDRESS=addr_test1...
NEXT_PUBLIC_MULTISIG_SCRIPT_ADDRESS=addr_test1...
NEXT_PUBLIC_GOVERNANCE_SCRIPT_ADDRESS=addr_test1...

# Script Hashes (from plutus.json after aiken build)
NEXT_PUBLIC_CAMPAIGN_SCRIPT_HASH=
NEXT_PUBLIC_DONATION_SCRIPT_HASH=
NEXT_PUBLIC_MULTISIG_SCRIPT_HASH=
NEXT_PUBLIC_GOVERNANCE_SCRIPT_HASH=
```

#### Step 4: Build Smart Contracts

```bash
cd validators
aiken build

# Output:
# ✓ validators/campaign.spend compiled
# ✓ validators/donation.spend compiled
# ✓ validators/multisig.spend compiled
# ✓ validators/governance.spend compiled

cd ..
```

#### Step 5: Run Development Server

```bash
npm run dev

# Output:
#   ▲ Next.js 14.2.0
#   - Local:        http://localhost:3000
#   - Network:      http://192.168.x.x:3000
#
#  ✓ Ready in 2.3s
```

#### Step 6: Install Cardano Wallet

1. Install [Nami Wallet](https://namiwallet.io) or [Eternl](https://eternl.io)
2. Create a new wallet or restore existing
3. Switch to **PreProd testnet** in settings
4. Get test ADA from [Cardano Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)

---

## ⚙️ Configuration

### Next.js Configuration (`next.config.js`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: function (config, options) {
    // Enable WebAssembly (required for Mesh SDK)
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    // Fix for WASM in browser
    if (!options.isServer) {
      config.output.environment = { 
        ...config.output.environment, 
        asyncFunction: true 
      };
    }

    return config;
  },
};

module.exports = nextConfig;
```

### Tailwind Configuration (`tailwind.config.js`)

```javascript
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",      // Blue
        secondary: "hsl(var(--secondary))",  // Purple
        background: "hsl(var(--background))", // Dark navy
        foreground: "hsl(var(--foreground))", // Light gray
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",        // Green
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
    },
  },
  plugins: [],
};
```

### CSS Variables (`app/globals.css`)

```css
:root {
  --primary: 220 100% 60%;        /* Vibrant blue */
  --secondary: 280 80% 60%;       /* Purple */
  --background: 222 47% 11%;      /* Dark navy */
  --foreground: 213 31% 91%;      /* Light gray */
  --card: 224 37% 15%;            /* Lighter navy */
  --border: 216 34% 17%;          /* Subtle borders */
  --accent: 142 76% 36%;          /* Green */
}

/* Custom utility classes */
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

### Aiken Configuration (`validators/aiken.toml`)

```toml
name = "cardano-dapp/validators"
version = "0.0.0"
compiler = "v1.1.19"
plutus = "v3"
license = "Apache-2.0"

[[dependencies]]
name = "aiken-lang/stdlib"
version = "v3.0.0"
source = "github"
```

---

## 📖 Usage Guide

### Creating Campaigns with Different Modes

#### Campaign Mode Selection

When creating a campaign, you can choose from four different modes:

1. **Normal Mode (Default)**
   - Standard L1 transactions
   - ~0.2 ADA per transaction
   - ~20 seconds confirmation time
   - Best for: Regular campaigns, long-term fundraising

2. **Hydra Event Mode** ⚡
   - Fast donations via Hydra Head
   - Lower fees (aggregated)
   - Near-instant confirmations
   - Real-time UI updates (every 2 seconds)
   - Best for: Live events, livestream fundraisers, charity marathons
   - After event: Hydra Head settles to L1 in one aggregated transaction

3. **Long Campaign Mode**
   - Extended duration campaigns
   - Flexible milestones
   - Best for: Multi-year projects, infrastructure development

4. **Small Campaign Mode**
   - Quick campaigns with smaller goals
   - Best for: Small community projects, quick funding needs

#### How to Create a Hydra Event Campaign

1. **Navigate to Create Page:**
   - Click "Create Campaign" in the header
   - Fill in campaign details (title, description, goal, etc.)

2. **Select Hydra Event Mode:**
   - In the "Campaign Mode" dropdown, select "⚡ Hydra Event Mode"
   - You'll see a description: "Fast donations via Hydra Head. Lower fees, near-instant confirmations. Perfect for livestream fundraisers and charity marathons."

3. **Complete Campaign Creation:**
   - Fill in remaining details
   - Click "Create Campaign"
   - Your campaign will be marked with a "⚡ Hydra" badge

4. **Donors Experience:**
   - Donors see "⚡ Hydra Event Mode Active" indicator
   - Donations are processed instantly
   - Real-time counter updates every 2 seconds
   - Lower fees compared to normal mode

### Campaign Admin Management

#### Adding Admins to Your Campaign

1. **Go to Your Campaign:**
   - Navigate to your campaign detail page
   - Scroll to the "Campaign Management" section (only visible to creator)

2. **Add Admin by Username:**
   - Enter the username in the search box
   - Click "Search" to verify the username exists
   - Click "Add Admin" to add them
   - Maximum 7 admins per campaign (including creator)

3. **Share Admin Invite Link:**
   - Copy the admin invite link
   - Share it with users you want to add as admins
   - They can visit the link to accept the invitation

#### Admin Invitation Flow

```
┌─────────────────────────────────────────────────────────────┐
│              ADMIN INVITATION FLOW                           │
│                                                              │
│  1. Campaign creator generates invite link                  │
│                    │                                         │
│                    ▼                                         │
│  2. Creator shares link with potential admin                │
│                    │                                         │
│                    ▼                                         │
│  3. User visits /campaigns/[id]/admin-invite               │
│                    │                                         │
│                    ▼                                         │
│  4. User must be logged in                                  │
│                    │                                         │
│                    ▼                                         │
│  5. User clicks "Accept Invitation"                         │
│                    │                                         │
│                    ▼                                         │
│  6. User is added as admin                                  │
│                    │                                         │
│                    ▼                                         │
│  7. Redirect to campaign page                                │
└─────────────────────────────────────────────────────────────┘
```

#### Username Requirements

- **Unique**: Each username must be unique across all users
- **Minimum Length**: 3 characters
- **Allowed Characters**: Letters, numbers, and underscores only
- **Case Insensitive**: Usernames are stored in lowercase

### Campaign Sharing

#### Public Donation Link

Every campaign automatically gets a public donation link:
- **Format**: `/donate/[campaign-id]`
- **Access**: Anyone can visit and donate (no login required)
- **Features**: 
  - Full campaign information
  - Progress tracking
  - Direct wallet donation
  - Social sharing buttons

#### Social Media Sharing

Share your campaign on:
- **Twitter**: Pre-filled tweet with campaign link
- **Facebook**: Share dialog with campaign link
- **LinkedIn**: Professional sharing
- **WhatsApp**: Direct message sharing

#### Sharing Flow

```
┌─────────────────────────────────────────────────────────────┐
│              CAMPAIGN SHARING FLOW                           │
│                                                              │
│  1. Campaign creator goes to campaign page                  │
│                    │                                         │
│                    ▼                                         │
│  2. Scroll to "Campaign Management" section                  │
│                    │                                         │
│                    ▼                                         │
│  3. Copy public donation link                               │
│                    │                                         │
│                    ▼                                         │
│  4. Share via:                                               │
│     - Social media buttons (Twitter, Facebook, etc.)        │
│     - Direct link sharing                                    │
│     - Email, messaging apps                                  │
│                    │                                         │
│                    ▼                                         │
│  5. Recipients visit /donate/[id]                           │
│                    │                                         │
│                    ▼                                         │
│  6. They can donate directly with wallet                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📖 Usage Guide (Continued)

### Identity Verification (Required for Campaign Creators)

Before creating campaigns, you must verify your identity. This protects donors from scams.

#### How to Verify Your Identity

1. **Go to Verify Page:**
   - Click "Create Campaign" when logged in
   - If not verified, you'll be redirected to `/auth/verify-identity`

2. **Choose Document Type:**
   - **Passport** 🛂 - Upload photo of passport
   - **Driving License** 🪪 - Upload photo of license

3. **Upload Document:**
   - Click document button to open file picker
   - Select a clear photo of your document
   - Preview will show before submission

4. **Wait for AI Verification:**
   - Our AI analyzes your document (2-4 seconds)
   - 70% success rate for demo (real system would be higher)
   - You get 3 attempts

5. **If Failed 3 Times:**
   - **Utility Bill Option** becomes available
   - Upload a recent electricity/water bill
   - Manual review takes up to 3 hours

#### Verification Status

| Status | Meaning |
|--------|---------|
| ✅ Verified | Identity confirmed, can create campaigns |
| 🔍 Under Review | Utility bill being manually reviewed |
| ❌ Failed | Verification failed, try again |
| ⏳ Pending | Document being analyzed |

---

### Two-Factor Authentication (2FA)

Add extra security to your account with Google Authenticator.

#### Setting Up 2FA

1. **Go to Profile → Settings**
2. **Find "Two-Factor Authentication"**
3. **Click "Enable 2FA"**
4. **Scan QR Code:**
   - Open Google Authenticator app
   - Tap "+" to add new
   - Scan the QR code shown
5. **Enter 6-Digit Code:**
   - Enter the code from your authenticator
   - Click "Verify & Enable"
6. **Save Backup Codes:**
   - 8 one-time codes are generated
   - Save them securely (you need them if you lose your phone)

#### Using 2FA on Login

1. Enter email and password
2. Modal appears asking for 2FA code
3. Open authenticator app
4. Enter the current 6-digit code
5. Click "Verify" to complete login

#### Backup Codes

- Each backup code works only once
- Use if you lose access to your authenticator
- 8 characters, alphanumeric
- Can regenerate by disabling and re-enabling 2FA

---

### Forgot Password (Password Reset)

Reset your password using email OTP.

#### Steps to Reset Password

1. **Go to Login Page**
2. **Click "Forgot Password?"**
3. **Enter Your Email:**
   - Must be a registered email
   - OTP will be shown in alert (demo mode)
4. **Enter 6-Digit OTP:**
   - Check the alert popup for your OTP
   - Enter it on the verification page
   - OTP expires in 10 minutes
5. **Create New Password:**
   - Minimum 8 characters
   - Confirm password
   - Click "Reset Password"
6. **Login with New Password**

#### Notes

- Demo mode: OTP shown in browser alert
- Production: OTP would be sent via email
- If OTP expires, click "Resend OTP"

---

### QR Codes for Campaign Sharing

Every campaign gets an auto-generated QR code.

#### Finding Your QR Code

1. Go to your campaign page
2. Scroll to "Campaign Management" section
3. QR code is displayed above sharing links

#### Downloading QR Code

1. Click "Save QR" button
2. PNG file downloads with campaign name
3. Use for:
   - Posters and flyers
   - Event displays
   - Social media posts
   - Email campaigns

#### QR Code Features

- **High Quality**: Generated at 2x resolution
- **Error Correction**: Level H (30% recovery)
- **Scannable**: Works with any QR scanner
- **Clean Design**: White background, black code

---

### Campaign Images

Add visual appeal with custom campaign images.

#### Uploading an Image

1. **On Create Campaign Page:**
   - Find "Campaign Image (Optional)" section
   - Click the dashed box or drag an image

2. **Image Processing:**
   - Automatic compression (max 800px dimension)
   - Max file size: 500KB
   - Supports: JPG, PNG, GIF, WebP

3. **Preview:**
   - Image shows immediately after upload
   - Hover to see "Remove Image" button

#### Where Images Display

- Campaign cards on browse page
- Campaign detail page hero
- Public donation page
- QR code downloads (filename includes campaign title)

---

### AI Chatbot Assistant

Get instant help from our AI chatbot.

#### Accessing the Chatbot

- **Floating Button**: Click 🤖 button (bottom-right corner)
- **Available**: On every page of the app

#### What the Chatbot Helps With

| Topic | Example Questions |
|-------|-------------------|
| Wallet | "How do I connect my wallet?" |
| Donations | "How do I donate to a campaign?" |
| Campaigns | "How do I create a campaign?" |
| Verification | "How do I verify my identity?" |
| 2FA | "How do I set up 2FA?" |
| Password | "How do I reset my password?" |
| Admin | "How do I add admins to my campaign?" |

#### Chatbot Features

- **Step-by-Step Guides**: Detailed instructions for complex tasks
- **Quick Actions**: Pre-filled buttons for common questions
- **Chat History**: Saved across sessions (localStorage)
- **User Data Collection**: Email/username for follow-up
- **Human Handoff**: Connect to agent Sumanth via Telegram

#### Connecting to Human Support

If the chatbot can't help:
1. It will ask if you want to connect to an agent
2. Click "Connect to Agent Sumanth"
3. Message is sent to Telegram
4. Agent will respond via Telegram

---

### For Donors

#### 1. Connect Wallet
1. Click "Connect Wallet" button
2. Select your wallet (Nami, Eternl, etc.)
3. Approve connection in wallet popup
4. Profile created automatically

#### 2. Browse Campaigns
1. Navigate to `/campaigns`
2. Filter by category (Education, Health, etc.)
3. Sort by funding progress or deadline
4. Click campaign for details

#### 3. Make Donation
1. Open campaign detail page
2. Enter amount or click quick buttons (10, 50, 100 ₳)
3. View estimated fee
4. Click "Donate Now"
5. Approve transaction in wallet
6. Receive voting power (1 ₳ = 1 vote)

#### 4. Vote on Proposals
1. Navigate to `/governance`
2. View active proposals
3. Check your voting power
4. Click "Vote For", "Vote Against", or "Abstain"
5. Sign transaction in wallet

### For Campaign Creators

#### 1. Create Campaign
1. Connect wallet
2. Navigate to `/create`
3. Fill in campaign details:
   - Title (max 100 characters)
   - Description (max 1000 characters)
   - Funding goal (in ADA)
   - Deadline (future date)
   - Category
4. Review fee estimate (~0.3 ₳)
5. Click "Create Campaign"
6. Sign transaction

#### 2. Manage Campaign Admins
1. Go to your campaign detail page
2. Scroll to "Campaign Management" section
3. **Add Admin by Username:**
   - Enter username in search box
   - Click "Search" to verify
   - Click "Add Admin"
   - Maximum 7 admins per campaign
4. **Share Admin Invite Link:**
   - Copy the admin invite link
   - Share with users you want as admins
   - They visit the link to accept

#### 3. Share Campaign
1. Go to campaign detail page
2. Scroll to "Campaign Management" section
3. **Copy Public Donation Link:**
   - Copy the public donation link
   - Share on social media, email, messaging
4. **Social Media Sharing:**
   - Click Twitter, Facebook, LinkedIn, or WhatsApp buttons
   - Pre-filled messages with campaign link
5. **Direct Link Sharing:**
   - Anyone can visit `/donate/[campaign-id]`
   - No login required to donate

#### 4. Monitor Campaign
1. View in `/profile` under "Your Campaigns"
2. Track donations in real-time
3. See milestone progress
4. View admin list and manage admins

### For Admins

#### 1. Access Admin Dashboard
1. Connect admin wallet
2. Navigate to `/admin`
3. View pending withdrawals

#### 2. Sign Withdrawals
1. Review withdrawal request details
2. Click "Sign Withdrawal"
3. Sign transaction in wallet
4. Wait for other admin signatures (3 of 5)

#### 3. Execute Withdrawal
1. Once 3 signatures collected
2. Click "Execute Withdrawal"
3. Funds transferred to recipient

---

## 🔄 Data Flow

### Donation Flow

#### Normal Mode (L1 Transactions)
```
┌─────────────────────────────────────────────────────────────┐
│              NORMAL MODE DONATION FLOW                        │
└─────────────────────────────────────────────────────────────┘

User clicks "Donate"
        │
        ▼
┌───────────────────┐
│ Frontend builds   │
│ transaction:      │
│ - Input: User UTxO│
│ - Output: Script  │
│ - Datum: Donation │
│ - Fee: ~0.2 ADA   │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Estimate fee via  │
│ Blockfrost API    │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Display fee to    │
│ user for approval │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ User approves in  │
│ wallet popup      │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Wallet signs TX   │
│ (private key)     │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Submit to network │
│ via wallet/       │
│ Blockfrost        │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Blockchain        │
│ validates via     │
│ donation_validator│
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ TX confirmed      │
│ (~20 seconds)     │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Update Zustand    │
│ store:            │
│ - Add transaction │
│ - Update stats    │
│ - Add voting power│
└───────────────────┘
```

#### Hydra Event Mode (Fast Donations)
```
┌─────────────────────────────────────────────────────────────┐
│           HYDRA EVENT MODE DONATION FLOW                      │
└─────────────────────────────────────────────────────────────┘

User clicks "Donate" (Hydra-enabled campaign)
        │
        ▼
┌───────────────────┐
│ Frontend detects  │
│ Hydra Event Mode  │
│ (campaignMode)    │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Initialize Hydra  │
│ Head if needed    │
│ (via Gateway)     │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Process donation  │
│ via Hydra Gateway │
│ - Lower fees      │
│ - Near-instant    │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Donation recorded │
│ in Hydra Head     │
│ (confirmed)       │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Real-time UI      │
│ updates instantly │
│ (every 2 seconds) │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Update Zustand    │
│ store:            │
│ - Add transaction │
│ - Update stats    │
│ - Add voting power│
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ After event ends: │
│ Hydra Head settles│
│ to L1 (aggregated)│
│ - Single TX       │
│ - All donations   │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Show success      │
│ with TX hash &    │
│ Cardanoscan link  │
└───────────────────┘
```

### State Synchronization

```
┌─────────────────────────────────────────────────────────────┐
│                 STATE SYNCHRONIZATION                        │
└─────────────────────────────────────────────────────────────┘

                   ┌─────────────┐
                   │  Blockchain │
                   │   (Truth)   │
                   └──────┬──────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
   ┌────────────┐  ┌────────────┐  ┌────────────┐
   │ Blockfrost │  │   Wallet   │  │   Other    │
   │    API     │  │   State    │  │   Nodes    │
   └─────┬──────┘  └─────┬──────┘  └────────────┘
         │               │
         └───────┬───────┘
                 │
                 ▼
         ┌─────────────┐
         │  Frontend   │
         │   State     │
         │  (Zustand)  │
         └─────┬───────┘
               │
               ▼
         ┌─────────────┐
         │ localStorage│
         │ (Persist)   │
         └─────────────┘
```

---

## 🔒 Security Features

### Smart Contract Security

| Feature | Description |
|---------|-------------|
| **Multi-sig** | 3-of-5 admin approval for withdrawals |
| **Time Lock** | Optional delay before execution |
| **Unique Signatures** | Each admin can only sign once |
| **On-chain Audit** | All actions permanently recorded |
| **Plutus V3** | Latest security features |

### Frontend Security

| Feature | Description |
|---------|-------------|
| **No Private Keys** | Keys never leave wallet |
| **No Passwords** | Nothing to breach |
| **CIP-30 Standard** | Standard wallet interface |
| **Client-side Signing** | TX built locally, signed in wallet |
| **HTTPS Only** | Encrypted communication |

### Operational Security

| Feature | Description |
|---------|-------------|
| **Read-only API Key** | Blockfrost key for queries only |
| **Environment Variables** | Secrets not in code |
| **Network Detection** | Prevent testnet/mainnet mismatch |
| **Transaction Validation** | Validate before signing |

---

## 🌐 Deployment Guide

### Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables in Vercel dashboard
# - NEXT_PUBLIC_BLOCKFROST_API_KEY
# - NEXT_PUBLIC_NETWORK
# - NEXT_PUBLIC_*_SCRIPT_ADDRESS (after contract deployment)
```

### Deploy to Netlify

```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod

# 4. Set environment variables in Netlify dashboard
```

### Deploy Smart Contracts to Testnet

```bash
# 1. Build contracts
cd validators
aiken build

# 2. Get testnet ADA
# Visit: https://docs.cardano.org/cardano-testnet/tools/faucet/

# 3. Deploy using cardano-cli
# (See detailed commands in Smart Contracts section)

# 4. Note script addresses from deployment

# 5. Update .env.local with addresses
```

### Production Checklist

- [ ] Smart contracts audited
- [ ] All features tested on testnet
- [ ] Environment variables set
- [ ] Error tracking enabled (Sentry)
- [ ] Analytics configured
- [ ] Rate limiting implemented
- [ ] Backup recovery plan ready
- [ ] Legal compliance verified

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:integration

# Smart contract tests
cd validators
aiken check  # Type check
aiken test   # Run tests
```

### Manual Testing Checklist

#### Landing Page
- [ ] Page loads without errors
- [ ] Wallet connect button works
- [ ] Statistics display correctly
- [ ] All links functional
- [ ] Responsive on mobile

#### Authentication
- [ ] Wallet detection works
- [ ] Connection succeeds
- [ ] Profile created automatically
- [ ] Balance displays correctly
- [ ] Disconnect works

#### Campaigns
- [ ] List loads correctly
- [ ] Filters work
- [ ] Progress bars accurate
- [ ] Campaign detail loads
- [ ] Donation form validates

#### Donations
- [ ] Amount validation works
- [ ] Fee estimates display
- [ ] Transaction builds correctly
- [ ] Wallet signing works
- [ ] Confirmation displays

#### Profile
- [ ] Stats calculate correctly
- [ ] Transaction history shows
- [ ] Charts render
- [ ] Edit profile works
- [ ] Settings save

#### Governance
- [ ] Proposals display
- [ ] Voting power shows
- [ ] Vote buttons work
- [ ] Results update

---

## 🔧 Troubleshooting

### Common Issues

#### "404 Not Found" or "500 Internal Server Error" on Pages
**Cause**: Mesh SDK's WASM files cannot load during Server-Side Rendering.

**Solution**: Use SSR/CSR split pattern:
```typescript
// page.tsx
'use client';
import dynamic from 'next/dynamic';

const PageContent = dynamic(() => import('./Content'), { ssr: false });

export default function Page() {
    return <PageContent />;
}
```

#### "Module not found: @meshsdk/react"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### "WASM module not found" or "Failed to compile"
**Cause**: WASM loading attempted during SSR.

**Solution**:
1. Ensure all wallet-dependent code is in `Content.tsx` files
2. Use `dynamic(() => import('./Content'), { ssr: false })`
3. Add `isClient` checks in hooks:
```typescript
const [isClient, setIsClient] = useState(false);
useEffect(() => { setIsClient(true); }, []);
if (!isClient) return null;
```

#### "Blockfrost API error"
```bash
# Check your .env.local
# - API key correct
# - Key matches network (preprod vs mainnet)
```

#### "Transaction fails"
- Check wallet balance (need ADA for fees)
- Verify network matches
- Ensure contracts deployed

#### "Wallet not connecting"
- Install supported wallet extension
- Check network setting in wallet
- Try different browser

#### "useWallet must be used within MeshProvider"
**Solution**: Ensure `ClientProviders` wraps the app in `layout.tsx`:
```typescript
// app/layout.tsx
<ClientProviders>
    {children}
</ClientProviders>
```

#### "Google Fonts failing to load"
**Cause**: Temporary DNS/network issue (EAI_AGAIN error).

**Solution**: This is a temporary network issue. The app will use fallback fonts. Try:
```bash
# Restart dev server
npm run dev
```

### Debug Mode

Add to `.env.local`:
```bash
NEXT_PUBLIC_DEBUG=true
```

Check browser console for detailed logs.

### Verifying All Pages Work

Run this command to test all routes:
```bash
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000" && echo " - Home"
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/campaigns" && echo " - Campaigns"
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/auth" && echo " - Auth"
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/profile" && echo " - Profile"
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/governance" && echo " - Governance"
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/create" && echo " - Create"
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/admin" && echo " - Admin"
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/dashboard" && echo " - Dashboard"
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/my-campaigns" && echo " - My Campaigns"
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/donate/mock_1" && echo " - Public Donation"
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/campaigns/mock_1/admin-invite" && echo " - Admin Invite"
```

All should return `200`.

---

## 👥 Contributing

We welcome contributions! Here's how:

### Code Style

- TypeScript with strict mode
- ESLint + Prettier formatting
- Conventional commits

### Pull Request Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Commit Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Formatting, no code change
refactor: Code restructure
test: Add tests
chore: Maintenance
```

---

## 📄 License

This project is licensed under the **Apache-2.0 License**.

```
Copyright 2025 DonateDAO Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| **Aiken Documentation** | https://aiken-lang.org |
| **Mesh SDK** | https://meshjs.dev |
| **Cardano Docs** | https://docs.cardano.org |
| **Blockfrost** | https://blockfrost.io |
| **Cardanoscan** | https://preprod.cardanoscan.io |
| **Testnet Faucet** | https://docs.cardano.org/cardano-testnet/tools/faucet/ |

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Total Files** | 70+ |
| **Lines of Code** | ~8,000+ |
| **React Components** | 25+ |
| **Pages** | 12 |
| **Content Components** | 12 |
| **Smart Contracts** | 4 |
| **API Functions** | 30+ |
| **Custom Hooks** | 3 |
| **Zustand Stores** | 3 |
| **Dependencies** | 25+ |

---

## 📝 Changelog

### v1.3.0 (November 2025) - Campaign Admin Management & Sharing

#### ✨ New Features
- **Campaign Admin Management**: Add up to 7 admins per campaign by username
- **Admin Invitation System**: Shareable invite links for adding campaign admins
- **Public Donation Pages**: Standalone donation pages accessible via shared links
- **Social Media Sharing**: Share campaigns on Twitter, Facebook, LinkedIn, WhatsApp
- **Username Uniqueness**: Enforced unique usernames across all users
- **Username Search**: Find users by username to add as admins

#### 🔧 Improvements
- Enhanced campaign detail page with admin management section
- Improved campaign creation with automatic admin initialization
- Better user profile management with username validation

#### 📄 New Pages
- `/campaigns/[id]/admin-invite` - Admin invitation acceptance page
- `/donate/[id]` - Public donation page (no login required)

#### 🧩 New Components
- `AdminManagement.tsx` - Campaign admin management UI
- `AdminInviteContent.tsx` - Admin invitation acceptance
- `DonateContent.tsx` - Public donation page

### v1.2.0 (November 2025) - SSR/CSR Architecture Fix

#### 🐛 Bug Fixes
- **Fixed 404/500 errors** on all pages caused by WASM loading during SSR
- **Fixed TypeScript errors** in campaign stores and hooks
- **Fixed `getCampaignById` to `getCampaign`** function name in stores
- **Added `purpose` field** to Campaign interface

#### 🏗️ Architecture Changes
- **Implemented SSR/CSR split pattern** for all wallet-dependent pages
- **Created 12 new Content components** for client-side rendering:
  - `HomeWalletSection.tsx`, `AuthContent.tsx`, `CampaignsContent.tsx`
  - `Content.tsx` for profile, create, governance, admin, dashboard, my-campaigns
  - `Content.tsx` for campaign detail, edit, withdraw pages
- **Added `isClient` guards** in `useAuth` and `useTransaction` hooks
- **Wrapped `Header` component** in `MeshProvider` for wallet context

#### ✨ New Features
- **Unlimited campaigns per user** - Users can create multiple campaigns
- **Full campaign dashboard** - Detailed stats, donations, remaining funds
- **User profile with data visualization** - Charts for donation history
- **Transaction history tracking** - Complete donation records

### v1.1.0 (November 2025) - User Authentication & Profiles

- Added wallet-based authentication system
- Implemented user profiles with Zustand persistence
- Added transaction history and statistics
- Created data visualization charts with Recharts
- Implemented campaign creation flow
- Added governance voting system

### v1.0.0 (November 2025) - Initial Release

- Core donation platform functionality
- Multi-signature withdrawal system
- On-chain governance
- Aiken smart contracts (Plutus V3)
- Mesh SDK integration

---

<p align="center">
  <strong>Built with ❤️ for the Cardano Community</strong>
  <br>
  <em>Powered by Aiken, Next.js, and Mesh SDK</em>
  <br><br>
  <strong>Cardano Hackathon 2025</strong>
</p>
