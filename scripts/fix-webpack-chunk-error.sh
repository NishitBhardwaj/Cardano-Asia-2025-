#!/bin/bash
# Fix Webpack Chunk Error Script
# This script fixes the "Cannot find module './vendor-chunks/next.js'" error

echo "=== Fixing Webpack Chunk Error ==="
echo ""

# Step 1: Stop all Next.js processes
echo "Step 1: Stopping all Next.js processes..."
pkill -f "next" || echo "No Next.js processes found"
sleep 2

# Step 2: Clear all caches
echo "Step 2: Clearing all caches..."
rm -rf .next
rm -rf node_modules/.cache
npm cache clean --force
echo "✅ Caches cleared"

# Step 3: Verify node_modules
echo "Step 3: Verifying node_modules..."
if [ ! -d "node_modules" ]; then
    echo "⚠️ node_modules missing, installing..."
    npm install
else
    echo "✅ node_modules exists"
fi

# Step 4: Rebuild
echo "Step 4: Rebuilding project..."
npm run build

echo ""
echo "✅ Fix complete! Now run: npm run dev"
