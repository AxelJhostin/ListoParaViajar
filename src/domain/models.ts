import { z } from "zod";

export const categories = [
  "Comida",
  "Transporte",
  "Compras",
  "Regalos",
  "Actividades",
  "Hospedaje",
  "Salud",
  "Otros",
] as const;
export const travelers = ["Axel", "Sebastián", "Abuelita"] as const;
export const people = [
  "Axel",
  "Sebastián",
  "Abuelita",
  "Mamá",
  "Papá",
] as const;
export const paymentMethods = [
  "Efectivo",
  "Crédito",
  "Débito",
  "Transferencia",
  "Apple/Google Pay",
  "Otro",
] as const;
export const kinds = [
  "expense",
  "packing",
  "purchase",
  "document",
  "idea",
  "leg",
  "info",
  "journal",
] as const;
export type Kind = (typeof kinds)[number];
const text = z.string().trim().min(1, "Este campo es obligatorio").max(250);
const note = z.string().max(4000).default("");
const money = z.number().int().min(0).max(99_999_999_999);
const dateOnly = z.iso.date();
const timeOnly = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida");
export const rateSchema = z.object({
  value: z.number().positive().max(100),
  date: z.string().min(1),
  fetchedAt: z.string(),
  source: z.string().max(100),
  manual: z.boolean().default(false),
});
export type Rate = z.infer<typeof rateSchema>;
export const expenseSchema = z.object({
  description: text,
  amountMinor: money.refine((n) => n > 0, "Ingresa un monto mayor a cero"),
  currency: z.enum(["CAD", "USD"]),
  rate: rateSchema.nullable(),
  category: z.enum(categories),
  paidBy: text,
  paymentMethod: z.enum(paymentMethods),
  date: dateOnly,
  time: timeOnly,
  notes: note,
});
export const packingSchema = z.object({
  description: text,
  person: text,
  category: text,
  direction: z.enum(["Ida", "Regreso"]),
  quantity: z.number().int().min(1).max(999),
  done: z.boolean(),
  notes: note,
});
export const purchaseSchema = z.object({
  description: text,
  recipient: text,
  estimatedMinor: money.nullable(),
  finalMinor: money.nullable(),
  status: z.enum(["Pendiente", "Comprado", "Empacado"]),
  priority: z.enum(["Normal", "Importante"]),
  expenseId: z.string().uuid().nullable(),
  notes: note,
});
export const documentSchema = z.object({
  description: text,
  person: text,
  stage: text,
  status: z.enum(["Pendiente", "Revisado", "Listo"]),
  expires: z.union([z.literal(""), dateOnly]).default(""),
  notes: note,
});
export const ideaSchema = z.object({
  description: text,
  city: text,
  status: z.enum(["Pendiente", "Considerada", "Realizada", "Descartada"]),
  priority: z.enum(["Normal", "Importante"]),
  address: z.string().max(500).default(""),
  url: z.union([
    z.literal(""),
    z.url().refine((v) => /^https?:\/\//.test(v), "Usa un enlace HTTP o HTTPS"),
  ]),
  notes: note,
});
export const legSchema = z.object({
  description: text,
  direction: z.enum(["Ida", "Regreso"]),
  order: z.number().int().min(0).max(50),
  date: z.union([z.literal(""), dateOnly]),
  time: z.union([z.literal(""), timeOnly]),
  airport: z.string().max(250),
  airline: z.string().max(250),
  flight: z.string().max(100),
  terminal: z.string().max(100),
  timezone: z.string().max(100),
  departureType: z
    .enum(["Traslado al aeropuerto", "Conexión"])
    .default("Conexión"),
  airportLeadMinutes: z.number().int().min(0).max(720).default(45),
  travelMinutes: z.number().int().min(0).max(720).default(0),
  arrivalDate: z.union([z.literal(""), dateOnly]).default(""),
  arrivalTime: z.union([z.literal(""), timeOnly]).default(""),
  arrivalTimezone: z.string().max(100).default(""),
  confirmedTravelers: z.array(z.enum(travelers)).max(3).default([]),
  notes: note,
});
export const infoSchema = z.object({
  description: text,
  value: z.string().max(4000),
  notes: note,
});
export const journalSchema = z.object({
  description: text,
  date: dateOnly,
  city: text,
  mood: z.enum(["Increíble", "Feliz", "Tranquilo", "Cansado", "Difícil"]),
  notes: note,
});
export const schemas = {
  expense: expenseSchema,
  packing: packingSchema,
  purchase: purchaseSchema,
  document: documentSchema,
  idea: ideaSchema,
  leg: legSchema,
  info: infoSchema,
  journal: journalSchema,
};
export type DataMap = { [K in Kind]: z.infer<(typeof schemas)[K]> };
export type TripRecord<K extends Kind = Kind> = {
  id: string;
  kind: K;
  data: DataMap[K];
  version: number;
  updatedAt: string;
  deleted: boolean;
};
export type Mutation = {
  opId: string;
  record: TripRecord;
  baseVersion: number;
};
export const recordSchema = z
  .object({
    id: z.string().uuid(),
    kind: z.enum(kinds),
    data: z.unknown(),
    version: z.number().int().nonnegative(),
    updatedAt: z.string(),
    deleted: z.boolean(),
  })
  .transform((record, ctx) => {
    const data = schemas[record.kind].safeParse(record.data);
    if (!data.success) {
      ctx.addIssue({
        code: "custom",
        message: data.error.issues.map((i) => i.message).join("; "),
      });
      return z.NEVER;
    }
    return { ...record, data: data.data } as TripRecord;
  });
export const mutationSchema = z.object({
  opId: z.string().uuid(),
  baseVersion: z.number().int().nonnegative(),
  record: recordSchema,
});
export function defaults<K extends Kind>(kind: K): DataMap[K] {
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Toronto",
  }).format(now);
  const data: DataMap = {
    expense: {
      description: "",
      amountMinor: 0,
      currency: "CAD",
      rate: null,
      category: "Comida",
      paidBy: "Axel",
      paymentMethod: "Efectivo",
      date,
      time: new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Toronto",
      }).format(now),
      notes: "",
    },
    packing: {
      description: "",
      person: "Axel",
      category: "Ropa",
      direction: "Ida",
      quantity: 1,
      done: false,
      notes: "",
    },
    purchase: {
      description: "",
      recipient: "Mamá",
      estimatedMinor: null,
      finalMinor: null,
      status: "Pendiente",
      priority: "Normal",
      expenseId: null,
      notes: "",
    },
    document: {
      description: "",
      person: "Axel",
      stage: "Todo el viaje",
      status: "Pendiente",
      expires: "",
      notes: "",
    },
    idea: {
      description: "",
      city: "Toronto",
      status: "Pendiente",
      priority: "Normal",
      address: "",
      url: "",
      notes: "",
    },
    leg: {
      description: "",
      direction: "Ida",
      order: 0,
      date: "",
      time: "",
      airport: "",
      airline: "",
      flight: "",
      terminal: "",
      timezone: "",
      departureType: "Traslado al aeropuerto",
      airportLeadMinutes: 120,
      travelMinutes: 0,
      arrivalDate: "",
      arrivalTime: "",
      arrivalTimezone: "",
      confirmedTravelers: [],
      notes: "",
    },
    info: { description: "", value: "", notes: "" },
    journal: {
      description: "",
      date,
      city: "Toronto",
      mood: "Feliz",
      notes: "",
    },
  };
  return data[kind];
}
