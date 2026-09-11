"use client";
import { useState } from "react";
import Link from "@/components/nav-link";
import {
  Plus,
  SlidersHorizontal,
  ReceiptText,
  Trash2,
  Download,
} from "lucide-react";
import { useRecords, useTrip } from "@/components/trip-provider";
import { PageHeading, Empty, SearchBox, Field, Badge } from "@/components/ui";
import { ExpenseForm } from "./expense-form";
import {
  categories,
  people,
  paymentMethods,
  type TripRecord,
} from "@/domain/models";
import { expenseTotal, formatMoney, convert } from "@/domain/money";
import { downloadCsv } from "@/features/reports/export";
import { useLocalAttachments } from "@/components/use-local-attachments";
export function ExpenseList() {
  const records = useRecords("expense");
  const attachments = useLocalAttachments();
  const [onlyAttachments, setOnlyAttachments] = useState(false),
    [originalCurrency, setOriginalCurrency] = useState("");
  const { remove, pending, notify } = useTrip();
  const [editing, setEditing] = useState<
      TripRecord<"expense"> | null | undefined
    >(undefined),
    [search, setSearch] = useState(""),
    [filters, setFilters] = useState(false),
    [category, setCategory] = useState(""),
    [person, setPerson] = useState(""),
    [method, setMethod] = useState(""),
    [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [currency, setCurrency] = useState<"CAD" | "USD">("CAD");
  const filtered = records
    .filter(
      (r) =>
        `${r.data.description} ${r.data.notes}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (!category || r.data.category === category) &&
        (!person || r.data.paidBy === person) &&
        (!method || r.data.paymentMethod === method) &&
        (!onlyAttachments || !!attachments[r.id]) &&
        (!originalCurrency || r.data.currency === originalCurrency) &&
        (!start || r.data.date >= start) &&
        (!end || r.data.date <= end),
    )
    .sort((a, b) =>
      `${b.data.date}${b.data.time}`.localeCompare(
        `${a.data.date}${a.data.time}`,
      ),
    );
  const sum = expenseTotal(filtered, currency);
  return (
    <div className="stack">
      <PageHeading
        eyebrow="TORONTO 2026 · CUENTAS CLARAS"
        title="Gastos del viaje"
        body="Cada gasto, en su lugar."
      />
      <section className="card total-card">
        <div className="row spread">
          <Badge>Registro familiar</Badge>
          <div className="segmented">
            {(["CAD", "USD"] as const).map((c) => (
              <button
                key={c}
                className={c === currency ? "selected" : ""}
                onClick={() => setCurrency(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <p className="eyebrow">
          Total acumulado{" "}
          {filtered.length !== records.length ? "· filtrado" : ""}
        </p>
        <p className="amount">{formatMoney(sum.total, currency)}</p>
        <p className="small muted">
          {filtered.length} registros · Sin presupuesto asignado
        </p>
        {sum.missing > 0 && (
          <p className="callout small">
            {sum.missing} gastos sin tasa, excluidos de este total convertido.
          </p>
        )}
        <p className="small">
          Las conversiones son referenciales y conservan la tasa de cada gasto.
        </p>
      </section>
      <div className="row">
        <button
          className="button primary grow"
          onClick={() => setEditing(null)}
        >
          <Plus size={18} /> Registrar gasto
        </button>
        <button
          className="icon-button outlined"
          aria-label="Mostrar filtros"
          aria-expanded={filters}
          onClick={() => setFilters(!filters)}
        >
          <SlidersHorizontal />
        </button>
      </div>
      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Buscar gastos…"
      />
      {filters && (
        <section className="card filter-grid">
          <Field label="Moneda original">
            <select
              value={originalCurrency}
              onChange={(e) => setOriginalCurrency(e.target.value)}
            >
              <option value="">Todas</option>
              <option>CAD</option>
              <option>USD</option>
            </select>
          </Field>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={onlyAttachments}
              onChange={(e) => setOnlyAttachments(e.target.checked)}
            />{" "}
            Con adjunto local
          </label>
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
              {Array.from(
                new Set([...people, ...records.map((r) => r.data.paidBy)]),
              ).map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Método de pago">
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="">Todos</option>
              {paymentMethods.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
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
          <button
            className="button secondary"
            onClick={() => {
              setCategory("");
              setPerson("");
              setMethod("");
              setStart("");
              setEnd("");
              setSearch("");
              setOnlyAttachments(false);
              setOriginalCurrency("");
            }}
          >
            Limpiar filtros
          </button>
        </section>
      )}
      {filtered.length === 0 ? (
        <Empty
          title={
            records.length
              ? "Sin coincidencias"
              : "La bitácora está por comenzar"
          }
          body={
            records.length
              ? "Prueba con otros filtros."
              : "Registra el primer gasto de esta aventura."
          }
          action={records.length ? undefined : () => setEditing(null)}
        />
      ) : (
        <div className="stack compact">
          {filtered.map((r) => {
            const approx = convert(
              r.data.amountMinor,
              r.data.currency,
              r.data.currency === "CAD" ? "USD" : "CAD",
              r.data.rate,
            );
            return (
              <article key={r.id} className="card expense-card">
                <button className="record-main" onClick={() => setEditing(r)}>
                  <span className="record-icon">
                    <ReceiptText />
                  </span>
                  <span className="grow">
                    <strong>{r.data.description}</strong>
                    {attachments[r.id] > 0 && (
                      <small>{attachments[r.id]} adjuntos locales</small>
                    )}
                    <small>
                      {r.data.date} · {r.data.category}
                    </small>
                    <small>
                      {r.data.paidBy} · {r.data.paymentMethod}
                    </small>
                    <span className="money-line">
                      {formatMoney(r.data.amountMinor, r.data.currency)}
                    </span>
                    {approx !== null && (
                      <small>
                        ≈{" "}
                        {formatMoney(
                          approx,
                          r.data.currency === "CAD" ? "USD" : "CAD",
                        )}
                      </small>
                    )}
                  </span>
                </button>
                <div className="row spread">
                  <Badge
                    tone={
                      pending.some((p) => p.record.id === r.id)
                        ? "amber"
                        : "green"
                    }
                  >
                    {pending.some((p) => p.record.id === r.id)
                      ? "Pendiente de enviar"
                      : "Sincronizado"}
                  </Badge>
                  <button
                    className="icon-button"
                    aria-label={`Eliminar ${r.data.description}`}
                    onClick={async () => {
                      if (
                        confirm(`¿Eliminar el gasto «${r.data.description}»?`)
                      )
                        try {
                          await remove(r);
                        } catch {
                          notify("No se pudo eliminar. Intenta de nuevo.");
                        }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <section className="card stack">
        <h2>Reportes y exportación</h2>
        <button
          className="button secondary"
          onClick={() => downloadCsv(filtered)}
        >
          <Download size={18} /> Descargar CSV {filters ? "filtrado" : ""}
        </button>
        <Link href="/reportes" className="button secondary">
          Resumen imprimible / PDF
        </Link>
        <Link href="/estadisticas" className="text-button">
          Ver estadísticas por día y categoría →
        </Link>
      </section>
      {editing !== undefined && (
        <ExpenseForm
          existing={editing || undefined}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  );
}
