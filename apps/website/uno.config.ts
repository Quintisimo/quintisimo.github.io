import transformDirectives from "@unocss/transformer-directives";
import { defineConfig, presetIcons, presetWebFonts, presetWind3 } from "unocss";

export default defineConfig({
  transformers: [transformDirectives()],
  presets: [
    presetWind3(),
    presetWebFonts({
      provider: "google",
      fonts: {
        mono: ["Space Mono"],
      },
    }),
    presetIcons(),
  ],
});
