import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { localDB, saveLocal } from "@/local/database";
import { acknowledge, acceptRemote, syncNow } from "@/local/sync";
import { defaults, type TripRecord } from "@/domain/models";
function fixture(): TripRecord<"expense"> {
  return {
    id: crypto.randomUUID(),
    kind: "expense",
    data: { ...defaults("expense"), description: "Receipt", amountMinor: 1000 },
    version: 0,
    deleted: false,
    updatedAt: new Date().toISOString(),
  };
}
beforeEach(async () => {
  const db = await localDB();
  await db.clear("records");
  await db.clear("outbox");
});
afterEach(() => vi.unstubAllGlobals());
describe("Durable offline queue", () => {
  it("atomically keeps record and mutation", async () => {
    const r = fixture();
    await saveLocal(r);
    const db = await localDB();
    expect((await db.get("records", r.id))?.data).toEqual(r.data);
    expect((await db.get("outbox", r.id))?.baseVersion).toBe(0);
  });
  it("coalesces unsent edits without duplicating records", async () => {
    const r = fixture();
    await saveLocal(r);
    await saveLocal({ ...r, data: { ...r.data, amountMinor: 2000 } });
    const db = await localDB();
    expect(await db.count("outbox")).toBe(1);
    expect((await db.get("outbox", r.id))?.record.data).toHaveProperty(
      "amountMinor",
      2000,
    );
  });
  it("remote snapshot cannot overwrite a pending local change", async () => {
    const r = fixture();
    await saveLocal(r);
    await acceptRemote([
      { ...r, version: 10, data: { ...r.data, amountMinor: 3000 } },
    ]);
    expect((await (await localDB()).get("records", r.id))?.data).toHaveProperty(
      "amountMinor",
      1000,
    );
  });
  it("acknowledges only the operation that was sent", async () => {
    const r = fixture();
    await saveLocal(r);
    const db = await localDB(),
      sent = (await db.get("outbox", r.id))!;
    await saveLocal({ ...r, data: { ...r.data, amountMinor: 2500 } });
    await acknowledge(sent, { ...r, version: 1 });
    const latest = (await db.get("outbox", r.id))!;
    expect(latest.baseVersion).toBe(1);
    expect(latest.record.data).toHaveProperty("amountMinor", 2500);
    expect(await db.count("outbox")).toBe(1);
  });
  it("removes queue entry after server acknowledgment", async () => {
    const r = fixture();
    await saveLocal(r);
    const db = await localDB();
    await acknowledge((await db.get("outbox", r.id))!, { ...r, version: 1 });
    expect(await db.count("outbox")).toBe(0);
    expect((await db.get("records", r.id))?.version).toBe(1);
  });
  it("syncs deletions without resurrecting a pending tombstone", async () => {
    const r = fixture();
    await saveLocal({ ...r, deleted: true });
    await acceptRemote([{ ...r, version: 1 }]);
    expect((await (await localDB()).get("records", r.id))?.deleted).toBe(true);
  });
  it("flushes a save requested during an in-flight snapshot without waiting for polling", async () => {
    let finish: (value: Response) => void = () => {};
    const snapshot = new Promise<Response>((resolve) => {
      finish = resolve;
    });
    const fetcher = vi
      .fn()
      .mockImplementationOnce(() => snapshot)
      .mockImplementation(async (_url, init) => {
        if (init?.method === "POST") {
          const op = JSON.parse(init.body);
          return Response.json({
            record: { ...op.record, version: 1 },
            conflict: false,
          });
        }
        return Response.json({ records: [] });
      });
    vi.stubGlobal("fetch", fetcher);
    const first = syncNow();
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    await saveLocal(fixture());
    const second = syncNow();
    finish(Response.json({ records: [] }));
    await Promise.all([first, second]);
    expect(await (await localDB()).count("outbox")).toBe(0);
    expect(fetcher.mock.calls.some((call) => call[1]?.method === "POST")).toBe(
      true,
    );
  });
});
