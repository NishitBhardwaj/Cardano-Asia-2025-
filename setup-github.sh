#!/bin/bash

# ============================================
# GitHub Repository Setup Script
# Cardano Donation DApp
# ============================================

set -e

echo "🚀 Setting up GitHub repository..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Git LFS
echo "📦 Step 1: Checking Git LFS..."
if ! command -v git-lfs &> /dev/null; then
    echo -e "${YELLOW}Git LFS not found. Installing...${NC}"
    sudo pacman -S git-lfs --noconfirm
fi
echo -e "${GREEN}✓ Git LFS is installed${NC}"

# Step 2: Initialize Git LFS
echo ""
echo "📦 Step 2: Initializing Git LFS..."
git lfs install
echo -e "${GREEN}✓ Git LFS initialized${NC}"

# Step 3: Track files with LFS
echo ""
echo "📦 Step 3: Setting up LFS tracking..."
git lfs track "*.png" "*.jpg" "*.jpeg" "*.gif" "*.svg" "*.webp"
git lfs track "*.psd" "*.ai" "*.sketch" "*.fig"
git lfs track "*.ttf" "*.otf" "*.woff" "*.woff2"
git lfs track "*.mp4" "*.mov" "*.mp3" "*.wav"
git lfs track "*.uplc" "plutus.json"
echo -e "${GREEN}✓ LFS tracking configured${NC}"

# Step 4: Add all files
echo ""
echo "📦 Step 4: Adding files to git..."
git add .gitattributes
git add -A
echo -e "${GREEN}✓ Files added${NC}"

# Step 5: Commit
echo ""
echo "📦 Step 5: Creating initial commit..."
git commit -m "🎉 Initial commit: Cardano Community Donation DApp

Features:
- Campaign creation and management
- Donation system with voting power
- Multi-signature withdrawals (3-of-5)
- On-chain governance voting
- Wallet integration (Nami, Eternl, Flint)
- Blockfrost API integration
- Aiken smart contracts (Plutus V3)

Built for Cardano Hackathon 2025"

echo -e "${GREEN}✓ Committed${NC}"

# Step 6: Create GitHub repo
echo ""
echo "📦 Step 6: Creating GitHub repository..."
echo ""
echo -e "${YELLOW}Choose repository name:${NC}"
read -p "Repository name [cardano-donation-dapp]: " REPO_NAME
REPO_NAME=${REPO_NAME:-cardano-donation-dapp}

echo ""
echo -e "${YELLOW}Make repository public or private?${NC}"
read -p "Public (y/n) [y]: " IS_PUBLIC
IS_PUBLIC=${IS_PUBLIC:-y}

if [ "$IS_PUBLIC" = "y" ] || [ "$IS_PUBLIC" = "Y" ]; then
    VISIBILITY="--public"
else
    VISIBILITY="--private"
fi

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "Using GitHub CLI to create repository..."
    gh repo create "$REPO_NAME" $VISIBILITY --source=. --remote=origin --push
    echo -e "${GREEN}✓ Repository created and pushed!${NC}"
else
    echo -e "${YELLOW}GitHub CLI not found. Creating remote manually...${NC}"
    echo ""
    echo "Please create a repository on GitHub.com named: $REPO_NAME"
    echo ""
    read -p "Enter your GitHub username: " GITHUB_USER
    
    git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git" 2>/dev/null || \
    git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
    
    git branch -M main
    git push -u origin main
    echo -e "${GREEN}✓ Pushed to GitHub!${NC}"
fi

echo ""
echo "============================================"
echo -e "${GREEN}🎉 SUCCESS! Repository is ready!${NC}"
echo "============================================"
echo ""
echo "Your repository URL:"
if command -v gh &> /dev/null; then
    gh repo view --web 2>/dev/null || echo "https://github.com/$GITHUB_USER/$REPO_NAME"
else
    echo "https://github.com/$GITHUB_USER/$REPO_NAME"
fi
echo ""
echo "Next steps:"
echo "1. Set up environment variables in Vercel/Netlify"
echo "2. Deploy smart contracts to PreProd testnet"
echo "3. Update .env.local with contract addresses"
echo ""

