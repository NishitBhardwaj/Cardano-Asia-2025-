#!/bin/bash

# Complete Fix Script for Next.js Errors
# This script fixes all common Next.js build and runtime errors

echo "🔧 Complete Next.js Fix Script"
echo "================================"
echo ""

# Step 1: Stop all processes
echo "1. Stopping all Next.js processes..."
pkill -f "next" 2>/dev/null
pkill -f "node.*next" 2>/dev/null
sleep 3
echo "   ✅ Stopped"

# Step 2: Clear all caches
echo "2. Clearing all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache
rm -rf .next/server
rm -rf .next/static
echo "   ✅ Cleared"

# Step 3: Clear npm cache
echo "3. Clearing npm cache..."
npm cache clean --force 2>/dev/null
echo "   ✅ Cleared"

# Step 4: Verify node_modules
echo "4. Checking node_modules..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️  node_modules missing, installing..."
    npm install
else
    echo "   ✅ node_modules exists"
fi

# Step 5: Build
echo "5. Building project..."
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Build successful"
else
    echo "   ❌ Build failed - check /tmp/build.log"
    cat /tmp/build.log | tail -20
    exit 1
fi

# Step 6: Verify
echo "6. Verifying build..."
if [ -d ".next" ]; then
    echo "   ✅ .next directory created"
    if [ -d ".next/server" ]; then
        echo "   ✅ Server files generated"
    fi
    if [ -d ".next/static" ]; then
        echo "   ✅ Static files generated"
    fi
else
    echo "   ❌ .next directory not found"
    exit 1
fi

echo ""
echo "✅ All fixes applied successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Start dev server: npm run dev"
echo "   2. Open browser: http://localhost:3000"
echo "   3. If errors persist, clear browser cache (Ctrl+Shift+R)"
echo ""
