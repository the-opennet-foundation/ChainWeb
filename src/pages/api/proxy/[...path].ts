/**
 * API Proxy Endpoint
 * Proxies requests to dashboard.paxeer.app API
 * This allows server-side API calls to avoid CORS issues
 */

export const prerender = false;

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://dashboard.paxeer.app';

export async function GET({ params, url, request }: { params: { path?: string[] }, url: URL, request: Request }) {
	try {
		// Reconstruct the API path
		const pathArray = params.path || [];
		const apiPath = pathArray.join('/');
		const queryString = url.search;
		const targetUrl = `${API_BASE_URL}/api/v1/${apiPath}${queryString ? `?${queryString}` : ''}`;

		// Forward the request
		const response = await fetch(targetUrl, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': request.headers.get('User-Agent') || 'Chainflow-Trading',
			},
		});

		const data = await response.json();

		return new Response(JSON.stringify(data), {
			status: response.status,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=59',
			},
		});
	} catch (error: any) {
		console.error('API Proxy Error:', error);
		return new Response(
			JSON.stringify({ error: 'Failed to fetch data', message: error.message }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}

export async function POST({ params, url, request }: { params: { path?: string[] }, url: URL, request: Request }) {
	try {
		const pathArray = params.path || [];
		const apiPath = pathArray.join('/');
		const queryString = url.search;
		const targetUrl = `${API_BASE_URL}/api/v1/${apiPath}${queryString ? `?${queryString}` : ''}`;
		const body = await request.text();

		const response = await fetch(targetUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': request.headers.get('User-Agent') || 'Chainflow-Trading',
			},
			body: body || undefined,
		});

		const data = await response.json();

		return new Response(JSON.stringify(data), {
			status: response.status,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error: any) {
		console.error('API Proxy Error:', error);
		return new Response(
			JSON.stringify({ error: 'Failed to fetch data', message: error.message }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}

