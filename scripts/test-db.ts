import { config } from "dotenv";
import assert from "node:assert/strict";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { applyMutation } from "../src/server/sync-service";
import { defaults, type Mutation } from "../src/domain/models";
const qa = config({
  path: ".env.e2e.local",
  quiet: true,
  processEnv: {},
}).parsed;
if (!qa?.DATABASE_URL_UNPOOLED)
  throw new Error(
    "Configura DATABASE_URL_UNPOOLED en .env.e2e.local apuntando a una rama de QA.",
  );
const pool = new Pool({
  connectionString: qa.DATABASE_URL_UNPOOLED,
  connectionTimeoutMillis: 10000,
});
const rollback = new Error("QA_ROLLBACK");
const id = crypto.randomUUID();
const journalId = crypto.randomUUID();
let passed = false;
try {
  await drizzle(pool).transaction(async (tx) => {
    const record = {
      id,
      kind: "expense" as const,
      data: {
        ...defaults("expense"),
        description: "QA transaction rollback",
        amountMinor: 1500,
      },
      version: 0,
      updatedAt: new Date().toISOString(),
      deleted: false,
    };
    const op: Mutation = { opId: crypto.randomUUID(), record, baseVersion: 0 };
    const first = await applyMutation(op, tx);
    assert.equal(first.record?.version, 1);
    assert.equal(first.conflict, false);
    const retry = await applyMutation(op, tx);
    assert.deepEqual(retry, first);
    const stale = await applyMutation({ ...op, opId: crypto.randomUUID() }, tx);
    assert.equal(stale.conflict, true);
    const updated = await applyMutation(
      {
        opId: crypto.randomUUID(),
        record: { ...record, data: { ...record.data, amountMinor: 2700 } },
        baseVersion: 1,
      },
      tx,
    );
    assert.equal(updated.record?.version, 2);
    const deleted = await applyMutation(
      {
        opId: crypto.randomUUID(),
        record: { ...record, deleted: true },
        baseVersion: 2,
      },
      tx,
    );
    assert.equal(deleted.record?.deleted, true);
    assert.equal(deleted.record?.version, 3);
    const journal = await applyMutation(
      {
        opId: crypto.randomUUID(),
        record: {
          id: journalId,
          kind: "journal",
          data: {
            ...defaults("journal"),
            description: "QA journal rollback",
          },
          version: 0,
          updatedAt: new Date().toISOString(),
          deleted: false,
        },
        baseVersion: 0,
      },
      tx,
    );
    assert.equal(journal.record?.kind, "journal");
    assert.equal(journal.record?.version, 1);
    passed = true;
    throw rollback;
  });
} catch (error) {
  if (error !== rollback) throw error;
} finally {
  const after = await pool.query(
    "select count(*)::int n from trip_records where id=any($1::uuid[])",
    [[id, journalId]],
  );
  const ops = await pool.query(
    "select count(*)::int n from sync_operations where record_id=any($1::uuid[])",
    [[id, journalId]],
  );
  await pool.end();
  assert.equal(after.rows[0].n, 0);
  assert.equal(ops.rows[0].n, 0);
}
assert.equal(passed, true);
console.log(
  "9 comprobaciones PostgreSQL OK: creación, diario, idempotencia, conflicto, edición, borrado lógico y rollback verificado.",
);
