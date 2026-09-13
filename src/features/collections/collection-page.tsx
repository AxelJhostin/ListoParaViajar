"use client";
import { useState } from "react";
import Link from "@/components/nav-link";
import {
  Plus,
  Trash2,
  ArrowRight,
  Check,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { useRecords, useTrip } from "@/components/trip-provider";
import {
  Badge,
  Empty,
  PageHeading,
  Progress,
  SearchBox,
  Field,
} from "@/components/ui";
import { RecordForm } from "./record-form";
import { collections, type CollectionKind } from "./config";
import { type DataMap, type TripRecord } from "@/domain/models";
import { formatMoney } from "@/domain/money";
import {
  FlightReminderSettings,
  FlightTimer,
} from "@/features/itinerary/flight-timer";
import {
  ConnectionSummary,
  TravelerConfirmation,
} from "@/features/itinerary/connection-summary";
export function CollectionPage({ kind }: { kind: CollectionKind }) {
  const rows = useRecords(kind),
    { save, remove, notify, records } = useTrip();
  const config = collections[kind];
  const [editing, setEditing] = useState<TripRecord | null | undefined>(),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState(""),
    [status, setStatus] = useState(""),
    [confirming, setConfirming] = useState("");
  const filterKey =
    kind === "purchase"
      ? "recipient"
      : kind === "idea" || kind === "journal"
        ? "city"
        : kind === "leg"
          ? "direction"
          : "person";
  const [direction, setDirection] = useState("");
  const [extraFilter, setExtraFilter] = useState("");
  const extraKey = kind === "packing" ? "category" : "stage";
  const extraValues = Array.from(
    new Set(
      rows.map((r) =>
        String((r.data as Record<string, unknown>)[extraKey] || ""),
      ),
    ),
  ).filter(Boolean);
  const values = Array.from(
    new Set(
      rows.map((r) =>
        String((r.data as Record<string, unknown>)[filterKey] || ""),
      ),
    ),
  ).filter(Boolean);
  const filtered = rows
    .filter((r) => {
      const d = r.data as Record<string, unknown>;
      return (
        JSON.stringify(d).toLowerCase().includes(search.toLowerCase()) &&
        (!filter || d[filterKey] === filter) &&
        (!extraFilter || d[extraKey] === extraFilter) &&
        (!status ||
          (kind === "packing"
            ? d.done
              ? "Empacado"
              : "Pendiente"
            : d.status) === status) &&
        (!direction || d.direction === direction)
      );
    })
    .sort((a, b) =>
      kind === "leg"
        ? Number((a.data as DataMap["leg"]).order) -
          Number((b.data as DataMap["leg"]).order)
        : b.updatedAt.localeCompare(a.updatedAt),
    );
  const completed = rows.filter((r) => {
    const d = r.data as Record<string, unknown>;
    return (
      d.done === true ||
      d.status === "Listo" ||
      d.status === "Empacado" ||
      d.status === "Realizada"
    );
  }).length;
  const purchases = filtered as TripRecord<"purchase">[];
  const packingPeople =
    kind === "packing"
      ? Array.from(
          new Set(rows.map((r) => (r.data as DataMap["packing"]).person)),
        )
      : [];
  async function quick(r: TripRecord) {
    try {
      const d = { ...r.data } as Record<string, unknown>;
      if (kind === "packing") d.done = !d.done;
      else if (config.statuses)
        d.status =
          config.statuses[
            (config.statuses.indexOf(String(d.status)) + 1) %
              config.statuses.length
          ];
      await save(
        kind,
        d as DataMap[CollectionKind],
        r as TripRecord<CollectionKind>,
      );
    } catch {
      notify("No se pudo guardar el cambio.");
    }
  }
  async function toggleTraveler(
    record: TripRecord<"leg">,
    traveler: DataMap["leg"]["confirmedTravelers"][number],
  ) {
    const key = `${record.id}:${traveler}`;
    setConfirming(key);
    try {
      const current = record.data.confirmedTravelers;
      await save(
        "leg",
        {
          ...record.data,
          confirmedTravelers: current.includes(traveler)
            ? current.filter((name) => name !== traveler)
            : [...current, traveler],
        },
        record,
      );
    } catch {
      notify("No se pudo guardar la confirmación.");
    } finally {
      setConfirming("");
    }
  }
  return (
    <div className="stack">
      <PageHeading
        eyebrow="NUESTRA BITÁCORA"
        title={config.title}
        body={config.body}
      />
      {["packing", "document"].includes(kind) && (
        <section className="card stack compact">
          <div className="row spread">
            <strong>
              {completed} de {rows.length} listos
            </strong>
            <Badge tone="green">
              {rows.length ? Math.round((completed / rows.length) * 100) : 0}%
            </Badge>
          </div>
          <Progress value={rows.length ? (completed / rows.length) * 100 : 0} />
          {packingPeople.map((person) => {
            const items = rows.filter(
              (r) => (r.data as DataMap["packing"]).person === person,
            );
            const done = items.filter(
              (r) => (r.data as DataMap["packing"]).done,
            ).length;
            return (
              <div className="row spread small" key={person}>
                <span>{person}</span>
                <strong>
                  {done} / {items.length} empacados
                </strong>
              </div>
            );
          })}
        </section>
      )}
      {kind === "document" && (
        <p className="callout small">
          Lista personal de organización. Completa los documentos según tus
          boletos y la información oficial de tu viaje. Un estado “Listo” es tu
          revisión personal.
        </p>
      )}
      {kind === "leg" && (
        <>
          <div className="callout small">
            <strong>Salida 14 sep · Toronto 15 sep, 07:20 (hora local)</strong>
            <p>
              Regreso a Manta: 25 sep, 20:10. Revisa que los demás pasajeros
              tengan los mismos vuelos antes de viajar.
            </p>
            <Link href="/documentos" className="text-button">
              Revisar documentos esenciales →
            </Link>
          </div>
          <FlightReminderSettings />
          <ConnectionSummary records={rows as TripRecord<"leg">[]} />
        </>
      )}
      <button className="button primary" onClick={() => setEditing(null)}>
        <Plus size={18} /> Agregar{" "}
        {kind === "packing"
          ? "elemento"
          : kind === "purchase"
            ? "compra"
            : kind === "document"
              ? "documento"
              : kind === "idea"
                ? "idea"
                : kind === "leg"
                  ? "trayecto"
                  : kind === "journal"
                    ? "recuerdo"
                    : "información"}
      </button>
      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder={`Buscar en ${config.title.toLowerCase()}…`}
      />
      <div className="filter-grid">
        {["packing", "document"].includes(kind) && (
          <Field label={kind === "packing" ? "Categoría" : "Etapa / trayecto"}>
            <select
              value={extraFilter}
              onChange={(e) => setExtraFilter(e.target.value)}
            >
              <option value="">Todas</option>
              {extraValues.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
        )}
        {values.length > 0 && (
          <Field
            label={
              kind === "purchase"
                ? "Destinatario"
                : kind === "idea" || kind === "journal"
                  ? "Ciudad"
                  : kind === "leg"
                    ? "Dirección"
                    : "Persona"
            }
          >
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">Todos</option>
              {values.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
        )}
        {(config.statuses || kind === "packing") && (
          <Field label="Estado">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              {(config.statuses || ["Pendiente", "Empacado"]).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        )}
        {kind === "packing" && (
          <Field label="Ida / regreso">
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            >
              <option value="">Ambos</option>
              <option>Ida</option>
              <option>Regreso</option>
              <option>Ida y vuelta</option>
            </select>
          </Field>
        )}
      </div>
      {kind === "purchase" && (
        <section
          className="card stack compact"
          aria-label="Totales de compras filtradas"
        >
          <div className="row spread">
            <span>Estimado</span>
            <strong>
              {formatMoney(
                purchases.reduce(
                  (sum, r) => sum + (r.data.estimatedMinor ?? 0),
                  0,
                ),
              )}
            </strong>
          </div>
          <div className="row spread">
            <span>Precio final registrado</span>
            <strong>
              {formatMoney(
                purchases.reduce((sum, r) => sum + (r.data.finalMinor ?? 0), 0),
              )}
            </strong>
          </div>
          <p className="small muted">
            {purchases.length} productos en esta selección ·{" "}
            {purchases.filter((r) => r.data.finalMinor === null).length} sin
            precio final. Valores informativos; no se suman otra vez a Gastos.
          </p>
        </section>
      )}
      {!filtered.length ? (
        <Empty
          title="Todo comienza con una idea"
          body="Agrega un registro o ajusta tus filtros."
          action={() => setEditing(null)}
        />
      ) : (
        filtered.map((r) => {
          const d = r.data as Record<string, unknown>;
          const linked = records.find(
            (e) => e.id === d.expenseId && !e.deleted,
          );
          const expires =
            typeof d.expires === "string" &&
            d.expires &&
            d.expires <= "2026-09-25";
          return (
            <article className="card collection-card" key={r.id}>
              <div className="row align-start">
                <div className="grow">
                  <h2>{String(d.description)}</h2>
                  <p className="small muted">
                    {[
                      d.person,
                      d.recipient,
                      d.city,
                      d.direction,
                      d.stage,
                      d.category,
                      kind === "journal" ? d.date : null,
                      d.mood,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {kind === "packing" && (
                    <p className="small">Cantidad: {String(d.quantity)}</p>
                  )}
                  {kind === "purchase" && (
                    <p className="money-line">
                      {d.finalMinor !== null
                        ? formatMoney(Number(d.finalMinor))
                        : d.estimatedMinor !== null
                          ? `Estimado ${formatMoney(Number(d.estimatedMinor))}`
                          : "Precio por completar"}
                    </p>
                  )}
                  {kind === "info" && (
                    <p className="preserve">
                      {String(d.value) || "Pendiente de completar"}
                    </p>
                  )}
                  {kind === "leg" && (
                    <>
                      <p className="small">
                        {[d.date, d.time, d.airline, d.flight]
                          .filter(Boolean)
                          .join(" · ") || "Información pendiente de completar"}
                      </p>
                      <FlightTimer record={r as TripRecord<"leg">} />
                      <TravelerConfirmation
                        record={r as TripRecord<"leg">}
                        busy={confirming.startsWith(r.id)}
                        onToggle={(traveler) =>
                          void toggleTraveler(r as TripRecord<"leg">, traveler)
                        }
                      />
                    </>
                  )}
                  {d.notes ? (
                    <p className="small muted clamp">{String(d.notes)}</p>
                  ) : null}
                </div>
                <button
                  className="icon-button"
                  aria-label={`Editar ${String(d.description)}`}
                  onClick={() => setEditing(r)}
                >
                  <Pencil size={18} />
                </button>
              </div>
              <div className="row wrap">
                {(kind === "packing" || config.statuses) && (
                  <button
                    className={`badge actionable ${d.done || ["Listo", "Realizada", "Empacado"].includes(String(d.status)) ? "green" : "amber"}`}
                    onClick={() => void quick(r)}
                  >
                    {d.done ? <Check size={15} /> : <ArrowRight size={15} />}{" "}
                    {kind === "packing"
                      ? d.done
                        ? "Empacado"
                        : "Pendiente"
                      : String(d.status)}
                  </button>
                )}
                {d.priority === "Importante" && (
                  <Badge tone="red">Importante</Badge>
                )}
                {d.city === "Montreal" && (
                  <Badge tone="amber">Visita no confirmada</Badge>
                )}
                {expires && (
                  <Badge tone="amber">
                    Revisar vencimiento: {String(d.expires)}
                  </Badge>
                )}
                {kind === "purchase" && (
                  <Badge>
                    {linked
                      ? "Gasto vinculado"
                      : d.expenseId
                        ? "El gasto vinculado fue eliminado"
                        : "No contabilizado como gasto"}
                  </Badge>
                )}
                {d.url ? (
                  <a
                    className="text-button"
                    href={String(d.url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={15} /> Abrir enlace
                  </a>
                ) : null}
              </div>
              <div className="row spread">
                <button className="text-button" onClick={() => setEditing(r)}>
                  Detalles y adjuntos locales
                </button>
                <button
                  className="icon-button"
                  aria-label={`Eliminar ${String(d.description)}`}
                  onClick={async () => {
                    if (confirm(`¿Eliminar «${String(d.description)}»?`))
                      try {
                        await remove(r);
                      } catch {
                        notify("No se pudo eliminar.");
                      }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          );
        })
      )}
      {kind === "purchase" && (
        <p className="callout small">
          Los totales de cuentas se calculan solo con los gastos registrados.
          Cambiar una compra a “Comprado” no genera otro gasto: anótalo en
          Gastos y vincúlalo aquí.
        </p>
      )}
      {editing !== undefined && (
        <RecordForm
          kind={kind}
          existing={editing || undefined}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  );
}
