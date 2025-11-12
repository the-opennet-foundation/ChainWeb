import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			pubDate: z.date(),
			description: z.string(),
			link: z.optional(z.string()),
			video: z.optional(z.string()),
			author: z.object({
				name: z.string(),
				link: z.string(),
			}),
			image: z.optional(z.object({
				source: z.union([image(), z.string()]),
				alt: z.string(),
			})),
			tags: z.array(z.string()),
		}),
});

const projectsCollection = defineCollection({
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			pubDate: z.date(),
			description: z.string(),
			link: z.string(),
			author: z.object({
				name: z.string(),
				link: z.string(),
			}),
			order: z.number(),
			video: z.optional(z.string()),
			image: z.optional(
				z.object({
					source: image(),
					alt: z.string(),
				}),
			),
			tags: z.optional(z.array(z.string())),
		}),
});

const authorsCollection = defineCollection({
	schema: ({ image }) =>
		z.object({
			name: z.string(),
			description: z.string(),
			image: z.object({
				source: image(),
				alt: z.string(),
			}),
		}),
});

export const collections = {
	posts: postsCollection,
	projects: projectsCollection,
	authors: authorsCollection,
};
