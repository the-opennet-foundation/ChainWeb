export const prerender = false;

const API_BASE_URL = "https://scan.paxeer.app";

export async function GET({ params, url, request }: { params: { path?: string[] }; url: URL; request: Request }) {
	try {
		const pathArray = params.path || [];
		const apiPath = pathArray.join("/");
		const queryString = url.search;
		const targetUrl = `${API_BASE_URL}/${apiPath}${queryString ? `?${queryString}` : ""}`;

		const response = await fetch(targetUrl, {
			method: "GET",
			headers: {
				accept: "application/json",
				"User-Agent": request.headers.get("User-Agent") || "Chainflow-Trading",
			},
		});

		const data = await response.json();

		return new Response(JSON.stringify(data), {
			status: response.status,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
			},
		});
	} catch (error: any) {
		console.error("Paxeer proxy error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to fetch Paxeer data", message: error.message }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
