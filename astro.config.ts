import { defineConfig } from "astro/config";
import unocss from "unocss/astro";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://quintuscardozo.dev",
  markdown: {
    shikiConfig: {
      theme: "vitesse-dark",
    },
  },
  integrations: [
    mdx(),
    sitemap(),
    unocss({
      injectReset: true,
    }),
  ],
});
