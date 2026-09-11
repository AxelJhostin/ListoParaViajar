import { eq, sql } from "drizzle-orm";
import { database } from "./db/client";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { operations, records } from "./db/schema";
import type { Mutation, TripRecord } from "../domain/models";
export async function applyMutation(
  op: Mutation,
  db: NodePgDatabase = database(),
) {
  return db.transaction(async (tx) => {
    // Serialize writes to the same record, including first insert and retry.
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${op.record.id}))`,
    );
    const [receipt] = await tx
      .select()
      .from(operations)
      .where(eq(operations.id, op.opId));
    if (receipt) {
      if (receipt.recordId !== op.record.id)
        throw new Error("Operation identifier already used");
      return { record: receipt.result, conflict: false };
    }
    const [current] = await tx
      .select()
      .from(records)
      .where(eq(records.id, op.record.id));
    if (
      (current?.version || 0) !== op.baseVersion ||
      (current && current.kind !== op.record.kind)
    )
      return { record: (current || null) as TripRecord | null, conflict: true };
    const next: TripRecord = {
      ...op.record,
      version: op.baseVersion + 1,
      updatedAt: new Date().toISOString(),
    };
    await tx
      .insert(records)
      .values(next)
      .onConflictDoUpdate({ target: records.id, set: next });
    await tx
      .insert(operations)
      .values({ id: op.opId, recordId: next.id, result: next });
    return { record: next, conflict: false };
  });
}
