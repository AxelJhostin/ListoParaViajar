import { zipSync, unzipSync, strToU8, strFromU8 } from "fflate";
import { z } from "zod";
import { recordSchema, rateSchema } from "@/domain/models";
import {
  localDB,
  announce,
  storeAttachment,
  readAttachment,
  type Attachment,
} from "./database";
import { downloadBlob } from "@/features/reports/export";
const backupSchema = z.object({
  format: z.literal("listo-viajar-1"),
  createdAt: z.string(),
  records: recordSchema.array().max(20000),
  rate: rateSchema.nullable(),
  attachments: z
    .array(
      z.object({
        id: z.string().uuid(),
        recordId: z.string().uuid(),
        name: z.string().max(250),
        type: z.string(),
        createdAt: z.string(),
        path: z.string(),
      }),
    )
    .max(5000),
});
export async function exportBackup() {
  const db = await localDB();
  const records = await db.getAll("records"),
    photos = (await db.getAll("photos")).map(readAttachment);
  const files: Record<string, Uint8Array> = {};
  for (const p of photos)
    files[`attachments/${p.id}`] = new Uint8Array(await p.blob.arrayBuffer());
  files["backup.json"] = strToU8(
    JSON.stringify(
      {
        format: "listo-viajar-1",
        createdAt: new Date().toISOString(),
        records,
        rate: (await db.get("meta", "rate")) || null,
        attachments: photos.map(({ blob, ...p }) => ({
          ...p,
          path: `attachments/${p.id}`,
          size: blob.size,
        })),
      },
      null,
      2,
    ),
  );
  const zip = zipSync(files, { level: 0 });
  downloadBlob(
    new Blob([new Uint8Array(zip)], { type: "application/zip" }),
    `viaje-respaldo-${new Date().toISOString().slice(0, 10)}.zip`,
  );
}
export async function importBackup(file: File) {
  if (file.size > 200 * 1024 * 1024)
    throw new Error("El respaldo supera el límite de 200 MB.");
  let totalSize = 0;
  const zip = unzipSync(new Uint8Array(await file.arrayBuffer()), {
    filter(entry) {
      totalSize += entry.originalSize;
      if (totalSize > 250 * 1024 * 1024)
        throw new Error("El respaldo descomprimido es demasiado grande.");
      return true;
    },
  });
  if (!zip["backup.json"])
    throw new Error("Este archivo no es un respaldo de Listo Para Viajar.");
  const data = backupSchema.parse(JSON.parse(strFromU8(zip["backup.json"])));
  // Validate every attachment before making any local change.
  const photos: Attachment[] = data.attachments.map((p) => {
    const bytes = zip[p.path];
    if (
      !bytes ||
      !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
        p.type,
      )
    )
      throw new Error("El respaldo tiene un adjunto inválido.");
    return {
      id: p.id,
      recordId: p.recordId,
      name: p.name,
      type: p.type,
      createdAt: p.createdAt,
      blob: new Blob([new Uint8Array(bytes)], { type: p.type }),
    };
  });
  const storedPhotos = await Promise.all(photos.map(storeAttachment));
  const db = await localDB(),
    tx = db.transaction(["records", "outbox", "photos", "meta"], "readwrite");
  let imported = 0;
  for (const record of data.records) {
    if (await tx.objectStore("records").get(record.id)) continue;
    const local = { ...record, version: 0 };
    await tx.objectStore("records").put(local);
    await tx
      .objectStore("outbox")
      .put({ record: local, baseVersion: 0, opId: crypto.randomUUID() });
    imported++;
  }
  for (const p of storedPhotos)
    if (!(await tx.objectStore("photos").get(p.id)))
      await tx.objectStore("photos").put(p);
  if (data.rate && !(await tx.objectStore("meta").get("rate")))
    await tx.objectStore("meta").put(data.rate, "rate");
  await tx.done;
  announce();
  return imported;
}
