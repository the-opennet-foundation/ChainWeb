/**
 * API Utility Functions
 * Centralized API configuration for client-side and server-side calls
 */

/**
 * Get the API base URL
 * - In browser: Uses relative path to proxy endpoint or PUBLIC_API_URL
 * - On server: Uses PUBLIC_API_URL or defaults to dashboard.paxeer.app
 */
export function getApiUrl(): string {
	// Check if we're in the browser
	if (typeof window !== 'undefined') {
		// Client-side: Use relative path to proxy or direct URL
		const apiUrl = import.meta.env.PUBLIC_API_URL;
		if (apiUrl) {
			return apiUrl;
		}
		// If no API URL set, use proxy endpoint
		return '/api/proxy';
	}
	
	// Server-side: Use environment variable or default
	return import.meta.env.PUBLIC_API_URL || 'https://dashboard.paxeer.app';
}

/**
 * Build API endpoint URL
 * @param path - API path (e.g., 'quotes/btcusd' or 'categories/crypto/markets')
 * @param useProxy - Whether to use the proxy endpoint (default: true for client-side)
 */
export function buildApiUrl(path: string, useProxy: boolean = true): string {
	const baseUrl = getApiUrl();
	
	// If using proxy and we have a relative path, use proxy endpoint
	if (useProxy && baseUrl.startsWith('/')) {
		return `${baseUrl}/${path}`;
	}
	
	// Otherwise, construct full URL
	if (path.startsWith('/')) {
		return `${baseUrl}${path}`;
	}
	return `${baseUrl}/api/v1/${path}`;
}

/**
 * Fetch from API with error handling
 */
export async function fetchApi<T = any>(
	path: string,
	options?: RequestInit
): Promise<T> {
	const url = buildApiUrl(path);
	
	try {
		const response = await fetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options?.headers,
			},
		});

		if (!response.ok) {
			throw new Error(`API request failed: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`API fetch error for ${path}:`, error);
		throw error;
	}
}

