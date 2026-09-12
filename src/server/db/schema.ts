import {
  pgTable,
  uuid,
  text,
  jsonb,
  integer,
  boolean,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { TripRecord } from "../../domain/models";
export const records = pgTable(
  "trip_records",
  {
    id: uuid("id").primaryKey(),
    kind: text("kind").notNull(),
    data: jsonb("data").$type<TripRecord["data"]>().notNull(),
    version: integer("version").notNull().default(1),
    deleted: boolean("deleted").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("records_kind_idx").on(t.kind, t.deleted),
    check("record_version_positive", sql`${t.version}>0`),
    check(
      "record_kind_valid",
      sql`${t.kind} in ('expense','packing','purchase','document','idea','leg','info','journal')`,
    ),
  ],
);
export const operations = pgTable("sync_operations", {
  id: uuid("id").primaryKey(),
  recordId: uuid("record_id").notNull(),
  result: jsonb("result").$type<TripRecord>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
