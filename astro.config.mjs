import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import node from "@astrojs/node";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: node({
		mode: 'standalone',
	}),
	experimental: {
		session: true,
	},
	vite: {
		server: {
			watch: {
				usePolling: true,
			},
			proxy: {
				'/api': {
					target: 'http://localhost:3000',
					changeOrigin: true,
				},
			},
		},
	},
	site: "https://majestico.co",
	i18n: {
		defaultLocale: "en",
		locales: ["en", "it"],
	},
	markdown: {
		drafts: true,
		shikiConfig: {
			theme: "css-variables",
		},
	},
	shikiConfig: {
		wrap: true,
		skipInline: false,
		drafts: true,
	},
	integrations: [
		tailwind({
			applyBaseStyles: false,
		}),
		sitemap(),
		mdx(),
		icon(),
	],
});
