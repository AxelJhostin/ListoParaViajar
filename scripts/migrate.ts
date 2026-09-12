import { config } from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
const envFlag = process.argv.indexOf("--env-file");
const envFile = envFlag >= 0 ? process.argv[envFlag + 1] : ".env.local";
if (!envFile) throw new Error("Indica un archivo después de --env-file");
config({ path: envFile, quiet: true });
const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) throw new Error("Configura DATABASE_URL_UNPOOLED en .env.local");
const pool = new Pool({ connectionString: url });
try {
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  console.log("Migraciones aplicadas.");
} catch {
  console.error(
    "No se pudieron aplicar las migraciones. Comprueba conexión y permisos.",
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
