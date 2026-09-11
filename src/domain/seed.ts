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
    "Manta → Quito",
    "Quito → Colombia",
    "Colombia → Toronto",
    "Toronto → Colombia",
    "Colombia → Quito",
    "Quito → Manta",
  ];
  route.forEach((description, index) =>
    add("leg", {
      description,
      direction: index < 3 ? "Ida" : "Regreso",
      order: index,
      date: index === 0 ? "2026-09-14" : "",
      notes:
        index === 2
          ? "Llegada prevista a Toronto: 15 de septiembre, aproximadamente 06:00. Aeropuerto por confirmar."
          : index === 4
            ? "Llegada a Ecuador prevista para el 25 de septiembre."
            : "",
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
