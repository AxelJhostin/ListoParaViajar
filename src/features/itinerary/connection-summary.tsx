"use client";

import {
  AlertTriangle,
  Check,
  CircleAlert,
  TimerReset,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { connectionWindows, formatMinutes } from "@/domain/itinerary";
import { travelers, type TripRecord } from "@/domain/models";

export function ConnectionSummary({
  records,
}: {
  records: TripRecord<"leg">[];
}) {
  const connections = connectionWindows(records.map((record) => record.data));
  if (!connections.length) return null;
  return (
    <section className="card stack compact connection-summary">
      <div className="row spread align-start">
        <div>
          <p className="eyebrow">TIEMPO ENTRE VUELOS</p>
          <h2>Conexiones calculadas</h2>
        </div>
        <TimerReset size={22} aria-hidden="true" />
      </div>
      {connections.map(({ leg, next, minutes, level }) => {
        const location = next.description.split(" → ")[0];
        const tone =
          level === "comfortable"
            ? "green"
            : level === "review"
              ? "amber"
              : "red";
        const label =
          level === "comfortable"
            ? "Cómoda"
            : level === "review"
              ? "Revisar"
              : "Ajustada";
        return (
          <div className="connection-row" key={`${leg.flight}-${next.flight}`}>
            {level === "comfortable" ? (
              <Check size={18} aria-hidden="true" />
            ) : level === "review" ? (
              <CircleAlert size={18} aria-hidden="true" />
            ) : (
              <AlertTriangle size={18} aria-hidden="true" />
            )}
            <div className="grow">
              <strong>{location}</strong>
              <p className="small muted">
                {leg.flight} → {next.flight} · {formatMinutes(minutes)}{" "}
                disponibles
              </p>
            </div>
            <Badge tone={tone}>{label}</Badge>
          </div>
        );
      })}
      <p className="small muted">
        Orientación interna: verde desde 2 h 30 min, amarillo desde 1 h 30 min.
        No sustituye los tiempos mínimos indicados por la aerolínea o el
        aeropuerto.
      </p>
    </section>
  );
}

export function TravelerConfirmation({
  record,
  onToggle,
  busy,
}: {
  record: TripRecord<"leg">;
  onToggle: (traveler: (typeof travelers)[number]) => void;
  busy: boolean;
}) {
  return (
    <div className="traveler-confirmation">
      <div className="row spread">
        <span className="small row">
          <Users size={16} aria-hidden="true" /> Pasajeros confirmados
        </span>
        <strong className="small">
          {record.data.confirmedTravelers.length} / {travelers.length}
        </strong>
      </div>
      <div className="confirmation-grid">
        {travelers.map((traveler) => {
          const confirmed = record.data.confirmedTravelers.includes(traveler);
          return (
            <button
              type="button"
              key={traveler}
              className={`confirmation-pill ${confirmed ? "confirmed" : ""}`}
              aria-pressed={confirmed}
              disabled={busy}
              onClick={() => onToggle(traveler)}
            >
              {confirmed && <Check size={14} aria-hidden="true" />}
              {traveler}
            </button>
          );
        })}
      </div>
    </div>
  );
}
