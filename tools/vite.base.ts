import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type UserConfig } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const alias = {
  "@ui": path.join(root, "packages/ui/src"),
  "@contracts": path.join(root, "packages/contracts/src"),
  "@kit": path.join(root, "packages/server-kit/src"),
};

export const makeWebConfig = (options: {
  port: number;
  apiPort: number;
}): UserConfig =>
  defineConfig({
    plugins: [react()],
    resolve: { alias },
    server: {
      port: options.port,
      strictPort: true,
      proxy: {
        "/api": {
          target: `http://127.0.0.1:${options.apiPort}`,
          changeOrigin: true,
        },
        "/ws": {
          target: `ws://127.0.0.1:${options.apiPort}`,
          ws: true,
        },
      },
    },
    preview: { port: options.port, strictPort: true },
    build: { outDir: "dist", emptyOutDir: true },
  });

export const makeSsrConfig = (options: {
  port: number;
  apiPort: number;
}): UserConfig =>
  defineConfig({
    plugins: [react()],
    resolve: { alias },
    build: { outDir: "dist/client", emptyOutDir: true },
    server: {
      port: options.port,
      strictPort: true,
      proxy: {
        "/api": {
          target: `http://127.0.0.1:${options.apiPort}`,
          changeOrigin: true,
        },
      },
    },
  });
