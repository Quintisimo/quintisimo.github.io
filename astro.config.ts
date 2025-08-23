import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import unocss from "unocss/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://quintuscardozo.dev",
  markdown: {
    shikiConfig: {
      theme: "vitesse-dark",
    },
  },
  integrations: [
    sitemap(),
    unocss({
      injectReset: true,
    }),
  ],
});
