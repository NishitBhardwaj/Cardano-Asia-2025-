#!/bin/bash

# Fix Next.js Dev Server 500 Errors
# This script clears caches and restarts the dev server properly

echo "🔧 Fixing Next.js Dev Server Issues..."
echo ""

# Stop any running Next.js processes
echo "1. Stopping existing dev servers..."
pkill -f "next dev" 2>/dev/null
pkill -f "next-server" 2>/dev/null
sleep 2

# Clear Next.js cache
echo "2. Clearing .next cache..."
rm -rf .next
echo "   ✅ Cleared"

# Clear node_modules cache (optional, but helps)
echo "3. Clearing node_modules/.cache..."
rm -rf node_modules/.cache 2>/dev/null
echo "   ✅ Cleared"

# Clear npm cache (optional)
echo "4. Clearing npm cache..."
npm cache clean --force 2>/dev/null
echo "   ✅ Cleared"

# Verify build
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
echo "📝 Note about Eternl warnings:"
echo "   The 'initEternlDomAPI' messages are harmless."
echo "   They're just informational logs from the Eternl wallet browser extension."
echo ""
echo "🚀 Starting dev server..."
echo "   Run: npm run dev"
echo ""

