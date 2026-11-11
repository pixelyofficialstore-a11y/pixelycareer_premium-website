import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { env } from "@/lib/server/env";

type Db = ReturnType<typeof drizzle<typeof schema>>;
const g = globalThis as unknown as { __pxDb?: Db };

/** Supabase transaction pooler (port 6543): no prepared statements, a small pool per instance, dead sockets dropped by the timeouts. */
export function db(): Db {
  if (!g.__pxDb) g.__pxDb = drizzle(postgres(env("DATABASE_URL"), { prepare: false, max: 10, idle_timeout: 20, connect_timeout: 10, max_lifetime: 60 * 5 }), { schema });
  return g.__pxDb;
}
export * from "./schema";
