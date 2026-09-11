"use client";
import { useEffect, useState } from "react";
import { Camera, ImagePlus, Download, Trash2, FileText } from "lucide-react";
import { localDB, announce, type Attachment } from "@/local/database";
import { addAttachment } from "@/local/attachments";
import { useTrip } from "./trip-provider";
function Preview({
  file,
  onDelete,
}: {
  file: Attachment;
  onDelete: () => void;
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const u = URL.createObjectURL(file.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file.blob]);
  return (
    <div className="attachment">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Abrir ${file.name}`}
      >
        {file.type.startsWith("image/") ? (
          <img src={url} alt={file.name} />
        ) : (
          <FileText size={40} />
        )}
      </a>
      <small>{file.name}</small>
      <div className="row">
        <a
          className="icon-button"
          href={url}
          download={file.name}
          aria-label="Descargar adjunto"
        >
          <Download size={16} />
        </a>
        <button
          type="button"
          className="icon-button"
          aria-label="Eliminar adjunto"
          onClick={onDelete}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
export function Attachments({ recordId }: { recordId: string }) {
  const [files, setFiles] = useState<Attachment[]>([]),
    [busy, setBusy] = useState(false);
  const { notify } = useTrip();
  useEffect(() => {
    const load = () =>
      void localDB()
        .then((db) => db.getAllFromIndex("photos", "by-record", recordId))
        .then(setFiles);
    load();
    window.addEventListener("trip-change", load);
    return () => window.removeEventListener("trip-change", load);
  }, [recordId]);
  async function upload(list: FileList | null) {
    if (!list) return;
    setBusy(true);
    try {
      for (const f of Array.from(list)) await addAttachment(recordId, f);
      notify("Adjunto guardado en este dispositivo.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "No se pudo guardar el archivo.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="stack">
      <h3>Fotos y comprobantes</h3>
      <p className="callout small">
        Se guardan solo en este dispositivo. Descárgalos o exporta una copia
        para conservarlos.
      </p>
      <div className="two-cols">
        <label className="button secondary">
          <Camera size={18} /> Cámara
          <input
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            disabled={busy}
            onChange={(e) => void upload(e.target.files)}
          />
        </label>
        <label className="button secondary">
          <ImagePlus size={18} /> Galería / PDF
          <input
            type="file"
            accept="image/*,application/pdf"
            multiple
            hidden
            disabled={busy}
            onChange={(e) => void upload(e.target.files)}
          />
        </label>
      </div>
      {busy && <p role="status">Guardando archivo…</p>}
      {!files.length ? (
        <p className="muted small">
          No hay adjuntos locales en este dispositivo.
        </p>
      ) : (
        <div className="attachment-grid">
          {files.map((file) => (
            <Preview
              key={file.id}
              file={file}
              onDelete={async () => {
                if (!confirm("¿Eliminar este adjunto local?")) return;
                await (await localDB()).delete("photos", file.id);
                announce();
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
