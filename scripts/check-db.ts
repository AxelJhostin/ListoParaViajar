import { config } from "dotenv";
import { Pool } from "pg";
config({ path: ".env.local", quiet: true });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});
try {
  const r = await pool.query(
    "select kind, count(*)::int as count from trip_records where not deleted group by kind",
  );
  console.log("Conexión OK. Registros por módulo:", r.rows);
} catch {
  console.error(
    "No se pudo consultar la base. Revisa variables y migraciones.",
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
