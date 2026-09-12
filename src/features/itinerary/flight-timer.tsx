"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, Clock3, MapPin } from "lucide-react";
import type { TripRecord } from "@/domain/models";
import {
  departureTimestamp,
  formatAtAirport,
  formatCountdown,
  itineraryPreferences,
  nextReminderThreshold,
  preparationTimes,
  reminderLabel,
  reminderThresholds,
} from "@/domain/itinerary";

const deliveredPrefix = "trip-flight-reminders:";

function deliveredFor(id: string) {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(deliveredPrefix + id) || "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter((value): value is number => typeof value === "number")
      : [];
  } catch {
    return [];
  }
}

function storeDelivered(id: string, values: number[]) {
  localStorage.setItem(deliveredPrefix + id, JSON.stringify(values));
}

async function deviceNotification(title: string, body: string, tag: string) {
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;
  const registration =
    "serviceWorker" in navigator
      ? await navigator.serviceWorker.getRegistration()
      : undefined;
  if (registration) await registration.showNotification(title, { body, tag });
  else new Notification(title, { body, tag });
}

export function FlightReminderMonitor({
  records,
  notify,
}: {
  records: TripRecord[];
  notify: (message: string) => void;
}) {
  useEffect(() => {
    const check = () => {
      const now = Date.now();
      const canNotifyDevice =
        "Notification" in window && Notification.permission === "granted";
      if (document.visibilityState !== "visible" && !canNotifyDevice) return;
      for (const record of records) {
        if (record.kind !== "leg" || record.deleted) continue;
        const leg = record as TripRecord<"leg">;
        const departure = departureTimestamp(leg.data);
        if (departure === null) continue;
        const remaining = departure - now;
        const delivered = deliveredFor(leg.id);
        const threshold = nextReminderThreshold(remaining, delivered);
        if (threshold === null) continue;
        const due = reminderThresholds.filter(
          (candidate) => remaining / 60_000 <= candidate,
        );
        storeDelivered(leg.id, Array.from(new Set([...delivered, ...due])));
        const flight = leg.data.flight || leg.data.description;
        const message = `${flight} sale en ${reminderLabel(threshold)}.`;
        if (document.visibilityState === "visible") notify(message);
        void deviceNotification(
          `Vuelo ${flight} en ${reminderLabel(threshold)}`,
          `${leg.data.description} · salida ${leg.data.time}`,
          `flight-${leg.id}-${threshold}`,
        );
      }
    };
    check();
    const timer = window.setInterval(check, 30_000);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, [notify, records]);
  return null;
}

export function FlightReminderSettings() {
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");

  useEffect(() => {
    setPermission(
      "Notification" in window ? Notification.permission : "unsupported",
    );
  }, []);

  async function requestPermission() {
    setPermission(await Notification.requestPermission());
  }

  return (
    <section className="card stack compact reminder-settings">
      <div className="row align-start">
        <span className="timer-icon" aria-hidden="true">
          {permission === "granted" ? (
            <BellRing size={20} />
          ) : (
            <Bell size={20} />
          )}
        </span>
        <div className="grow">
          <h2>Avisos de salida</h2>
          <p className="small muted">
            La app avisa 24 h, 6 h, 1 h y 15 min antes. Los avisos internos
            funcionan mientras la app siga abierta.
          </p>
        </div>
      </div>
      {permission === "default" && (
        <button className="button secondary full" onClick={requestPermission}>
          <Bell size={17} /> Activar avisos del dispositivo
        </button>
      )}
      {permission === "granted" && (
        <p className="small green-text">
          Avisos del dispositivo activados en este equipo.
        </p>
      )}
      {permission === "denied" && (
        <p className="small muted">
          El navegador bloqueó las notificaciones. Puedes habilitarlas desde los
          permisos del sitio; los avisos dentro de la app continúan activos.
        </p>
      )}
      {permission === "unsupported" && (
        <p className="small muted">
          Este navegador no ofrece notificaciones. El temporizador y los avisos
          dentro de la app sí funcionan.
        </p>
      )}
      <p className="small muted">
        Sin un servicio externo, un navegador puede suspender los avisos cuando
        la app está completamente cerrada.
      </p>
    </section>
  );
}

export function FlightTimer({ record }: { record: TripRecord<"leg"> }) {
  const [now, setNow] = useState(() => Date.now());
  const { data } = record;
  const timing = preparationTimes(data);
  const preferences = itineraryPreferences(data);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!timing)
    return (
      <p className="timer-unavailable small muted">
        Agrega fecha, hora y una zona horaria válida para activar el
        temporizador.
      </p>
    );

  const remaining = timing.departure - now;
  return (
    <div className={`flight-timer ${remaining <= 0 ? "departed" : ""}`}>
      <div className="row spread align-start">
        <div>
          <p className="eyebrow">CUENTA REGRESIVA</p>
          <strong role="timer" aria-label={`Tiempo hasta ${data.description}`}>
            {formatCountdown(remaining)}
          </strong>
        </div>
        <Clock3 size={21} aria-hidden="true" />
      </div>
      <div className="timer-advice small">
        <MapPin size={16} aria-hidden="true" />
        <span>
          {preferences.departureType === "Conexión"
            ? "Estar en la puerta"
            : timing.leave
              ? "Salir hacia el aeropuerto"
              : "Llegar al aeropuerto"}
          :{" "}
          <strong>
            {formatAtAirport(timing.leave ?? timing.ready, data.timezone)}
          </strong>
        </span>
      </div>
      {preferences.departureType === "Traslado al aeropuerto" &&
        !timing.leave && (
          <p className="small muted">
            Agrega la duración del traslado para calcular a qué hora salir.
          </p>
        )}
      <p className="small muted">
        Margen configurado: {preferences.airportLeadMinutes} min
        {timing.leave ? ` · traslado: ${preferences.travelMinutes} min` : ""}.
      </p>
    </div>
  );
}
