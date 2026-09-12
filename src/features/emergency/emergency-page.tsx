"use client";

import { Download, Printer, ShieldAlert } from "lucide-react";
import { useRecords, useTrip } from "@/components/trip-provider";
import { Badge, PageHeading } from "@/components/ui";
import { downloadBlob } from "@/features/reports/export";
import { travelers } from "@/domain/models";

const fullNames: Record<(typeof travelers)[number], string> = {
  Axel: "Axel Hernández Menéndez",
  Sebastián: "Sebastián Hernández Menéndez",
  Abuelita: "Sumba Abuelita",
};

export function EmergencyPage() {
  const legs = useRecords("leg").sort((a, b) => a.data.order - b.data.order);
  const documents = useRecords("document");
  const information = useRecords("info");
  const { lastSync, pending } = useTrip();

  function textPackage() {
    const lines = [
      "LISTO PARA VIAJAR · PAQUETE DE EMERGENCIA",
      `Generado: ${new Date().toLocaleString("es-EC")}`,
      "",
      "VIAJEROS",
      ...travelers.map((traveler) => `- ${fullNames[traveler]}`),
      "",
      "VUELOS",
      ...legs.flatMap((record) => [
        `${record.data.date} ${record.data.time} · ${record.data.flight} · ${record.data.description}`,
        `  ${record.data.airport}${record.data.terminal ? ` · ${record.data.terminal}` : ""}`,
        `  Confirmados: ${record.data.confirmedTravelers.join(", ") || "Ninguno"}`,
      ]),
      "",
      "INFORMACIÓN IMPORTANTE",
      ...information.flatMap((record) => [
        `${record.data.description}: ${record.data.value || "Pendiente"}`,
        ...(record.data.notes ? [`  ${record.data.notes}`] : []),
      ]),
      "",
      "DOCUMENTOS",
      ...travelers.flatMap((traveler) => [
        fullNames[traveler],
        ...documents
          .filter((record) => record.data.person === traveler)
          .map(
            (record) =>
              `- ${record.data.description}: ${record.data.status}${record.data.expires ? ` · vence ${record.data.expires}` : ""}`,
          ),
      ]),
      "",
      "Este archivo puede contener información privada. Protégelo y elimina copias innecesarias.",
    ];
    return lines.join("\n");
  }

  return (
    <div className="stack emergency-page">
      <PageHeading
        eyebrow="COPIA OFFLINE"
        title="Paquete de emergencia"
        body="La información esencial en una sola vista."
      />
      <div className="callout small no-print">
        <ShieldAlert size={17} aria-hidden="true" />
        Guarda una copia antes de salir. El archivo puede contener información
        privada y no reemplaza los documentos originales.
      </div>
      <div className="two-cols no-print">
        <button
          className="button primary"
          onClick={() =>
            downloadBlob(
              new Blob([textPackage()], { type: "text/plain;charset=utf-8" }),
              "paquete-emergencia-viaje.txt",
            )
          }
        >
          <Download size={18} /> Descargar TXT
        </button>
        <button className="button secondary" onClick={() => window.print()}>
          <Printer size={18} /> Imprimir / PDF
        </button>
      </div>
      <section className="card emergency-cover">
        <p className="eyebrow">LISTO PARA VIAJAR · TORONTO 2026</p>
        <h2>Información familiar de emergencia</h2>
        <p className="small muted">
          Generado {new Date().toLocaleString("es-EC")} · {pending.length}{" "}
          cambios pendientes
          {lastSync
            ? ` · última sincronización ${new Date(lastSync).toLocaleString("es-EC")}`
            : ""}
        </p>
      </section>
      <section className="card stack compact">
        <h2>Viajeros</h2>
        {travelers.map((traveler) => (
          <p key={traveler}>{fullNames[traveler]}</p>
        ))}
      </section>
      <section className="card stack compact">
        <h2>Itinerario</h2>
        {legs.map((record) => (
          <article className="emergency-row" key={record.id}>
            <div className="row spread align-start">
              <strong>
                {record.data.flight} · {record.data.description}
              </strong>
              <Badge
                tone={
                  record.data.confirmedTravelers.length === travelers.length
                    ? "green"
                    : "amber"
                }
              >
                {record.data.confirmedTravelers.length}/{travelers.length}
              </Badge>
            </div>
            <p className="small">
              {record.data.date} · {record.data.time} · {record.data.timezone}
            </p>
            <p className="small muted">{record.data.airport}</p>
            {record.data.terminal && (
              <p className="small muted">{record.data.terminal}</p>
            )}
          </article>
        ))}
      </section>
      <section className="card stack compact">
        <h2>Información importante</h2>
        {information.map((record) => (
          <article className="emergency-row" key={record.id}>
            <strong>{record.data.description}</strong>
            <p className="preserve">
              {record.data.value || "Pendiente de completar"}
            </p>
            {record.data.notes && (
              <p className="small muted preserve">{record.data.notes}</p>
            )}
          </article>
        ))}
      </section>
      <section className="card stack compact">
        <h2>Estado de documentos</h2>
        {travelers.map((traveler) => (
          <div className="document-group" key={traveler}>
            <strong>{fullNames[traveler]}</strong>
            {documents
              .filter((record) => record.data.person === traveler)
              .map((record) => (
                <div className="row spread" key={record.id}>
                  <span className="small">{record.data.description}</span>
                  <Badge
                    tone={record.data.status === "Listo" ? "green" : "amber"}
                  >
                    {record.data.status}
                  </Badge>
                </div>
              ))}
          </div>
        ))}
      </section>
      <p className="small muted">
        Los adjuntos permanecen en este dispositivo y no se incrustan en este
        paquete. Conserva boletos y documentos originales por separado.
      </p>
    </div>
  );
}
