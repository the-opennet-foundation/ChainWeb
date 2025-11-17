# Deployment Configuration 

## Changes Made for Vercel Deployment

### 1. Updated Astro Configuration (`astro.config.mjs`)
- ✅ Replaced `@astrojs/node` adapter with `@astrojs/vercel/serverless`
- ✅ Updated Vite proxy to use `dashboard.paxeer.app` as default target
- ✅ Configured for serverless deployment on Vercel

### 2. Updated Package Dependencies (`package.json`)
- ✅ Removed `@astrojs/node` dependency
- ✅ Added `@astrojs/vercel` dependency

### 3. Created API Proxy Endpoint (`src/pages/api/proxy/[...path].ts`)
- ✅ Server-side proxy endpoint that forwards requests to `dashboard.paxeer.app`
- ✅ Handles GET and POST requests
- ✅ Includes error handling and caching headers
- ✅ Avoids CORS issues by proxying through server

### 4. Created Utility Files
- ✅ `src/utils/api.ts` - Server-side API utilities
- ✅ `src/utils/api-client.ts` - Client-side API utilities

### 5. Updated Components to Use New API Configuration
- ✅ `src/components/trading/PriceCards.astro`
- ✅ `src/components/trading/LiveTicker.astro`
- ✅ `src/components/trading/StocksIndices.astro`
- ✅ `src/components/trading/TradingStats.astro`
- ✅ `src/pages/symbol/[symbol].astro`
- ✅ `src/pages/markets/[category].astro`

All components now:
- Use `PUBLIC_API_URL` environment variable if set
- Fall back to proxy endpoint (`/api/proxy`) for localhost
- Default to `https://dashboard.paxeer.app` for production

### 6. Created Vercel Configuration (`vercel.json`)
- ✅ Build and deployment settings
- ✅ Security headers configuration
- ✅ API route rewrites

## How It Works

### Client-Side API Calls

**Option 1: Direct API Calls**
- Set `PUBLIC_API_URL=https://dashboard.paxeer.app` in Vercel environment variables
- Client makes direct requests to `dashboard.paxeer.app/api/v1/*`

**Option 2: Proxy Endpoint (Recommended)**
- Leave `PUBLIC_API_URL` unset
- Client makes requests to `/api/proxy/*`
- Server proxies to `dashboard.paxeer.app/api/v1/*`
- Benefits: No CORS issues, better caching, server-side control

### Example API Calls

```javascript
// Direct call (if PUBLIC_API_URL is set)
fetch('https://dashboard.paxeer.app/api/v1/quotes?symbols=btcusd')

// Proxy call (if PUBLIC_API_URL is not set)
fetch('/api/proxy/quotes?symbols=btcusd')
// This proxies to: https://dashboard.paxeer.app/api/v1/quotes?symbols=btcusd
```

## Next Steps

1. **Install Dependencies:**
   ```bash
   cd /root/Chainflow-Trading
   npm install
   ```

2. **Set Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Optionally set `PUBLIC_API_URL=https://dashboard.paxeer.app`
   - Or leave it empty to use the proxy endpoint

3. **Deploy to Vercel:**
   ```bash
   vercel
   ```
   Or connect your GitHub repository for automatic deployments

4. **Test the Deployment:**
   - Verify API calls work correctly
   - Check that data is being fetched from `dashboard.paxeer.app`
   - Test both direct and proxy methods

## Files Modified

- `astro.config.mjs` - Vercel adapter configuration
- `package.json` - Updated dependencies
- `src/pages/api/proxy/[...path].ts` - New proxy endpoint
- `src/utils/api.ts` - New utility file
- `src/utils/api-client.ts` - New utility file
- `src/components/trading/*.astro` - Updated API URLs
- `src/pages/symbol/[symbol].astro` - Updated API URL
- `src/pages/markets/[category].astro` - Updated API URL
- `vercel.json` - New Vercel configuration

## Files Created

- `src/pages/api/proxy/[...path].ts` - API proxy endpoint
- `src/utils/api.ts` - Server-side API utilities
- `src/utils/api-client.ts` - Client-side API utilities
- `vercel.json` - Vercel configuration
- `VERCEL_DEPLOYMENT.md` - Deployment guide
- `DEPLOYMENT_SUMMARY.md` - This file

