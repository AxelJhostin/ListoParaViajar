import { localDB, announce, type Pending } from "./database";
import { recordSchema, type TripRecord } from "@/domain/models";
let flight: Promise<void> | null = null;
export async function acceptRemote(remote: TripRecord[]) {
  const db = await localDB(),
    tx = db.transaction(["records", "outbox"], "readwrite");
  for (const r of remote) {
    if (!(await tx.objectStore("outbox").get(r.id)))
      await tx.objectStore("records").put(r);
  }
  await tx.done;
}
export async function acknowledge(sent: Pending, server: TripRecord) {
  const db = await localDB(),
    tx = db.transaction(["records", "outbox"], "readwrite");
  const latest = await tx.objectStore("outbox").get(sent.record.id);
  if (latest?.opId === sent.opId) {
    await tx.objectStore("outbox").delete(sent.record.id);
    await tx.objectStore("records").put(server);
  } else if (latest) {
    latest.baseVersion = server.version;
    latest.record.version = server.version;
    await tx.objectStore("outbox").put(latest);
    await tx.objectStore("records").put(latest.record);
  }
  await tx.done;
}
async function run() {
  const db = await localDB();
  await db.put("meta", "syncing", "syncStatus");
  announce();
  try {
    const pending = await db.getAll("outbox");
    for (const op of pending) {
      if ("conflict" in op) continue;
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(op),
        signal: AbortSignal.timeout(20000),
      });
      const body = await response.json();
      if (response.status === 409) {
        const latest = await db.get("outbox", op.record.id);
        if (latest)
          await db.put("outbox", {
            ...latest,
            conflict: body.record,
            error: "Este registro cambió en otro dispositivo.",
          });
        continue;
      }
      if (!response.ok)
        throw new Error(body.error || "No se pudo sincronizar.");
      await acknowledge(op, recordSchema.parse(body.record));
    }
    const response = await fetch("/api/sync", {
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const body = await response.json();
    if (!response.ok)
      throw new Error(body.error || "No se pudo descargar el viaje.");
    await acceptRemote(recordSchema.array().parse(body.records));
    await db.put("meta", new Date().toISOString(), "lastSync");
    await db.put("meta", "", "syncError");
    await db.put("meta", "ready", "syncStatus");
  } catch (error) {
    await db.put(
      "meta",
      error instanceof Error ? error.message : "No se pudo sincronizar.",
      "syncError",
    );
    await db.put("meta", "error", "syncStatus");
  }
  announce();
}
export function syncNow() {
  if (flight) return flight;
  const action = () => run();
  flight = (
    typeof navigator !== "undefined" && navigator.locks
      ? navigator.locks.request("trip-sync", action)
      : action()
  ).finally(() => {
    flight = null;
  });
  return flight;
}
export async function resolveConflict(id: string, keepLocal: boolean) {
  const db = await localDB(),
    tx = db.transaction(["outbox", "records"], "readwrite");
  const op = await tx.objectStore("outbox").get(id);
  if (op && "conflict" in op) {
    if (keepLocal) {
      const record = { ...op.record, version: op.conflict?.version || 0 };
      await tx
        .objectStore("outbox")
        .put({
          record,
          baseVersion: record.version,
          opId: crypto.randomUUID(),
        });
      await tx.objectStore("records").put(record);
    } else {
      await tx.objectStore("outbox").delete(id);
      if (op.conflict) await tx.objectStore("records").put(op.conflict);
      else await tx.objectStore("records").delete(id);
    }
  }
  await tx.done;
  announce();
  void syncNow();
}
