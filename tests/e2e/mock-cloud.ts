import type { BrowserContext } from "@playwright/test";
import { initialRecords } from "../../src/domain/seed";
import type { TripRecord } from "../../src/domain/models";

export function mockCloud() {
  const records = initialRecords();
  const receipts = new Map<string, TripRecord>();
  return {
    records,
    async install(context: BrowserContext) {
      await context.route("**/api/rate", (route) =>
        route.fulfill({
          json: {
            value: 0.72,
            date: "2026-09-11",
            fetchedAt: new Date().toISOString(),
            source: "QA",
            manual: false,
          },
        }),
      );
      await context.route("**/api/sync", async (route) => {
        if (route.request().method() === "GET")
          return route.fulfill({ json: { records } });
        const body = route.request().postDataJSON();
        if (receipts.has(body.opId))
          return route.fulfill({
            json: { record: receipts.get(body.opId), conflict: false },
          });
        const index = records.findIndex((r) => r.id === body.record.id),
          current = records[index];
        if ((current?.version || 0) !== body.baseVersion)
          return route.fulfill({
            status: 409,
            json: { record: current || null, conflict: true },
          });
        const record = { ...body.record, version: body.baseVersion + 1 };
        if (index >= 0) records[index] = record;
        else records.push(record);
        receipts.set(body.opId, record);
        return route.fulfill({ json: { record, conflict: false } });
      });
    },
  };
}
