"use client";
import { useState } from "react";
import { Modal } from "@/components/modal";
import { Field } from "@/components/ui";
import { Attachments } from "@/components/attachments";
import { useRecords, useTrip } from "@/components/trip-provider";
import { defaults, type DataMap, type TripRecord } from "@/domain/models";
import { collections, type CollectionKind } from "./config";
import { parseMoney } from "@/domain/money";
export function RecordForm({
  kind,
  existing,
  onClose,
}: {
  kind: CollectionKind;
  existing?: TripRecord;
  onClose: () => void;
}) {
  const config = collections[kind],
    { save } = useTrip(),
    expenses = useRecords("expense");
  const [draft, setDraft] = useState<Record<string, unknown>>(() => {
    const d = { ...defaults(kind), ...existing?.data } as Record<
      string,
      unknown
    >;
    for (const f of config.fields)
      if (f.type === "money")
        d[f.key] = d[f.key] === null ? "" : String(Number(d[f.key]) / 100);
    return d;
  });
  const [saved, setSaved] = useState(existing),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [dirty, setDirty] = useState(false);
  const patch = (key: string, v: unknown) => {
    setDraft((d) => ({ ...d, [key]: v }));
    setDirty(true);
  };
  return (
    <Modal
      title={config.singular}
      onClose={() => {
        if (
          !dirty ||
          confirm("¿Cerrar sin guardar los cambios del formulario?")
        )
          onClose();
      }}
    >
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            const data = { ...draft };
            for (const f of config.fields) {
              if (f.type === "money")
                data[f.key] =
                  data[f.key] === "" ? null : parseMoney(String(data[f.key]));
              if (f.type === "number") data[f.key] = Number(data[f.key]);
            }
            const r = await save(
              kind,
              data as DataMap[CollectionKind],
              saved as TripRecord<CollectionKind> | undefined,
            );
            setSaved(r);
            setDirty(false);
          } catch (e) {
            setError(e instanceof Error ? e.message : "No se pudo guardar.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {config.fields.map((f) => (
          <Field label={f.label} key={f.key}>
            {f.options && !f.custom ? (
              <select
                value={String(draft[f.key] ?? "")}
                onChange={(e) => patch(f.key, e.target.value)}
              >
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea
                rows={3}
                value={String(draft[f.key] ?? "")}
                onChange={(e) => patch(f.key, e.target.value)}
              />
            ) : (
              <>
                <input
                  required={f.required || !!f.options}
                  type={f.type === "money" ? "text" : f.type || "text"}
                  inputMode={f.type === "money" ? "decimal" : undefined}
                  list={f.custom ? `options-${f.key}` : undefined}
                  value={String(draft[f.key] ?? "")}
                  onChange={(e) => patch(f.key, e.target.value)}
                  min={f.key === "quantity" ? 1 : 0}
                />
                {f.custom && (
                  <datalist id={`options-${f.key}`}>
                    {f.options?.map((o) => (
                      <option key={o} value={o} />
                    ))}
                  </datalist>
                )}
              </>
            )}
          </Field>
        ))}
        {kind === "packing" && (
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={Boolean(draft.done)}
              onChange={(e) => patch("done", e.target.checked)}
            />{" "}
            Ya está empacado
          </label>
        )}
        {kind === "purchase" && (
          <Field label="Vincular a un gasto existente">
            <select
              value={String(draft.expenseId || "")}
              onChange={(e) => patch("expenseId", e.target.value || null)}
            >
              <option value="">Sin vincular</option>
              {expenses.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.data.description}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Notas">
          <textarea
            rows={3}
            value={String(draft.notes || "")}
            onChange={(e) => patch("notes", e.target.value)}
          />
        </Field>
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <button className="button primary full" disabled={busy}>
          {busy ? "Guardando…" : saved ? "Guardar cambios" : "Guardar"}
        </button>
      </form>
      {saved ? (
        <div className="section-divider">
          <Attachments recordId={saved.id} />
          <button className="button secondary full" onClick={onClose}>
            Listo
          </button>
        </div>
      ) : (
        <p className="muted small form-footnote">
          Guarda primero para adjuntar fotos o archivos locales.
        </p>
      )}
    </Modal>
  );
}
