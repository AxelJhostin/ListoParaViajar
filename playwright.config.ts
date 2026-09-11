import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
const qaEnv = config({
  path: ".env.e2e.local",
  quiet: true,
  processEnv: {},
}).parsed;
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:3000", trace: "retain-on-failure" },
  projects: [
    { name: "chromium-mobile", use: { ...devices["Pixel 7"] } },
    { name: "webkit-mobile", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "npm run start",
    env: {
      DATABASE_URL: qaEnv?.DATABASE_URL || "",
      DATABASE_URL_UNPOOLED: qaEnv?.DATABASE_URL_UNPOOLED || "",
    },
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
