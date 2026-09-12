"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "@/components/nav-link";
import {
  AlarmClock,
  BookHeart,
  Check,
  Circle,
  Clock3,
  FileCheck2,
  PlaneTakeoff,
  Route,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useRecords } from "@/components/trip-provider";
import { Badge, PageHeading, Progress } from "@/components/ui";
import {
  connectionWindows,
  formatAtAirport,
  formatCountdown,
  formatMinutes,
  itineraryPreferences,
  nextUpcomingLeg,
  preparationTimes,
} from "@/domain/itinerary";
import { travelers } from "@/domain/models";

const clocks = [
  ["Ecuador", "America/Guayaquil", "🇪🇨"],
  ["Bogotá", "America/Bogota", "🇨🇴"],
  ["Toronto", "America/Toronto", "🇨🇦"],
] as const;

function WorldClocks() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <section className="card stack compact">
      <div className="row spread">
        <div>
          <p className="eyebrow">HORA LOCAL</p>
          <h2>Tres lugares, un mismo viaje</h2>
        </div>
        <Clock3 size={22} aria-hidden="true" />
      </div>
      <div className="clock-grid">
        {clocks.map(([label, timeZone, flag]) => (
          <div key={timeZone}>
            <span aria-hidden="true">{flag}</span>
            <strong>
              {new Intl.DateTimeFormat("es-EC", {
                timeZone,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hourCycle: "h23",
              }).format(now)}
            </strong>
            <small>{label}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function TripChecklist({ flightId }: { flightId: string }) {
  const documents = useRecords("document");
  const packing = useRecords("packing");
  const legs = useRecords("leg");
  const storageKey = `trip-today-checklist:${flightId}`;
  const [manual, setManual] = useState<string[]>([]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setManual(Array.isArray(saved) ? saved : []);
    } catch {
      setManual([]);
    }
  }, [storageKey]);
  const automatic = {
    documents:
      documents.length > 0 &&
      documents.every((record) => record.data.status === "Listo"),
    packing: packing.length > 0 && packing.every((record) => record.data.done),
    travelers: legs.every((record) =>
      travelers.every((traveler) =>
        record.data.confirmedTravelers.includes(traveler),
      ),
    ),
    transfer: legs
      .filter(
        (record) =>
          itineraryPreferences(record.data).departureType ===
          "Traslado al aeropuerto",
      )
      .every((record) => itineraryPreferences(record.data).travelMinutes > 0),
  };
  const items = [
    [
      "documents",
      "Documentos de los tres viajeros listos",
      automatic.documents,
    ],
    ["travelers", "Todos confirmados en los seis vuelos", automatic.travelers],
    ["packing", "Equipaje marcado como preparado", automatic.packing],
    ["transfer", "Duración de traslados completada", automatic.transfer],
    [
      "checkin",
      "Check-in y pases de abordar guardados",
      manual.includes("checkin"),
    ],
    ["phones", "Celulares y baterías cargados", manual.includes("phones")],
  ] as const;
  const done = items.filter(([, , value]) => value).length;
  function toggle(key: string, automaticValue: boolean) {
    if (["documents", "travelers", "packing", "transfer"].includes(key)) return;
    const next = automaticValue
      ? manual.filter((item) => item !== key)
      : [...manual, key];
    setManual(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }
  return (
    <section className="card stack compact">
      <div className="row spread">
        <div>
          <p className="eyebrow">ANTES DE SALIR</p>
          <h2>Checklist inteligente</h2>
        </div>
        <Badge tone={done === items.length ? "green" : "amber"}>
          {done}/{items.length}
        </Badge>
      </div>
      <Progress value={(done / items.length) * 100} />
      <div className="smart-checklist">
        {items.map(([key, label, checked]) => {
          const automaticItem = [
            "documents",
            "travelers",
            "packing",
            "transfer",
          ].includes(key);
          return (
            <button
              type="button"
              key={key}
              className={checked ? "checked" : ""}
              aria-pressed={checked}
              onClick={() => toggle(key, checked)}
              title={automaticItem ? "Se completa desde su módulo" : undefined}
            >
              {checked ? <Check size={17} /> : <Circle size={17} />}
              <span>{label}</span>
              {automaticItem && <small>Automático</small>}
            </button>
          );
        })}
      </div>
      <p className="small muted">
        Check-in y carga se guardan solo en este dispositivo; los demás estados
        provienen de los módulos compartidos.
      </p>
    </section>
  );
}

export function TodayPage() {
  const legs = useRecords("leg");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const next = useMemo(
    () =>
      nextUpcomingLeg(
        legs.map((record) => record.data),
        now,
      ),
    [legs, now],
  );
  const connections = useMemo(
    () => connectionWindows(legs.map((record) => record.data)),
    [legs],
  );
  const timing = next ? preparationTimes(next.leg) : null;
  const preferences = next ? itineraryPreferences(next.leg) : null;
  const connection = next
    ? connections.find((item) => item.next.flight === next.leg.flight)
    : undefined;
  return (
    <div className="stack today-page">
      <PageHeading
        eyebrow="CENTRO DE MANDO"
        title="Hoy en el viaje"
        body="Lo importante, sin buscar entre pantallas."
      />
      {next && timing && preferences ? (
        <section className="card today-flight">
          <div className="row spread align-start">
            <div>
              <p className="eyebrow">PRÓXIMO VUELO · {next.leg.flight}</p>
              <h2>{next.leg.description}</h2>
            </div>
            <PlaneTakeoff size={26} aria-hidden="true" />
          </div>
          <strong className="today-countdown" role="timer">
            {formatCountdown(next.departure - now)}
          </strong>
          <p className="small">
            Sale {next.leg.date} a las {next.leg.time} · {next.leg.timezone}
          </p>
          <div className="today-action">
            <AlarmClock size={20} aria-hidden="true" />
            <div>
              <small>Próxima acción recomendada</small>
              <strong>
                {preferences.departureType === "Conexión"
                  ? "Estar en la puerta"
                  : timing.leave
                    ? "Salir hacia el aeropuerto"
                    : "Llegar al aeropuerto"}{" "}
                :{" "}
                {formatAtAirport(
                  timing.leave ?? timing.ready,
                  next.leg.timezone,
                )}
              </strong>
            </div>
          </div>
          {connection && (
            <p className="small muted">
              Conexión previa en {connection.next.description.split(" → ")[0]}:{" "}
              {formatMinutes(connection.minutes)} disponibles.
            </p>
          )}
          <Link href="/ruta" className="text-button">
            Ver itinerario completo →
          </Link>
        </section>
      ) : (
        <section className="card">
          <h2>No quedan vuelos pendientes</h2>
          <p className="muted">
            El diario y los reportes quedan como memoria del viaje.
          </p>
        </section>
      )}
      <WorldClocks />
      {next && (
        <TripChecklist flightId={next.leg.flight || next.leg.description} />
      )}
      <section className="today-links">
        <Link href="/emergencia" className="card">
          <ShieldCheck size={22} />
          <strong>Paquete de emergencia</strong>
          <small>Vuelos, contactos y documentos</small>
        </Link>
        <Link href="/diario" className="card">
          <BookHeart size={22} />
          <strong>Guardar un recuerdo</strong>
          <small>Historia y fotos del día</small>
        </Link>
        <Link href="/documentos" className="card">
          <FileCheck2 size={22} />
          <strong>Documentos</strong>
          <small>Revisión por viajero</small>
        </Link>
        <Link href="/ruta" className="card">
          <Route size={22} />
          <strong>Ruta completa</strong>
          <small>Conexiones y pasajeros</small>
        </Link>
      </section>
      <div className="callout small">
        <div className="row">
          <Users size={16} aria-hidden="true" />
          <strong>Confirmaciones compartidas</strong>
        </div>
        <p>
          Los checks rápidos del modo Hoy son personales para este dispositivo.
        </p>
      </div>
    </div>
  );
}
