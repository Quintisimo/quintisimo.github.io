import transformDirectives from "@unocss/transformer-directives";
import { defineConfig, presetIcons, presetUno, presetWebFonts } from "unocss";

export default defineConfig({
  transformers: [transformDirectives()],
  presets: [
    presetUno(),
    presetWebFonts({
      provider: "google",
      fonts: {
        mono: ["Space Mono"],
      },
    }),
    presetIcons(),
  ],
});
