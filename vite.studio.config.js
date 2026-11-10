import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "node:path";

// Portable single-file build of the dev studio (data baked in at build time).
// Output: dist-studio/concept-studio.html — open anywhere, but note the live
// gate and graph sidecar need the dev server (`npm run dev`).
export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "dist-studio",
    target: "es2020",
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: resolve(__dirname, "concept-studio.html"),
    },
  },
});
