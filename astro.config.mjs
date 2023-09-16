import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon'

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap(), tailwind(), icon({
		include: {
			"material-symbols": ["*"]
		}
	})],
});
