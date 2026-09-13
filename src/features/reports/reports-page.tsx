"use client";

import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { useRecords, useTrip } from "@/components/trip-provider";
import { Field, PageHeading } from "@/components/ui";
import { categories } from "@/domain/models";
import {
  convert,
  expenseTotal,
  formatMoney,
  groupExpenses,
} from "@/domain/money";
import { downloadCsv } from "./export";
import { localDB, readAttachment, type Attachment } from "@/local/database";

function displayDate(value: string) {
  if (!value) return "Sin límite";
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function Receipt({ photo }: { photo: Attachment }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const objectUrl = URL.createObjectURL(photo.blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
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
      (record) =>
        (!start || record.data.date >= start) &&
        (!end || record.data.date <= end) &&
        (!category || record.data.category === category) &&
        (!person || record.data.paidBy === person),
    )
    .sort((a, b) =>
      `${a.data.date}T${a.data.time}`.localeCompare(
        `${b.data.date}T${b.data.time}`,
      ),
    );
  const cad = expenseTotal(rows, "CAD"),
    usd = expenseTotal(rows, "USD");
  const period =
    start || end
      ? `${start ? displayDate(start) : "Inicio"} - ${end ? displayDate(end) : "Hoy"}`
      : "Todo el viaje";
  const generatedAt = new Date().toLocaleString("es-EC", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const printablePhotos = photos.filter(
    (photo) =>
      photo.type.startsWith("image/") &&
      rows.some((record) => record.id === photo.recordId),
  );

  return (
    <div className="stack report">
      <PageHeading
        eyebrow="LISTO PARA VIAJAR · TORONTO 2026"
        title="Reporte de gastos"
        body="Resumen financiero familiar del viaje a Canadá."
      >
        <span className="report-mark" aria-hidden="true">
          🍁
        </span>
      </PageHeading>

      <div className="card filter-grid no-print">
        <Field label="Desde">
          <input
            type="date"
            value={start}
            onChange={(event) => setStart(event.target.value)}
          />
        </Field>
        <Field label="Hasta">
          <input
            type="date"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
          />
        </Field>
        <Field label="Categoría">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Todas</option>
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
        <Field label="Persona">
          <select
            value={person}
            onChange={(event) => setPerson(event.target.value)}
          >
            <option value="">Todas</option>
            {Array.from(
              new Set(expenses.map((record) => record.data.paidBy)),
            ).map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={withPhotos}
            onChange={(event) => setWithPhotos(event.target.checked)}
          />{" "}
          Incluir imágenes locales
        </label>
      </div>

      <section className="card report-summary">
        <div className="report-summary-heading">
          <div>
            <p className="eyebrow">RESUMEN EJECUTIVO</p>
            <h2>{rows.length} gastos registrados</h2>
          </div>
          <p className="small muted">Generado: {generatedAt}</p>
        </div>
        <div className="report-total-grid">
          <div className="report-total primary-total">
            <span>Total referencial</span>
            <strong>{formatMoney(cad.total)}</strong>
            <small>Dólares canadienses</small>
          </div>
          <div className="report-total">
            <span>Equivalente referencial</span>
            <strong>{formatMoney(usd.total, "USD")}</strong>
            <small>Dólares estadounidenses</small>
          </div>
        </div>
        <div className="report-facts">
          <div>
            <span>Periodo</span>
            <strong>{period}</strong>
          </div>
          <div>
            <span>Categoría</span>
            <strong>{category || "Todas"}</strong>
          </div>
          <div>
            <span>Persona</span>
            <strong>{person || "Todas"}</strong>
          </div>
          <div>
            <span>Sincronización</span>
            <strong>
              {pending.length ? `${pending.length} pendientes` : "Al día"}
            </strong>
          </div>
        </div>
        {(cad.missing > 0 || usd.missing > 0) && (
          <p className="report-warning small">
            Hay montos sin tasa: {cad.missing} excluidos del total CAD y{" "}
            {usd.missing} del total USD.
          </p>
        )}
        <p className="report-note small muted">
          Última sincronización:{" "}
          {lastSync ? new Date(lastSync).toLocaleString("es-EC") : "Pendiente"}.
          Los valores convertidos utilizan la tasa guardada en cada gasto.
        </p>
      </section>

      <div className="two-cols no-print">
        <button className="button primary" onClick={() => downloadCsv(rows)}>
          <Download size={18} /> Exportar CSV profesional
        </button>
        <button className="button secondary" onClick={() => window.print()}>
          <Printer size={18} /> Guardar / imprimir PDF
        </button>
      </div>
      <p className="small muted no-print">
        En el diálogo de impresión, elige “Guardar como PDF”. Las imágenes
        guardadas en este dispositivo se incluyen si activas la opción; los PDF
        adjuntos se descargan por separado.
      </p>

      <div className="report-breakdowns">
        {(["category", "paidBy", "paymentMethod", "date"] as const).map(
          (key, index) => {
            const groups = groupExpenses(rows, key);
            return (
              <section className="card report-breakdown" key={key}>
                <h2>
                  {
                    [
                      "Por categoría",
                      "Por persona",
                      "Por método de pago",
                      "Por día",
                    ][index]
                  }
                </h2>
                {groups.map(([label, total]) => (
                  <div className="report-row" key={label}>
                    <span>{key === "date" ? displayDate(label) : label}</span>
                    <strong>{formatMoney(total)}</strong>
                  </div>
                ))}
                {!groups.length && (
                  <p className="small muted">Sin datos para mostrar.</p>
                )}
              </section>
            );
          },
        )}
      </div>

      <section className="card report-details-card">
        <div className="report-section-heading">
          <div>
            <p className="eyebrow">MOVIMIENTOS</p>
            <h2>Detalle de gastos</h2>
          </div>
          <span className="small muted">Orden cronológico</span>
        </div>
        {!rows.length && <p>No hay gastos en este rango.</p>}
        <div className="screen-only">
          {rows.map((record) => (
            <article className="report-detail" key={record.id}>
              <div className="row spread">
                <strong>{record.data.description}</strong>
                <strong>
                  {formatMoney(record.data.amountMinor, record.data.currency)}
                </strong>
              </div>
              <p className="small">
                {displayDate(record.data.date)} · {record.data.time} ·{" "}
                {record.data.category} · {record.data.paidBy} ·{" "}
                {record.data.paymentMethod}
              </p>
              {record.data.notes && (
                <p className="small preserve">{record.data.notes}</p>
              )}
              {withPhotos && (
                <div className="receipt-grid">
                  {photos
                    .filter(
                      (photo) =>
                        photo.recordId === record.id &&
                        photo.type.startsWith("image/"),
                    )
                    .map((photo) => (
                      <Receipt key={photo.id} photo={photo} />
                    ))}
                </div>
              )}
            </article>
          ))}
        </div>

        {!!rows.length && (
          <div className="print-only report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th scope="col">N.º</th>
                  <th scope="col">Fecha y hora</th>
                  <th scope="col">Concepto</th>
                  <th scope="col">Persona / método</th>
                  <th scope="col" className="number">
                    Original
                  </th>
                  <th scope="col" className="number">
                    Ref. CAD
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((record, index) => {
                  const cadValue = convert(
                    record.data.amountMinor,
                    record.data.currency,
                    "CAD",
                    record.data.rate,
                  );
                  return (
                    <tr key={record.id}>
                      <td>{index + 1}</td>
                      <td>
                        {displayDate(record.data.date)}
                        <small>{record.data.time}</small>
                      </td>
                      <td>
                        <strong>{record.data.description}</strong>
                        <small>{record.data.category}</small>
                        {record.data.notes && (
                          <small>{record.data.notes}</small>
                        )}
                      </td>
                      <td>
                        {record.data.paidBy}
                        <small>{record.data.paymentMethod}</small>
                      </td>
                      <td className="number">
                        {formatMoney(
                          record.data.amountMinor,
                          record.data.currency,
                        )}
                      </td>
                      <td className="number">
                        {cadValue === null ? "Sin tasa" : formatMoney(cadValue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5}>TOTAL REFERENCIAL</td>
                  <td className="number">{formatMoney(cad.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {withPhotos && printablePhotos.length > 0 && (
        <section className="card print-only report-print-receipts">
          <p className="eyebrow">RESPALDOS</p>
          <h2>Comprobantes fotográficos</h2>
          <div className="receipt-grid">
            {printablePhotos.map((photo) => (
              <Receipt key={photo.id} photo={photo} />
            ))}
          </div>
        </section>
      )}

      <footer className="report-print-footer print-only">
        <span>Listo Para Viajar · Reporte familiar</span>
        <span>Montos convertidos con la tasa guardada en cada gasto</span>
      </footer>
    </div>
  );
}
