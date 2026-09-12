import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { mockCloud } from "./mock-cloud";
import { defaults } from "../../src/domain/models";
test.use({ serviceWorkers: "block" });
let cloud: ReturnType<typeof mockCloud>;
test.beforeEach(async ({ context }) => {
  cloud = mockCloud();
  await cloud.install(context);
});
test("summary, routes and documents contain real context", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Hola, familia/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Más", exact: true }).click();
  await page.getByRole("link", { name: /Ruta y vuelos/ }).click();
  await expect(
    page.getByRole("heading", { name: "Bogotá → Toronto", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("CUENTA REGRESIVA").first()).toBeVisible();
  await expect(page.getByText(/Llegar al aeropuerto:/).first()).toBeVisible();
  await page.goto("/documentos");
  await expect(
    page.getByRole("heading", { name: "Pasaporte", exact: true }),
  ).toHaveCount(3);
});
test("expense persists on reload, edit works and report exports", async ({
  page,
}) => {
  await page.goto("/gastos");
  await page
    .getByRole("button", { name: "Registrar gasto", exact: true })
    .click();
  await page.getByLabel("Monto del gasto", { exact: true }).fill("12.50");
  await page.getByLabel("Concepto / lugar").fill("Café de prueba");
  await page
    .getByRole("button", { name: "Guardar gasto", exact: true })
    .click();
  await expect(
    page.getByText("Fotos y comprobantes", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Listo, volver a gastos" }).click();
  await page.reload();
  await expect(page.getByText("Café de prueba", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Café de prueba.*Comida/ }).click();
  await page.getByLabel("Monto del gasto", { exact: true }).fill("14.50");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  await page.getByRole("button", { name: "Listo, volver a gastos" }).click();
  await expect(
    page.getByText("14,50 CAD", { exact: true }).first(),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Descargar CSV/ }).click();
  expect((await download).suggestedFilename()).toContain(".csv");
});
test("converter works in both directions and manual rate", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir conversor CAD a USD" }).click();
  await expect(page.getByText("72,00 USD", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Invertir monedas" }).click();
  await page.getByLabel("Monto USD").fill("72");
  await expect(page.getByText("100,00 CAD", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Tasa manual", exact: true }).click();
  await page.getByLabel("USD por 1 CAD", { exact: true }).fill("0.75");
  await page.getByRole("button", { name: "Guardar tasa" }).click();
  await expect(page.getByText("96,00 CAD", { exact: true })).toBeVisible();
});
test("packing ida/regreso and purchase recipients persist", async ({
  page,
}) => {
  await page.goto("/equipaje");
  await page
    .getByRole("button", { name: "Agregar elemento", exact: true })
    .click();
  await page.getByLabel("Elemento", { exact: true }).fill("Cargador");
  await page.getByLabel("Trayecto", { exact: true }).selectOption("Regreso");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await page.getByRole("button", { name: "Listo", exact: true }).click();
  await page.getByRole("button", { name: "Pendiente", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Empacado", exact: true }),
  ).toBeVisible();
  await page.goto("/compras");
  await page.getByRole("button", { name: "Agregar compra" }).click();
  await page.getByLabel("Producto", { exact: true }).fill("Hoja de arce");
  await page.getByLabel("Destinatario").fill("Mamá");
  await page.getByLabel("Precio estimado (CAD)", { exact: true }).fill("8");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await page.getByRole("button", { name: "Listo", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hoja de arce" }),
  ).toBeVisible();
});
test("local attachment is retained and included in ZIP backup", async ({
  page,
  browser,
}) => {
  await page.goto("/documentos");
  await page
    .getByRole("button", { name: "Editar Pasaporte", exact: true })
    .first()
    .click();
  await page.locator("input[type=file][multiple]").setInputFiles({
    name: "recibo.png",
    mimeType: "image/png",
    buffer: await readFile("public/icons/icon-192.png"),
  });
  await expect(page.getByRole("img", { name: "recibo.png" })).toBeVisible();
  await page.getByRole("button", { name: "Listo", exact: true }).click();
  await page.goto("/ajustes");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Descargar respaldo con adjuntos" })
    .click();
  const backup = await download;
  expect(backup.suggestedFilename()).toMatch(/\.zip$/);
  const second = await browser.newContext({ serviceWorkers: "block" });
  try {
    await cloud.install(second);
    const restored = await second.newPage();
    await restored.goto("http://127.0.0.1:3000/ajustes");
    restored.once("dialog", (dialog) => dialog.accept());
    await restored.locator('input[accept=".zip"]').setInputFiles({
      name: backup.suggestedFilename(),
      mimeType: "application/zip",
      buffer: await readFile((await backup.path())!),
    });
    await expect(
      restored.getByRole("status").filter({ hasText: "Respaldo importado" }),
    ).toBeVisible();
    await restored.goto("http://127.0.0.1:3000/documentos");
    await restored
      .getByRole("button", { name: "Editar Pasaporte", exact: true })
      .first()
      .click();
    await expect(
      restored.getByRole("img", { name: "recibo.png" }),
    ).toBeVisible();
  } finally {
    await second.close();
  }
});
test("mobile layout and accessibility in light/dark themes", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Hola, familia/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  let results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath("resumen-claro.png"),
    fullPage: true,
  });
  await page.goto("/ajustes");
  await page.getByRole("button", { name: "Oscuro", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath("ajustes-oscuro.png"),
    fullPage: true,
  });
});
test.describe("PWA", () => {
  test.use({ serviceWorkers: "allow" });
  test("precache opens unvisited routes offline and retains new expense", async ({
    page,
    context,
    browserName,
  }) => {
    test.fixme(
      browserName === "webkit" && process.platform === "darwin",
      "WebKit en macOS falla incluso con un SW mínimo. Reproducción: playwright.diagnostic.config.ts. Validar en iPhone físico.",
    );
    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await context.unrouteAll();
    await context.setOffline(true);
    await page.goto("/gastos");
    await page
      .getByRole("button", { name: "Registrar gasto", exact: true })
      .click();
    await page.getByLabel("Monto del gasto", { exact: true }).fill("9.75");
    await page.getByLabel("Concepto / lugar").fill("Compra sin señal");
    await page
      .getByRole("button", { name: "Guardar gasto", exact: true })
      .click();
    await page.getByRole("button", { name: "Listo, volver a gastos" }).click();
    await page.reload();
    await expect(
      page.getByText("Compra sin señal", { exact: true }),
    ).toBeVisible();
    await page.goto("/ajustes");
    await expect(
      page.getByText("1 cambios pendientes", { exact: true }),
    ).toBeVisible();
    await page.goto("/documentos");
    await expect(
      page.getByRole("heading", { name: "Documentos esenciales", exact: true }),
    ).toBeVisible();
    await context.setOffline(false);
    await cloud.install(context);
    await page.goto("/gastos");
    await expect(
      page.getByText("Compra sin señal", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Sincronizado", exact: true }),
    ).toBeVisible();
    expect(
      cloud.records.filter((r) => r.data.description === "Compra sin señal"),
    ).toHaveLength(1);
  });
});

test("server outage retains pending changes and recovers without duplicates", async ({
  page,
  context,
}) => {
  await page.goto("/gastos");
  await expect(
    page.getByRole("link", { name: "Sincronizado", exact: true }),
  ).toBeVisible();
  await context.unrouteAll();
  await context.route("**/api/sync", (route) => route.abort());
  await page
    .getByRole("button", { name: "Registrar gasto", exact: true })
    .click();
  await page.getByLabel("Monto del gasto", { exact: true }).fill("0.29");
  await page.getByLabel("Concepto / lugar").fill("Guardado durante fallo");
  await page
    .getByRole("button", { name: "Guardar gasto", exact: true })
    .click();
  await page.getByRole("button", { name: "Listo, volver a gastos" }).click();
  await page.goto("/ajustes");
  await expect(
    page.getByText("1 cambios pendientes", { exact: true }),
  ).toBeVisible();
  await context.unrouteAll();
  await cloud.install(context);
  await page
    .getByRole("button", { name: "Sincronizar ahora", exact: true })
    .click();
  await expect(
    page.getByText("0 cambios pendientes", { exact: true }),
  ).toBeVisible();
  expect(
    cloud.records.filter(
      (r) => r.data.description === "Guardado durante fallo",
    ),
  ).toHaveLength(1);
});

test("editing an old expense never assigns a new exchange rate implicitly", async ({
  page,
}) => {
  const id = crypto.randomUUID();
  cloud.records.push({
    id,
    kind: "expense",
    version: 1,
    updatedAt: new Date().toISOString(),
    deleted: false,
    data: {
      ...defaults("expense"),
      description: "Gasto sin tasa histórica",
      amountMinor: 1250,
      rate: null,
    },
  });
  await page.goto("/gastos");
  await page
    .getByRole("button", { name: /Gasto sin tasa histórica.*Comida/ })
    .click();
  await expect(
    page.getByText("Sin tasa: se conservará el monto original", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Concepto / lugar").fill("Concepto corregido");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  await page.getByRole("button", { name: "Listo, volver a gastos" }).click();
  await expect(
    page.getByRole("link", { name: "Sincronizado", exact: true }),
  ).toBeVisible();
  expect(cloud.records.find((r) => r.id === id)?.data).toHaveProperty(
    "rate",
    null,
  );
});

test("all routes fit small phones and desktop without runtime errors", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/gastos",
      "/compras",
      "/equipaje",
      "/documentos",
      "/ruta",
      "/info",
      "/lugares",
      "/estadisticas",
      "/reportes",
      "/ajustes",
      "/mas",
    ]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Horizontal overflow: ${route}, ${width}px`,
      ).toBe(true);
    }
    await page.goto("/gastos");
    await page
      .getByRole("button", { name: "Registrar gasto", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(
      await page
        .locator(".category-grid button")
        .evaluateAll((buttons) =>
          buttons.every((button) => button.scrollWidth <= button.clientWidth),
        ),
      `Category labels must fit at ${width}px`,
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`formulario-${width}.png`),
    });
    await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  }
  expect(errors).toEqual([]);
});
