import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@ui": path.join(root, "packages/ui/src"),
      "@contracts": path.join(root, "packages/contracts/src"),
      "@kit": path.join(root, "packages/server-kit/src"),
    },
  },
  test: {
    include: ["packages/**/*.test.ts", "projects/**/*.test.ts"],
    environment: "node",
    testTimeout: 20_000,
  },
});
