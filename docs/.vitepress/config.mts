import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default withMermaid(
	defineConfig({
		title: "Obsidian TTRPG UI Toolkit",
		description: "Modern UI elements for playing TTRPG in Obsidian",
		base: "/obsidian-ttrpg-ui-toolkit/",
		themeConfig: {
			// https://vitepress.dev/reference/default-theme-config
			search: {
				provider: "local",
			},
			nav: [
				{ text: "Home", link: "/" },
				{ text: "Docs", link: "/getting-started/quick-start" },
			],

			sidebar: [
				{
					text: "Getting Started",
					items: [
						{ text: "Quick Start", link: "/getting-started/quick-start" },
					],
				},
				{
					text: "Features",
					items: [
						{ text: "Dice Roller Popup", link: "/features/dice-roller-popup" },
						{ text: "Inline Dice (Post Processor)", link: "/features/dice-post-processor" },
						{ text: "Codeblock Views", link: "/features/codeblock-views" },
					],
				},
			],

			socialLinks: [{ icon: "github", link: "https://github.com/aaronbarnaby/obsidian-ttrpg-ui-toolkit" }],
		},
		vite: {
			optimizeDeps: {
				include: ["@braintree/sanitize-url"],
			},
			resolve: {
				alias: {
					dayjs: "dayjs/",
				},
			},
		},
		mermaid: {
			// Optional: Configure Mermaid theme options
			theme: "default",
		},
	})
);
