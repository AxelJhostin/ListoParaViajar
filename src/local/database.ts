import { openDB, type DBSchema } from "idb";
import type { Mutation, Rate, TripRecord } from "@/domain/models";
export type Pending = Mutation & {
  conflict?: TripRecord | null;
  error?: string;
};
export type Attachment = {
  id: string;
  recordId: string;
  name: string;
  type: string;
  blob: Blob;
  createdAt: string;
};
interface LocalSchema extends DBSchema {
  records: { key: string; value: TripRecord };
  outbox: { key: string; value: Pending };
  photos: { key: string; value: Attachment; indexes: { "by-record": string } };
  meta: { key: string; value: unknown };
}
let connection: ReturnType<typeof openDB<LocalSchema>> | undefined;
export function localDB() {
  return (connection ||= openDB<LocalSchema>("listo-para-viajar-v1", 1, {
    upgrade(db) {
      db.createObjectStore("records", { keyPath: "id" });
      db.createObjectStore("outbox", { keyPath: "record.id" });
      const photos = db.createObjectStore("photos", { keyPath: "id" });
      photos.createIndex("by-record", "recordId");
      db.createObjectStore("meta");
    },
  }));
}
export function announce() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("trip-change"));
    const ch = new BroadcastChannel("trip");
    ch.postMessage("change");
    ch.close();
  }
}
export async function saveLocal(record: TripRecord) {
  const db = await localDB(),
    tx = db.transaction(["records", "outbox"], "readwrite");
  const previous = await tx.objectStore("outbox").get(record.id);
  const op: Pending = {
    opId: crypto.randomUUID(),
    record,
    baseVersion: previous?.baseVersion ?? record.version,
  };
  await tx.objectStore("records").put(record);
  await tx.objectStore("outbox").put(op);
  await tx.done;
  announce();
}
export async function getRate() {
  return ((await (await localDB()).get("meta", "rate")) || null) as Rate | null;
}
export async function setRate(rate: Rate) {
  await (await localDB()).put("meta", rate, "rate");
  announce();
}
