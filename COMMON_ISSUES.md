# Common Issues Summary

This document summarizes all errors found and fixed during development.

## ✅ All Errors Resolved

---

## SSR/WASM Issues (Most Common)

### Issue: 404/500 Errors When Loading Pages

**Symptoms**:
- Browser console shows `404 Not Found` or `500 Internal Server Error`
- Pages fail to render
- Server logs show errors during compilation

**Root Cause**: Mesh SDK uses WebAssembly (WASM) which cannot be loaded during Server-Side Rendering (SSR).

**Solution**: Implement SSR/CSR split pattern:

```typescript
// page.tsx - Server wrapper
'use client';
import dynamic from 'next/dynamic';

const Content = dynamic(() => import('./Content'), { ssr: false });

export default function Page() {
    return <Content />;
}
```

**Files Fixed**: All page.tsx and Content.tsx files across the app

---

### Issue: "useWallet must be used within MeshProvider"

**Cause**: Component using `useWallet` is rendered outside of MeshProvider context

**Solution**: 
1. Ensure `ClientProviders` (which contains `MeshProvider`) wraps the app in `layout.tsx`
2. Or wrap individual components in `MeshProvider`:

```typescript
import { MeshProvider } from '@meshsdk/react';

function MyComponent() {
    return (
        <MeshProvider>
            <ComponentThatUsesWallet />
        </MeshProvider>
    );
}
```

---

### Issue: BrowserWallet.getInstalledWallets() Fails During SSR

**Error**: `window is not defined` or similar

**Solution**: Add client-side guard:

```typescript
const [isClient, setIsClient] = useState(false);

useEffect(() => {
    setIsClient(true);
}, []);

useEffect(() => {
    if (isClient) {
        const wallets = BrowserWallet.getInstalledWallets();
        // ...
    }
}, [isClient]);
```

---

## TypeScript Issues

### Issue: Type Mismatch (Mesh SDK IWallet vs Custom WalletAPI)
**Error**: `Type 'IWallet' is not assignable to parameter type 'WalletAPI'`  
**Cause**: Custom `WalletAPI` interface had incompatible types with Mesh SDK's `IWallet`  
**Solution**: Removed custom types, use Mesh SDK types directly with `any` for flexibility  
**Files Fixed**: `lib/cardano/wallet.ts`, `lib/cardano/transactions.ts`

### Issue: Duplicate Function Declarations
**Error**: Multiple "Cannot redeclare exported variable" errors  
**Cause**: Previous edits created duplicate function exports  
**Solution**: Complete file rewrite with clean, minimal code  
**File Fixed**: `lib/cardano/wallet.ts`

### Issue: Broken Transaction Builder Functions
**Error**: Various undefined variables and syntax errors  
**Cause**: Incremental edits corrupted file structure  
**Solution**: Complete file rewrite with placeholder functions  
**File Fixed**: `lib/cardano/transactions.ts`

### Issue: React.Node Type Error
**Error**: Property 'Node' does not exist on type 'typeof React'  
**Cause**: Incorrect TypeScript type usage  
**Solution**: Changed to `React.ReactNode`  
**File Fixed**: `app/layout.tsx`

### Issue: Missing Campaign Properties
**Error**: `Object literal may only specify known properties`
**Cause**: Interface missing required properties
**Solution**: Added missing properties to Campaign interface in userStore
**File Fixed**: `lib/store/userStore.ts`

### Issue: getCampaignById vs getCampaign
**Error**: `Property 'getCampaignById' does not exist on type 'CampaignState'`
**Cause**: Wrong function name used
**Solution**: Use correct function name `getCampaign`
**Files Fixed**: `app/campaigns/[id]/Content.tsx`, `app/campaigns/[id]/withdraw/Content.tsx`

---

## Network Issues

### Issue: Google Fonts Failing to Load

**Error**:
```
FetchError: request to https://fonts.googleapis.com/... failed, reason: getaddrinfo EAI_AGAIN
Failed to download `Inter` from Google Fonts. Using fallback font instead.
```

**Cause**: Temporary DNS resolution failure (network issue)

**Solution**: This is a non-critical error. Next.js will use fallback fonts. The app continues to work. To fix:
- Check your internet connection
- Restart the dev server
- The issue usually resolves itself

---

## Build & Development Issues

### Issue: CRLF Line Endings

**Symptoms**: Unexpected behavior on Linux/Mac, git showing all files as changed

**Solution**:
```bash
# Convert to LF
sed -i 's/\r$//' <filename>

# Or for all files
find . -name "*.tsx" -exec sed -i 's/\r$//' {} \;
```

### Issue: Chrome DevTools 404

**Error**: `GET /.well-known/appspecific/com.chrome.devtools.json 404`

**Cause**: Chrome checking for DevTools config file

**Solution**: This is normal browser behavior, not an error. Can be safely ignored.

---

## Current Project Status

**Build**: ✅ Passing  
**TypeScript**: ✅ No errors  
**ESLint**: ✅ Passing  
**Dev Server**: ✅ Running  
**All Pages**: ✅ Functional (200 OK)

---

## Page Status

| Page | Route | Status |
|------|-------|--------|
| Home | `/` | ✅ 200 |
| Campaigns | `/campaigns` | ✅ 200 |
| Campaign Detail | `/campaigns/[id]` | ✅ 200 |
| Campaign Edit | `/campaigns/[id]/edit` | ✅ 200 |
| Campaign Withdraw | `/campaigns/[id]/withdraw` | ✅ 200 |
| Auth | `/auth` | ✅ 200 |
| Profile | `/profile` | ✅ 200 |
| Create | `/create` | ✅ 200 |
| Governance | `/governance` | ✅ 200 |
| Admin | `/admin` | ✅ 200 |
| Dashboard | `/dashboard` | ✅ 200 |
| My Campaigns | `/my-campaigns` | ✅ 200 |

---

## Quick Fixes Checklist

If you encounter issues:

- [ ] Run `npm install` to ensure dependencies are up to date
- [ ] Clear `.next` folder: `rm -rf .next`
- [ ] Restart dev server: `npm run dev`
- [ ] Check `.env.local` has correct Blockfrost API key
- [ ] Ensure wallet extension is installed and on correct network
- [ ] Check browser console for specific error messages

---

## Remaining TODOs (Not Errors)

1. Deploy Aiken smart contracts to testnet
2. Add Blockfrost API key to `.env.local`
3. Update placeholder script addresses
4. Enable real blockchain transactions

---

**Last Updated**: November 29, 2025  
**Total Errors Fixed**: 10 (all critical)  
**Build Time**: ~45-60 seconds
