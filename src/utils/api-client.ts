/**
 * Client-side API helper
 * Can be imported in Astro script tags
 */

/**
 * Get API base URL for client-side use
 * - If PUBLIC_API_URL is set, use it
 * - Otherwise, use proxy endpoint for relative paths
 */
export function getClientApiUrl(): string {
	const apiUrl = import.meta.env.PUBLIC_API_URL;
	
	// If API URL is explicitly set, use it
	if (apiUrl) {
		return apiUrl;
	}
	
	// Default to dashboard.paxeer.app for production
	// Or use proxy endpoint for relative paths
	if (typeof window !== 'undefined') {
		// Check if we're on the same domain (use proxy)
		if (window.location.hostname === 'localhost' || window.location.hostname.includes('vercel.app')) {
			return '/api/proxy';
		}
	}
	
	// Default to dashboard.paxeer.app
	return 'https://dashboard.paxeer.app';
}

/**
 * Build full API endpoint URL
 */
export function buildApiEndpoint(path: string): string {
	const baseUrl = getClientApiUrl();
	
	// If using proxy (relative path), construct proxy URL
	if (baseUrl.startsWith('/')) {
		return `${baseUrl}/${path}`;
	}
	
	// Otherwise, construct full API URL
	if (path.startsWith('/')) {
		return `${baseUrl}${path}`;
	}
	
	return `${baseUrl}/api/v1/${path}`;
}

