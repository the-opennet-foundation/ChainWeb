# Vercel Deployment Guide

This project is configured for deployment on Vercel with API proxying to `dashboard.paxeer.app`.
## Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Environment Variables

Set the following environment variable in Vercel:

- `PUBLIC_API_URL`: (Optional) The API base URL. If not set, the app will use the proxy endpoint or default to `https://dashboard.paxeer.app`

**In Vercel Dashboard:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `PUBLIC_API_URL` with value `https://dashboard.paxeer.app` (or leave empty to use proxy)

### 3. Deploy

```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## API Configuration

The application supports two methods for fetching data:

### Method 1: Direct API Calls (Client-side)
- Set `PUBLIC_API_URL=https://dashboard.paxeer.app` in environment variables
- Client-side code will make direct requests to `dashboard.paxeer.app`

### Method 2: Server-side Proxy (Recommended)
- Leave `PUBLIC_API_URL` unset or empty
- Client-side code will use `/api/proxy/*` endpoints
- Server-side proxy handles requests to `dashboard.paxeer.app`
- Avoids CORS issues and provides better caching

## API Proxy Endpoints

The proxy endpoint is available at `/api/proxy/*` and forwards requests to `dashboard.paxeer.app/api/v1/*`.

Example:
- Request: `/api/proxy/quotes?symbols=btcusd,ethusd`
- Proxies to: `https://dashboard.paxeer.app/api/v1/quotes?symbols=btcusd,ethusd`

## Development

For local development:

```bash
npm run dev
```

The Vite dev server is configured to proxy `/api/*` requests to the configured API URL.

## Build

```bash
npm run build
```

The build output will be in the `dist` directory, ready for Vercel deployment.

## Project Structure

- `src/pages/api/proxy/[...path].ts` - API proxy endpoint
- `src/utils/api.ts` - Server-side API utilities
- `src/utils/api-client.ts` - Client-side API utilities
- `vercel.json` - Vercel configuration
- `astro.config.mjs` - Astro configuration with Vercel adapter

## Notes

- The project uses Astro with Vercel serverless adapter
- All API calls are configured to work both client-side and server-side
- The proxy endpoint includes caching headers for better performance
- CORS is handled automatically when using the proxy endpoint

