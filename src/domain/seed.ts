import { defaults, type TripRecord, type Kind, type DataMap } from "./models";
export function initialRecords(): TripRecord[] {
  let i = 0;
  const rows: TripRecord[] = [];
  function add<K extends Kind>(kind: K, data: Partial<DataMap[K]>) {
    rows.push({
      id: `00000000-0000-4000-8000-${String(++i).padStart(12, "0")}`,
      kind,
      data: { ...defaults(kind), ...data },
      version: 1,
      updatedAt: new Date().toISOString(),
      deleted: false,
    } as TripRecord);
  }
  const route = [
    {
      description: "Manta → Quito",
      date: "2026-09-14",
      time: "14:20",
      airport: "Manta Eloy Alfaro Intl (MEC) → Quito Mariscal Sucre Intl (UIO)",
      airline: "Avianca",
      flight: "AV1695",
      timezone: "America/Guayaquil",
      departureType: "Traslado al aeropuerto" as const,
      airportLeadMinutes: 120,
      notes:
        "Llega 15:10 · duración 00:50. Horario según el boleto de Axel; confirmar los demás pasajeros.",
    },
    {
      description: "Quito → Bogotá",
      date: "2026-09-14",
      time: "18:50",
      airport: "Quito Mariscal Sucre Intl (UIO) → Bogotá El Dorado Intl (BOG)",
      airline: "Avianca",
      flight: "AV8376",
      terminal: "Llegada: Terminal 1 (BOG)",
      timezone: "America/Guayaquil",
      departureType: "Conexión" as const,
      airportLeadMinutes: 45,
      notes:
        "Llega 20:20 · duración 01:30. Horario según el boleto de Axel; confirmar los demás pasajeros.",
    },
    {
      description: "Bogotá → Toronto",
      date: "2026-09-15",
      time: "00:05",
      airport: "Bogotá El Dorado Intl (BOG) → Toronto Pearson Intl (YYZ)",
      airline: "Avianca",
      flight: "AV254",
      terminal: "Terminal 1 (BOG y YYZ)",
      timezone: "America/Bogota",
      departureType: "Conexión" as const,
      airportLeadMinutes: 45,
      notes:
        "Llega 07:20 · duración 06:15. Horario según el boleto de Axel; confirmar los demás pasajeros.",
    },
    {
      description: "Toronto → Bogotá",
      date: "2026-09-25",
      time: "08:55",
      airport: "Toronto Pearson Intl (YYZ) → Bogotá El Dorado Intl (BOG)",
      airline: "Avianca",
      flight: "AV255",
      terminal: "Terminal 1 (YYZ y BOG)",
      timezone: "America/Toronto",
      departureType: "Traslado al aeropuerto" as const,
      airportLeadMinutes: 180,
      notes:
        "Llega 14:05 · duración 06:10. Horario según el boleto de Axel; confirmar los demás pasajeros.",
    },
    {
      description: "Bogotá → Quito",
      date: "2026-09-25",
      time: "16:00",
      airport: "Bogotá El Dorado Intl (BOG) → Quito Mariscal Sucre Intl (UIO)",
      airline: "Avianca",
      flight: "AV8373",
      terminal: "Salida: Terminal 1 (BOG)",
      timezone: "America/Bogota",
      departureType: "Conexión" as const,
      airportLeadMinutes: 45,
      notes:
        "Llega 17:40 · duración 01:40. Horario según el boleto de Axel; confirmar los demás pasajeros.",
    },
    {
      description: "Quito → Manta",
      date: "2026-09-25",
      time: "19:20",
      airport: "Quito Mariscal Sucre Intl (UIO) → Manta Eloy Alfaro Intl (MEC)",
      airline: "Avianca",
      flight: "AV1696",
      timezone: "America/Guayaquil",
      departureType: "Conexión" as const,
      airportLeadMinutes: 45,
      notes:
        "Llega 20:10 · duración 00:50. Horario según el boleto de Axel; confirmar los demás pasajeros.",
    },
  ];
  route.forEach((leg, index) =>
    add("leg", {
      ...leg,
      direction: index < 3 ? "Ida" : "Regreso",
      order: index,
    }),
  );
  for (const person of ["Axel", "Sebastián", "Abuelita"])
    for (const description of [
      "Cédula de identidad",
      "Pasaporte",
      "Documentos de ida",
      "Documentos de regreso",
    ])
      add("document", {
        description,
        person,
        stage:
          description === "Documentos de ida"
            ? "Ida"
            : description.includes("regreso")
              ? "Regreso"
              : "Todo el viaje",
      });
  for (const description of [
    "Dirección del hospedaje en Toronto",
    "Contacto de emergencia local",
    "Información del seguro",
    "Notas del viaje",
  ])
    add("info", { description });
  return rows;
}
