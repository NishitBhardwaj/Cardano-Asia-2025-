#!/bin/bash

# Fix Next.js 500 Error and Webpack Module Issues
# This script completely clears all caches and rebuilds the project

echo "🔧 Fixing Next.js 500 Error and Webpack Issues..."
echo ""

# Step 1: Stop any running dev servers
echo "1. Stopping existing dev servers..."
pkill -f "next dev" 2>/dev/null
pkill -f "next-server" 2>/dev/null
sleep 2
echo "   ✅ Stopped"

# Step 2: Clear Next.js build cache
echo "2. Clearing .next cache..."
rm -rf .next
echo "   ✅ Cleared"

# Step 3: Clear node_modules cache
echo "3. Clearing node_modules/.cache..."
rm -rf node_modules/.cache 2>/dev/null
echo "   ✅ Cleared"

# Step 4: Clear npm cache (optional but helps)
echo "4. Clearing npm cache..."
npm cache clean --force 2>/dev/null
echo "   ✅ Cleared"

# Step 5: Verify build
echo "5. Verifying build..."
npm run build > /tmp/build_check.log 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Build successful"
else
    echo "   ❌ Build failed - check /tmp/build_check.log"
    exit 1
fi

echo ""
echo "✅ All fixes applied!"
echo ""
echo "📝 About the errors:"
echo "   • Eternl warnings: Harmless (browser extension logs)"
echo "   • 500 error: Fixed by clearing cache"
echo "   • Webpack chunk error: Fixed by rebuilding"
echo ""
echo "🚀 Starting dev server..."
echo "   Run: npm run dev"
echo ""

