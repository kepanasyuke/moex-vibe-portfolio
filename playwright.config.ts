import { defineConfig, devices } from "@playwright/test";

const node = process.execPath;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:5107",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: `"${node}" node_modules/tsx/dist/cli.mjs projects/07-calculator/server/index.ts`,
      url: "http://127.0.0.1:4107/api/health",
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: `"${node}" ../../node_modules/vite/bin/vite.js`,
      cwd: "projects/07-calculator",
      url: "http://127.0.0.1:5107",
      reuseExistingServer: true,
      timeout: 90_000,
    },
  ],
});
