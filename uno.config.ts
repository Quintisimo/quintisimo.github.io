import { defineConfig, presetUno, presetWebFonts, presetIcons } from "unocss";
import transformDirectives from "@unocss/transformer-directives";

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
