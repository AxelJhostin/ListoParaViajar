import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  testDir: "./tests/diagnostics",
  outputDir: "./qa-artifacts/diagnostics",
  reporter: "list",
  projects: base.projects?.filter(
    (project) => project.name === "webkit-mobile",
  ),
});
