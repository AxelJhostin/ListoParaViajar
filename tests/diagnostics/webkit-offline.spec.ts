import { test } from "@playwright/test";
test("minimal service worker without app code", async ({ page, context }) => {
  await context.route("**/qa-probe.html", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: '<h1>Probe</h1><script>navigator.serviceWorker.register("/qa-worker.js")</script>',
    }),
  );
  await context.route("**/qa-worker.js", (r) =>
    r.fulfill({
      contentType: "application/javascript",
      body: 'self.addEventListener("install",()=>self.skipWaiting());self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));self.addEventListener("fetch",e=>{e.respondWith(new Response("<h1>Offline response</h1>",{headers:{"Content-Type":"text/html"}}))});',
    }),
  );
  await page.goto("/qa-probe.html");
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.unrouteAll();
  await context.setOffline(true);
  await page.goto("/qa-probe.html");
});
test("diagnose cache navigation", async ({ page, context }) => {
  page.on("console", (m) => {
    if (m.type() === "error") console.log("CONSOLE", m.text());
  });
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  console.log(
    "CACHE",
    await page.evaluate(async () => {
      const keys = await caches.keys(),
        cache = await caches.open(keys[0]);
      const response = await cache.match("/gastos");
      return {
        keys,
        status: response?.status,
        headers: response && [...response.headers],
        length: (await response?.text())?.length,
      };
    }),
  );
  await context.setOffline(true);
  console.log(
    "FETCH",
    await page.evaluate(() =>
      fetch("/gastos")
        .then(async (r) => ({
          status: r.status,
          length: (await r.text()).length,
        }))
        .catch((e) => String(e)),
    ),
  );
  await page.goto("/gastos");
});
