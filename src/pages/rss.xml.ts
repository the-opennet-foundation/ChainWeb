import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context: any) {
	const blog = await getCollection("posts");
	return rss({
		title: "Majestico's Blog",
		description: "A humble Astronaut's guide to the stars",
		site: context.site,
		items: blog.map((post) => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description,
			// Compute RSS link from post `slug`
			link: `/blog/${post.slug}/`,
		})),
	});
}
