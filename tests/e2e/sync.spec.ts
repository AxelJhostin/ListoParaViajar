import { test, expect } from "@playwright/test";
import { mockCloud } from "./mock-cloud";
test.use({ serviceWorkers: "block" });

test("isolated devices exchange records, resolve conflicts and propagate deletions", async ({
  browser,
  context,
  page,
}) => {
  const cloud = mockCloud();
  const second = await browser.newContext({ serviceWorkers: "block" });
  try {
    await cloud.install(context);
    await cloud.install(second);
    const other = await second.newPage();
    await page.goto("/info");
    await other.goto("http://127.0.0.1:3000/info");
    for (const p of [page, other]) {
      await expect(
        p.getByRole("link", { name: "Sincronizado", exact: true }),
      ).toBeVisible();
      await p
        .getByRole("button", { name: "Editar Notas del viaje", exact: true })
        .click();
    }
    await page
      .getByLabel("Información", { exact: true })
      .fill("Cambio de Axel");
    await page
      .getByRole("button", { name: "Guardar cambios", exact: true })
      .click();
    await page.getByRole("button", { name: "Listo", exact: true }).click();
    await expect(
      page.getByRole("link", { name: "Sincronizado", exact: true }),
    ).toBeVisible();
    await other
      .getByLabel("Información", { exact: true })
      .fill("Cambio de Sebastián");
    await other
      .getByRole("button", { name: "Guardar cambios", exact: true })
      .click();
    await other.getByRole("button", { name: "Listo", exact: true }).click();
    await other.goto("http://127.0.0.1:3000/ajustes");
    await expect(
      other.getByRole("heading", { name: "Revisar cambios: Notas del viaje" }),
    ).toBeVisible();
    await other.getByText("Comparar versiones", { exact: true }).click();
    await expect(other.locator("pre").first()).toContainText(
      "Cambio de Sebastián",
    );
    await expect(other.locator("pre").last()).toContainText("Cambio de Axel");
    await other
      .getByRole("button", { name: "Conservar mi cambio", exact: true })
      .click();
    await expect(
      other.getByText("0 cambios pendientes", { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByText("Cambio de Sebastián", { exact: true }),
    ).toBeVisible();
    page.once("dialog", (dialog) => dialog.accept());
    await page
      .getByRole("button", { name: "Eliminar Notas del viaje", exact: true })
      .click();
    await expect(
      page.getByRole("link", { name: "Sincronizado", exact: true }),
    ).toBeVisible();
    await other.goto("http://127.0.0.1:3000/info");
    await expect(
      other.getByRole("heading", { name: "Notas del viaje", exact: true }),
    ).toHaveCount(0);
  } finally {
    await second.close();
  }
});

test("API rejects malformed, oversized and cross-origin writes", async ({
  request,
}) => {
  expect(
    (
      await request.post("/api/sync", {
        data: {},
        headers: { Origin: "http://127.0.0.1:3000" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/sync", {
        data: "not json",
        headers: { "Content-Type": "application/json" },
      })
    ).status(),
  ).toBe(400);
  expect((await request.post("/api/sync", { data: {} })).status()).toBe(400);
  expect(
    (await request.post("/api/sync", { data: "x".repeat(33000) })).status(),
  ).toBe(413);
  expect(
    (
      await request.post("/api/sync", {
        data: {},
        headers: { Origin: "https://example.invalid" },
      })
    ).status(),
  ).toBe(403);
});
