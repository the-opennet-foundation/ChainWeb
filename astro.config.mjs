import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: vercel({
		webAnalytics: {
			enabled: true,
		},
	}),
	vite: {
		server: {
			watch: {
				usePolling: true,
			},
			proxy: {
				'/api': {
					target: process.env.PUBLIC_API_URL || 'https://dashboard.paxeer.app',
					changeOrigin: true,
					secure: true,
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
