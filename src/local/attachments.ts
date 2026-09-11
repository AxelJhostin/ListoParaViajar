import { localDB, announce, type Attachment } from "./database";
export async function addAttachment(recordId: string, file: File) {
  if (file.size > 15 * 1024 * 1024)
    throw new Error("El archivo supera 15 MB. Usa una foto más pequeña.");
  if (!file.type.startsWith("image/") && file.type !== "application/pdf")
    throw new Error("Elige una imagen o un PDF.");
  let blob: Blob = file;
  if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext("2d")!
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) =>
          b ? resolve(b) : reject(new Error("No se pudo procesar la imagen.")),
        "image/jpeg",
        0.85,
      ),
    );
  } else if (file.type === "image/svg+xml")
    throw new Error("Usa JPG, PNG, WebP o PDF.");
  const item: Attachment = {
    id: crypto.randomUUID(),
    recordId,
    name: file.name,
    type: blob.type,
    blob,
    createdAt: new Date().toISOString(),
  };
  await (await localDB()).put("photos", item);
  announce();
  return item;
}
