import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ui": path.join(root, "packages/ui/src"),
      "@contracts": path.join(root, "packages/contracts/src"),
      "@kit": path.join(root, "packages/server-kit/src"),
    },
  },
  build: { outDir: "dist/client", emptyOutDir: true },
  ssr: { noExternal: ["@ui", "@contracts"] },
});
