import { people } from "@/domain/models";
export type CollectionKind =
  "packing" | "purchase" | "document" | "idea" | "leg" | "info" | "journal";
type FormField = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "time" | "textarea" | "url" | "money";
  options?: readonly string[];
  required?: boolean;
  custom?: boolean;
};
export const collections: Record<
  CollectionKind,
  {
    title: string;
    singular: string;
    body: string;
    fields: FormField[];
    statuses?: string[];
  }
> = {
  packing: {
    title: "Equipaje",
    singular: "Elemento de equipaje",
    body: "Lo que llevamos y lo que vuelve con nosotros.",
    fields: [
      { key: "description", label: "Elemento", required: true },
      {
        key: "person",
        label: "Persona",
        options: [...people.slice(0, 3), "Compartido"],
      },
      {
        key: "category",
        label: "Categoría",
        options: [
          "Ropa",
          "Documentos",
          "Medicamentos",
          "Electrónicos",
          "Higiene",
          "Accesorios",
          "Otros",
        ],
        custom: true,
      },
      {
        key: "direction",
        label: "Trayecto",
        options: ["Ida", "Regreso", "Ida y vuelta"],
      },
      { key: "quantity", label: "Cantidad", type: "number" },
    ],
  },
  purchase: {
    title: "Compras y regalos",
    singular: "Compra / regalo",
    body: "Un detalle para cada persona que queremos.",
    statuses: ["Pendiente", "Comprado", "Empacado"],
    fields: [
      { key: "description", label: "Producto", required: true },
      {
        key: "recipient",
        label: "Destinatario",
        options: people,
        custom: true,
      },
      { key: "estimatedMinor", label: "Precio estimado (CAD)", type: "money" },
      { key: "finalMinor", label: "Precio final (CAD)", type: "money" },
      {
        key: "priority",
        label: "Prioridad",
        options: ["Normal", "Importante"],
      },
      {
        key: "status",
        label: "Estado",
        options: ["Pendiente", "Comprado", "Empacado"],
      },
    ],
  },
  document: {
    title: "Documentos esenciales",
    singular: "Documento",
    body: "Todo a mano antes de cada trayecto.",
    statuses: ["Pendiente", "Revisado", "Listo"],
    fields: [
      { key: "description", label: "Documento", required: true },
      {
        key: "person",
        label: "Persona",
        options: [...people.slice(0, 3), "Todos"],
        custom: true,
      },
      {
        key: "stage",
        label: "Etapa / trayecto",
        options: [
          "Todo el viaje",
          "Ida",
          "Regreso",
          "Manta → Quito",
          "Quito → Colombia",
          "Colombia → Toronto",
          "Toronto → Colombia",
          "Colombia → Quito",
          "Quito → Manta",
        ],
        custom: true,
      },
      {
        key: "status",
        label: "Estado",
        options: ["Pendiente", "Revisado", "Listo"],
      },
      { key: "expires", label: "Vencimiento (opcional)", type: "date" },
    ],
  },
  idea: {
    title: "Días libres",
    singular: "Lugar / actividad",
    body: "Ideas para decidir sobre la marcha.",
    statuses: ["Pendiente", "Considerada", "Realizada", "Descartada"],
    fields: [
      { key: "description", label: "Lugar o actividad", required: true },
      {
        key: "city",
        label: "Ciudad",
        options: ["Toronto", "Montreal"],
        custom: true,
      },
      { key: "address", label: "Dirección / ubicación" },
      { key: "url", label: "Enlace (opcional)", type: "url" },
      {
        key: "priority",
        label: "Prioridad",
        options: ["Normal", "Importante"],
      },
      {
        key: "status",
        label: "Estado",
        options: ["Pendiente", "Considerada", "Realizada", "Descartada"],
      },
    ],
  },
  leg: {
    title: "Ruta y vuelos",
    singular: "Trayecto",
    body: "De Manta a Toronto, paso a paso.",
    fields: [
      { key: "description", label: "Origen → destino", required: true },
      { key: "direction", label: "Dirección", options: ["Ida", "Regreso"] },
      { key: "order", label: "Orden en la ruta", type: "number" },
      { key: "date", label: "Fecha local de salida", type: "date" },
      { key: "time", label: "Hora local de salida", type: "time" },
      { key: "timezone", label: "Zona horaria (ej. America/Guayaquil)" },
      {
        key: "departureType",
        label: "Tipo de salida",
        options: ["Traslado al aeropuerto", "Conexión"],
      },
      {
        key: "airportLeadMinutes",
        label: "Anticipación recomendada (minutos)",
        type: "number",
      },
      {
        key: "travelMinutes",
        label: "Traslado estimado al aeropuerto (minutos)",
        type: "number",
      },
      { key: "arrivalDate", label: "Fecha local de llegada", type: "date" },
      { key: "arrivalTime", label: "Hora local de llegada", type: "time" },
      {
        key: "arrivalTimezone",
        label: "Zona horaria de llegada (ej. America/Toronto)",
      },
      { key: "airport", label: "Aeropuerto" },
      { key: "airline", label: "Aerolínea / transporte" },
      { key: "flight", label: "Número de vuelo" },
      { key: "terminal", label: "Terminal / puerta" },
    ],
  },
  info: {
    title: "Información del viaje",
    singular: "Dato del viaje",
    body: "Hospedaje, contactos y notas importantes.",
    fields: [
      { key: "description", label: "Nombre", required: true },
      { key: "value", label: "Información", type: "textarea" },
    ],
  },
  journal: {
    title: "Diario del viaje",
    singular: "Recuerdo del día",
    body: "Momentos, historias y fotos para volver a vivir la aventura.",
    fields: [
      { key: "description", label: "Título del recuerdo", required: true },
      { key: "date", label: "Fecha", type: "date", required: true },
      { key: "city", label: "Ciudad", required: true },
      {
        key: "mood",
        label: "Cómo se sintió el día",
        options: ["Increíble", "Feliz", "Tranquilo", "Cansado", "Difícil"],
      },
    ],
  },
};
