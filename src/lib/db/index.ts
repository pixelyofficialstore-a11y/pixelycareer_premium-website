import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { env } from "@/lib/server/env";

type Db = ReturnType<typeof drizzle<typeof schema>>;
const g = globalThis as unknown as { __pxDb?: Db };

/** DATABASE_URL, trimmed and checked. Throws a clear message when it is missing or not a URL. */
export function databaseUrl() {
  const url = env("DATABASE_URL").trim();
  try { new URL(url); } catch { throw new Error("DATABASE_URL is not a valid URL. Use the Supabase transaction pooler string (port 6543)."); }
  return url;
}

/** Supabase transaction pooler (port 6543): no prepared statements, a small pool per instance, one per process. */
export function db(): Db {
  if (!g.__pxDb) g.__pxDb = drizzle(postgres(databaseUrl(), { ssl: "require", prepare: false, max: 10, connect_timeout: 10, idle_timeout: 20, max_lifetime: 60 * 5 }), { schema });
  return g.__pxDb;
}

/** The real reason a query failed: drizzle wraps it as "Failed query", the postgres error is in cause. */
export function dbError(e: unknown) {
  const err = e as { message?: string; code?: string; cause?: { message?: string; code?: string } };
  const c = err?.cause ?? err;
  return [c?.code, c?.message ?? err?.message ?? "unknown"].filter(Boolean).join(": ");
}
export * from "./schema";
