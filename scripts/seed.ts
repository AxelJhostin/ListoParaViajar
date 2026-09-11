import { config } from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { records } from "../src/server/db/schema";
import { initialRecords } from "../src/domain/seed";
config({ path: ".env.local", quiet: true });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await drizzle(pool)
    .insert(records)
    .values(initialRecords())
    .onConflictDoNothing();
  console.log(
    "Ruta, documentos y datos por completar preparados. Los gastos permanecen vacíos.",
  );
} catch {
  console.error(
    "No se pudo preparar el viaje. Ejecuta primero db:migrate y verifica la conexión.",
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
