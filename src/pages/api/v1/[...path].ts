export const prerender = false;

const API_BASE_URL =
	import.meta.env.PUBLIC_API_URL ||
	"https://melodious-motivation-production-b5d0.up.railway.app";

type RouteParams = {
	path?: string[];
};

type AstroApiContext = {
	params: RouteParams;
	url: URL;
	request: Request;
};

function buildTargetUrl(params: RouteParams, url: URL) {
	const pathArray = params.path || [];
	const apiPath = pathArray.join("/");
	const queryString = url.search;
	return `${API_BASE_URL}/api/v1/${apiPath}${queryString}`;
}

async function proxyRequest(request: Request, targetUrl: string) {
	const headers = new Headers(request.headers);
	headers.set("User-Agent", headers.get("User-Agent") || "ChainWeb");
	headers.delete("host");

	const response = await fetch(targetUrl, {
		method: request.method,
		headers,
		body:
			request.method === "GET" || request.method === "HEAD"
				? undefined
				: await request.arrayBuffer(),
	});

	const responseHeaders = new Headers(response.headers);
	// Keep caching conservative; quotes should be near-real-time.
	responseHeaders.set(
		"Cache-Control",
		"public, s-maxage=1, stale-while-revalidate=59"
	);
	responseHeaders.delete("content-encoding");

	return new Response(response.body, {
		status: response.status,
		headers: responseHeaders,
	});
}

export async function GET({ params, url, request }: AstroApiContext) {
	try {
		const targetUrl = buildTargetUrl(params, url);
		return await proxyRequest(request, targetUrl);
	} catch (error: any) {
		console.error("API v1 Proxy Error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to fetch data", message: error.message }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}

export async function POST({ params, url, request }: AstroApiContext) {
	try {
		const targetUrl = buildTargetUrl(params, url);
		return await proxyRequest(request, targetUrl);
	} catch (error: any) {
		console.error("API v1 Proxy Error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to fetch data", message: error.message }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}

export async function PUT({ params, url, request }: AstroApiContext) {
	try {
		const targetUrl = buildTargetUrl(params, url);
		return await proxyRequest(request, targetUrl);
	} catch (error: any) {
		console.error("API v1 Proxy Error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to fetch data", message: error.message }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}

export async function PATCH({ params, url, request }: AstroApiContext) {
	try {
		const targetUrl = buildTargetUrl(params, url);
		return await proxyRequest(request, targetUrl);
	} catch (error: any) {
		console.error("API v1 Proxy Error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to fetch data", message: error.message }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}

export async function DELETE({ params, url, request }: AstroApiContext) {
	try {
		const targetUrl = buildTargetUrl(params, url);
		return await proxyRequest(request, targetUrl);
	} catch (error: any) {
		console.error("API v1 Proxy Error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to fetch data", message: error.message }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}
