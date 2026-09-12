import "fake-indexeddb/auto";
import { beforeEach, expect, it } from "vitest";
import { strToU8, zipSync } from "fflate";
import { importBackup } from "@/local/backup";
import { localDB, readAttachment, storeAttachment } from "@/local/database";
import { initialRecords } from "@/domain/seed";
import { defaults, expenseSchema, type TripRecord } from "@/domain/models";

beforeEach(async () => {
  const db = await localDB();
  for (const store of ["records", "photos", "outbox", "meta"] as const)
    await db.clear(store);
});

function backup(invalid = false) {
  const record = initialRecords()[0];
  const photo = {
    id: crypto.randomUUID(),
    recordId: record.id,
    name: "receipt.pdf",
    type: "application/pdf",
    createdAt: new Date().toISOString(),
    path: "attachments/receipt",
  };
  const zip = zipSync({
    "backup.json": strToU8(
      JSON.stringify({
        format: "listo-viajar-1",
        createdAt: photo.createdAt,
        records: [record],
        rate: null,
        attachments: [photo],
      }),
    ),
    ...(!invalid ? { [photo.path]: strToU8("%PDF-1.4 QA bytes") } : {}),
  });
  return { record, photo, file: new File([new Uint8Array(zip)], "backup.zip") };
}

it("imports missing records and file bytes atomically, queuing their sync", async () => {
  const { record, photo, file } = backup();
  expect(await importBackup(file)).toBe(1);
  const db = await localDB();
  expect((await db.get("records", record.id))?.version).toBe(0);
  expect((await db.get("outbox", record.id))?.baseVersion).toBe(0);
  expect(
    await readAttachment((await db.get("photos", photo.id))!).blob.text(),
  ).toBe("%PDF-1.4 QA bytes");
});

it("reimport does not overwrite existing records or duplicate attachments", async () => {
  const { record, file } = backup();
  await importBackup(file);
  const db = await localDB();
  await db.put("records", {
    ...record,
    version: 4,
    data: { ...record.data, description: "User edit" },
  });
  expect(await importBackup(file)).toBe(0);
  expect((await db.get("records", record.id))?.data.description).toBe(
    "User edit",
  );
  expect(await db.count("photos")).toBe(1);
});

it("rejects a backup with missing attachment before any local write", async () => {
  await expect(importBackup(backup(true).file)).rejects.toThrow(
    "adjunto inválido",
  );
  const db = await localDB();
  expect(await db.count("records")).toBe(0);
  expect(await db.count("outbox")).toBe(0);
});

it("stores attachments as bytes and reads legacy Blob records", async () => {
  const file = {
    id: crypto.randomUUID(),
    recordId: crypto.randomUUID(),
    name: "file.pdf",
    type: "application/pdf",
    createdAt: "2026-09-11",
    blob: new Blob(["receipt"]),
  };
  const stored = await storeAttachment(file);
  expect(stored.blob).toBeUndefined();
  expect(await readAttachment(stored).blob.text()).toBe("receipt");
  expect(await readAttachment(file).blob.text()).toBe("receipt");
});

it("validates real dates and times, not just their shape", () => {
  const expense = {
    ...defaults("expense"),
    description: "Bus",
    amountMinor: 100,
  };
  expect(
    expenseSchema.safeParse({ ...expense, date: "2026-02-30" }).success,
  ).toBe(false);
  expect(expenseSchema.safeParse({ ...expense, time: "24:00" }).success).toBe(
    false,
  );
  expect(expenseSchema.safeParse({ ...expense, time: "23:59" }).success).toBe(
    true,
  );
});

it("keeps identity documents applicable for the whole trip", () => {
  const docs = initialRecords().filter(
    (r) => r.kind === "document" && r.data.description.startsWith("Cédula"),
  );
  expect(docs).toHaveLength(3);
  for (const doc of docs)
    expect(doc.data).toHaveProperty("stage", "Todo el viaje");
});

it("preloads the six confirmed itinerary legs", () => {
  const legs = initialRecords().filter(
    (record): record is TripRecord<"leg"> => record.kind === "leg",
  );
  expect(legs).toHaveLength(6);
  expect(legs.map((leg) => leg.data.flight)).toEqual([
    "AV1695",
    "AV8376",
    "AV254",
    "AV255",
    "AV8373",
    "AV1696",
  ]);
  expect(legs[2]?.data).toMatchObject({
    description: "Bogotá → Toronto",
    date: "2026-09-15",
    time: "00:05",
    terminal: "Terminal 1 (BOG y YYZ)",
  });
  expect(legs[5]?.data).toMatchObject({
    description: "Quito → Manta",
    date: "2026-09-25",
    time: "19:20",
  });
});
