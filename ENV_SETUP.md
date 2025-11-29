# Environment Configuration Guide

> **Last Updated**: November 29, 2025

## Setting Up Your Environment Variables

Create a file named `.env.local` in the project root with the following configuration:

```bash
# ============================================================================
# BLOCKFROST API
# ============================================================================
# Get your API key from https://blockfrost.io
# Create a free account and generate a project key
# Make sure the key matches your network (preprod/mainnet)

NEXT_PUBLIC_BLOCKFROST_API_KEY=preprodXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# ============================================================================
# NETWORK CONFIGURATION
# ============================================================================
# Options: 'preprod' (testnet) or 'mainnet' (production)
# IMPORTANT: Use 'preprod' for testing before deploying to mainnet

NEXT_PUBLIC_NETWORK=preprod

# ============================================================================
# SMART CONTRACT ADDRESSES (After Deployment)
# ============================================================================
# These will be available after you deploy your Aiken smart contracts
# Run 'aiken build' in the validators folder to compile contracts
# Then deploy using cardano-cli or similar tools

# Campaign Validator Script Address
NEXT_PUBLIC_CAMPAIGN_SCRIPT_ADDRESS=addr_test1...

# Donation Validator Script Address  
NEXT_PUBLIC_DONATION_SCRIPT_ADDRESS=addr_test1...

# Multi-Sig Validator Script Address
NEXT_PUBLIC_MULTISIG_SCRIPT_ADDRESS=addr_test1...

# Governance Validator Script Address
NEXT_PUBLIC_GOVERNANCE_SCRIPT_ADDRESS=addr_test1...

# ============================================================================
# SMART CONTRACT HASHES (After Deployment)
# ============================================================================
# Script hashes are generated when you compile the contracts
# Found in validators/plutus.json after running 'aiken build'

NEXT_PUBLIC_CAMPAIGN_SCRIPT_HASH=
NEXT_PUBLIC_DONATION_SCRIPT_HASH=
NEXT_PUBLIC_MULTISIG_SCRIPT_HASH=
NEXT_PUBLIC_GOVERNANCE_SCRIPT_HASH=

# ============================================================================
# ADMIN CONFIGURATION (Optional)
# ============================================================================
# List of admin wallet addresses for multi-sig operations

NEXT_PUBLIC_ADMIN_ADDRESSES=addr_test1...,addr_test1...,addr_test1...,addr_test1...,addr_test1...
NEXT_PUBLIC_MULTISIG_THRESHOLD=3

# ============================================================================
# DEBUG MODE
# ============================================================================
NEXT_PUBLIC_DEBUG=false
```

## Quick Setup Steps

1. **Create Blockfrost Account**
   - Visit https://blockfrost.io
   - Sign up for free
   - Create a new project for PreProd testnet
   - Copy the project ID (API key)

2. **Create .env.local file**
   ```bash
   touch .env.local
   ```

3. **Add your API key**
   ```bash
   NEXT_PUBLIC_BLOCKFROST_API_KEY=your_key_here
   NEXT_PUBLIC_NETWORK=preprod
   ```

4. **Restart the development server**
   ```bash
   npm run dev
   ```

## Verifying Your Setup

After setting up, you can verify the Blockfrost connection by checking:
- Browser console for API errors
- Network tab for successful Blockfrost requests
- Transaction features should show fee estimates

## Getting Testnet ADA

For testing on PreProd:
1. Install a Cardano wallet (Nami, Eternl, Flint)
2. Switch to PreProd testnet in wallet settings
3. Visit the Cardano Testnet Faucet: https://docs.cardano.org/cardano-testnet/tools/faucet/
4. Request test ADA (usually 1000 tADA)

