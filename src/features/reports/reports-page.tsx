"use client";
import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { useRecords, useTrip } from "@/components/trip-provider";
import { Field, PageHeading } from "@/components/ui";
import { categories } from "@/domain/models";
import { expenseTotal, formatMoney, groupExpenses } from "@/domain/money";
import { downloadCsv } from "./export";
import { localDB, readAttachment, type Attachment } from "@/local/database";
function Receipt({ photo }: { photo: Attachment }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const u = URL.createObjectURL(photo.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [photo]);
  return (
    <figure>
      <img src={url} alt={photo.name} />
      <figcaption>{photo.name}</figcaption>
    </figure>
  );
}
export function ReportsPage() {
  const expenses = useRecords("expense"),
    { pending, lastSync } = useTrip();
  const [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [category, setCategory] = useState(""),
    [person, setPerson] = useState(""),
    [withPhotos, setWithPhotos] = useState(false),
    [photos, setPhotos] = useState<Attachment[]>([]);
  useEffect(() => {
    void localDB()
      .then((db) => db.getAll("photos"))
      .then((files) => setPhotos(files.map(readAttachment)));
  }, []);
  const rows = expenses
    .filter(
      (r) =>
        (!start || r.data.date >= start) &&
        (!end || r.data.date <= end) &&
        (!category || r.data.category === category) &&
        (!person || r.data.paidBy === person),
    )
    .sort((a, b) => a.data.date.localeCompare(b.data.date));
  const cad = expenseTotal(rows, "CAD"),
    usd = expenseTotal(rows, "USD");
  return (
    <div className="stack report">
      <PageHeading
        eyebrow="LISTO PARA VIAJAR · TORONTO 2026"
        title="Cuentas del viaje"
        body="Un resumen para compartir en familia."
      />
      <div className="card filter-grid no-print">
        <Field label="Desde">
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </Field>
        <Field label="Hasta">
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </Field>
        <Field label="Categoría">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Persona">
          <select value={person} onChange={(e) => setPerson(e.target.value)}>
            <option value="">Todas</option>
            {Array.from(new Set(expenses.map((r) => r.data.paidBy))).map(
              (p) => (
                <option key={p}>{p}</option>
              ),
            )}
          </select>
        </Field>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={withPhotos}
            onChange={(e) => setWithPhotos(e.target.checked)}
          />{" "}
          Incluir imágenes locales
        </label>
      </div>
      <section className="card">
        <p className="eyebrow">TOTAL · {rows.length} GASTOS</p>
        <p className="amount">{formatMoney(cad.total)}</p>
        <p>≈ {formatMoney(usd.total, "USD")}</p>
        {(cad.missing > 0 || usd.missing > 0) && (
          <p className="error-text small">
            Hay montos sin tasa: {cad.missing} excluidos del total CAD y{" "}
            {usd.missing} del total USD.
          </p>
        )}
        <p className="small muted">
          Generado: {new Date().toLocaleString("es-EC")}
          <br />
          Última sincronización:{" "}
          {lastSync
            ? new Date(lastSync).toLocaleString("es-EC")
            : "Todavía no sincronizado"}
          <br />
          {pending.length} cambios pendientes de enviar.
        </p>
        <p className="small">
          Los valores convertidos son referenciales y utilizan la tasa guardada
          en cada gasto.
        </p>
      </section>
      <div className="two-cols no-print">
        <button className="button primary" onClick={() => downloadCsv(rows)}>
          <Download size={18} /> Exportar CSV
        </button>
        <button className="button secondary" onClick={() => window.print()}>
          <Printer size={18} /> Imprimir / PDF
        </button>
      </div>
      <p className="small muted no-print">
        En el diálogo de impresión, elige “Guardar como PDF”. Solo se incluirán
        las imágenes guardadas en este dispositivo; los PDF adjuntos se
        descargan por separado.
      </p>
      {(["category", "paidBy", "paymentMethod", "date"] as const).map(
        (key, i) => (
          <section className="card" key={key}>
            <h2>
              {
                [
                  "Por categoría",
                  "Por persona",
                  "Por método de pago",
                  "Por día",
                ][i]
              }
            </h2>
            {groupExpenses(rows, key).map(([label, total]) => (
              <div className="report-row" key={label}>
                <span>{label}</span>
                <strong>{formatMoney(total)}</strong>
              </div>
            ))}
          </section>
        ),
      )}
      <section className="card">
        <h2>Detalle de gastos</h2>
        {!rows.length && <p>No hay gastos en este rango.</p>}
        {rows.map((r) => (
          <article className="report-detail" key={r.id}>
            <div className="row spread">
              <strong>{r.data.description}</strong>
              <strong>
                {formatMoney(r.data.amountMinor, r.data.currency)}
              </strong>
            </div>
            <p className="small">
              {r.data.date} {r.data.time} · {r.data.category} · {r.data.paidBy}{" "}
              · {r.data.paymentMethod}
            </p>
            <p className="small preserve">{r.data.notes}</p>
            {withPhotos && (
              <div className="receipt-grid">
                {photos
                  .filter(
                    (p) => p.recordId === r.id && p.type.startsWith("image/"),
                  )
                  .map((p) => (
                    <Receipt key={p.id} photo={p} />
                  ))}
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
