import { expect, it, afterEach, vi } from "vitest";
import { hasSameOrigin } from "@/server/request-origin";
afterEach(() => vi.unstubAllEnvs());
it("accepts the browser's public Host when Next uses an internal URL", () => {
  const request = new Request("http://localhost:3000/api/sync", {
    headers: { Host: "127.0.0.1:3000", Origin: "http://127.0.0.1:3000" },
  });
  expect(hasSameOrigin(request)).toBe(true);
});
it("rejects cross-origin browser writes", () => {
  expect(
    hasSameOrigin(
      new Request("http://localhost:3000/api/sync", {
        headers: { Host: "localhost:3000", Origin: "https://other.example" },
      }),
    ),
  ).toBe(false);
});
it("uses the HTTPS public origin on Vercel", () => {
  vi.stubEnv("VERCEL", "1");
  expect(
    hasSameOrigin(
      new Request("http://internal/api/sync", {
        headers: { Host: "trip.example", Origin: "https://trip.example" },
      }),
    ),
  ).toBe(true);
});
