import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { attachDatabasePool } from "@vercel/functions";
let pool: Pool | undefined;
export function database() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_NOT_CONFIGURED");
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 10000,
    });
    if (process.env.VERCEL) attachDatabasePool(pool);
  }
  return drizzle(pool);
}
