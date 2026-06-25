import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/indego-mower-card.js",
      name: "IndegoMowerCard",
      formats: ["es"],
      fileName: () => "indego-mower-card.js"
    },
    outDir: "dist",
    emptyOutDir: true
  }
});
