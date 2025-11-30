# Fixing 500 Errors in Next.js Dev Server

## Understanding the Errors

### 1. Eternl Wallet Extension Warnings (Harmless)
```
initEternlDomAPI: domId ...
initEternlDomAPI: href ...
```
**Status**: ✅ **HARMLESS** - These are just informational logs from the Eternl wallet browser extension. They don't affect functionality.

### 2. 500 Errors for Webpack Files (Needs Fix)
```
Failed to load resource: webpack.js (500)
Failed to load resource: main.js (500)
Failed to load resource: react-refresh.js (500)
Failed to load resource: _app.js (500)
Failed to load resource: _error.js (500)
```
**Status**: ❌ **NEEDS FIX** - These indicate Next.js dev server issues.

## Quick Fix

### Step 1: Stop Dev Server
```bash
# Press Ctrl+C in the terminal running npm run dev
# Or kill the process:
pkill -f "next dev"
```

### Step 2: Clear Cache
```bash
# Remove Next.js build cache
rm -rf .next

# Optional: Clear node_modules cache
rm -rf node_modules/.cache
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

## Automated Fix Script

Run the provided script:
```bash
./scripts/fix-dev-server.sh
```

Or manually:
```bash
# Stop server
pkill -f "next dev"

# Clear cache
rm -rf .next

# Restart
npm run dev
```

## Root Causes

1. **Corrupted Build Cache**: The `.next` folder can get corrupted during development
2. **Port Conflicts**: Another process might be using port 3000
3. **File System Issues**: Sometimes file watchers get stuck
4. **Memory Issues**: Large builds can cause memory problems

## Prevention

1. **Regular Cache Clearing**: Clear `.next` folder if you see persistent errors
2. **Proper Shutdown**: Always use Ctrl+C to stop the dev server
3. **Check Ports**: Make sure port 3000 is free before starting
4. **Update Dependencies**: Keep Next.js and React updated

## Verification

After fixing, verify:
- ✅ No 500 errors in browser console
- ✅ Pages load correctly
- ✅ Hot reload works
- ✅ Build completes successfully

## Still Having Issues?

1. Check server logs in terminal for specific errors
2. Try a different port: `npm run dev -- -p 3001`
3. Check for TypeScript errors: `npm run build`
4. Verify all dependencies: `npm install`
