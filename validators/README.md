# DonateDAO Smart Contracts

> **Aiken v1.1.19 | Plutus V3**
> 
> **Last Updated**: November 29, 2025

---

## Overview

This directory contains the Aiken smart contracts for the DonateDAO donation platform. All contracts are written in Aiken and compile to Plutus V3.

## Contract Files

```
validators/
├── validators/
│   ├── campaign_validator.ak    # Campaign lifecycle management
│   ├── donation_validator.ak    # Donation tracking & voting power
│   ├── multisig_validator.ak    # 3-of-5 withdrawal approval
│   └── governance_validator.ak  # Democratic proposal voting
├── aiken.toml                   # Project configuration
└── README.md                    # This file
```

---

## 1. Campaign Validator (`campaign_validator.ak`)

**Purpose**: Manages the complete lifecycle of fundraising campaigns.

### Datum Structure

```aiken
pub type CampaignDatum {
  campaign_id: ByteArray,
  creator: ByteArray,           // Creator's verification key hash
  title: ByteArray,
  goal_lovelace: Int,
  deadline_posix: Int,
  total_raised: Int,
  status: CampaignStatus,       // Active | Completed | Cancelled
}
```

### Redeemer Actions

| Action | Description | Validation |
|--------|-------------|------------|
| `CreateCampaign` | Initialize new campaign | Goal > 0, deadline in future, creator signs |
| `UpdateCampaign` | Modify campaign details | Creator signature required |
| `CancelCampaign` | Cancel campaign | Creator signs, no funds raised |
| `CompleteCampaign` | Mark as successful | Goal reached, creator signs |

---

## 2. Donation Validator (`donation_validator.ak`)

**Purpose**: Records donations and allocates voting power to donors.

### Datum Structure

```aiken
pub type DonationDatum {
  campaign_id: ByteArray,
  donor: ByteArray,             // Donor's verification key hash
  amount_lovelace: Int,
  timestamp_posix: Int,
  voting_power: Int,            // = amount (1 ADA = 1 vote)
}
```

### Redeemer Actions

| Action | Description | Validation |
|--------|-------------|------------|
| `Donate` | Make donation | Amount > 0, donor signs |
| `Withdraw` | Campaign owner withdraws | Campaign owner authorization |
| `ClaimRefund` | Refund if campaign cancelled | Original donor signature |

### Voting Power

```
Voting Power = Total Donations (in lovelace)
1 ADA donated = 1,000,000 voting power
```

---

## 3. Multi-Signature Validator (`multisig_validator.ak`)

**Purpose**: Implements secure 3-of-5 multi-signature withdrawal system.

### Datum Structure

```aiken
pub type MultiSigDatum {
  admins: List<ByteArray>,      // 5 admin key hashes
  threshold: Int,               // Required signatures (3)
  time_lock: Option<Int>,       // Optional delay timestamp
  withdrawal_request: WithdrawalRequest,
}

pub type WithdrawalRequest {
  campaign_id: ByteArray,
  amount_lovelace: Int,
  recipient: ByteArray,
  proposed_at: Int,
  signatures: List<ByteArray>,  // Collected signatures
}
```

### Redeemer Actions

| Action | Description | Validation |
|--------|-------------|------------|
| `ProposeWithdrawal` | Create withdrawal request | Admin proposes (1 signature) |
| `SignWithdrawal` | Add signature | Valid admin, no duplicates |
| `ExecuteWithdrawal` | Execute after threshold | 3+ signatures, time lock passed |
| `CancelWithdrawal` | Cancel request | Requires 3+ admin signatures |

### Security Flow

```
Step 1: Admin #1 proposes → [1/3]
Step 2: Admin #2 signs → [2/3]
Step 3: Admin #3 signs → [3/3] ✓
Step 4: Any admin executes → Funds transferred
```

---

## 4. Governance Validator (`governance_validator.ak`)

**Purpose**: Enables democratic decision-making through token-weighted voting.

### Datum Structure

```aiken
pub type GovernanceDatum {
  proposal_id: ByteArray,
  proposer: ByteArray,
  title: ByteArray,
  description: ByteArray,
  proposal_type: ProposalType,
  votes_for: Int,
  votes_against: Int,
  voting_start: Int,
  voting_end: Int,
  status: ProposalStatus,       // Proposed | Active | Passed | Rejected | Executed
  quorum: Int,                  // Minimum votes required
}

pub type ProposalType {
  AllocateFunds { campaign_id: ByteArray, amount: Int }
  ChangeParameter { parameter_name: ByteArray, new_value: ByteArray }
  AddAdmin { new_admin: ByteArray }
  RemoveAdmin { admin_to_remove: ByteArray }
}
```

### Voting Rules

- **Voting Power**: Based on total donations (1 ADA = 1 vote)
- **Quorum**: 20% of total voting power must participate
- **Majority**: 50%+ of votes must be "For" to pass

---

## Building

```bash
# Navigate to validators directory
cd validators

# Compile all contracts
aiken build

# Output: validators/plutus.json
```

## Testing

```bash
# Type check
aiken check

# Run all tests
aiken check

# Run specific tests
aiken check -m campaign
```

## Configuration

**aiken.toml**
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

## Deployment

### 1. Build Contracts
```bash
cd validators
aiken build
```

### 2. Get Testnet ADA
Visit: https://docs.cardano.org/cardano-testnet/tools/faucet/

### 3. Deploy Reference Scripts
```bash
cardano-cli transaction build \
  --testnet-magic 1 \
  --tx-in <your-utxo> \
  --tx-out <script-address>+2000000 \
  --tx-out-reference-script-file campaign_validator.plutus \
  --change-address <your-address> \
  --out-file tx.raw

cardano-cli transaction sign \
  --testnet-magic 1 \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --out-file tx.signed

cardano-cli transaction submit \
  --testnet-magic 1 \
  --tx-file tx.signed
```

### 4. Note Script Addresses

After deployment, add addresses to `.env.local`:
```bash
NEXT_PUBLIC_CAMPAIGN_SCRIPT_ADDRESS=addr_test1...
NEXT_PUBLIC_DONATION_SCRIPT_ADDRESS=addr_test1...
NEXT_PUBLIC_MULTISIG_SCRIPT_ADDRESS=addr_test1...
NEXT_PUBLIC_GOVERNANCE_SCRIPT_ADDRESS=addr_test1...
```

---

## Resources

- [Aiken Documentation](https://aiken-lang.org)
- [Cardano Developer Portal](https://developers.cardano.org)
- [Plutus V3 Specification](https://plutus.cardano.intersectmbo.org/)
- [Blockfrost API](https://blockfrost.io)

---

**Last Updated**: November 29, 2025
