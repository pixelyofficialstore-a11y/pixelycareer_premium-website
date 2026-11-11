import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Railway health check: 200 when the app can reach the database within 5 seconds. */
export async function GET() {
  try {
    await Promise.race([db().execute(sql`select 1`), new Promise((_, no) => setTimeout(() => no(new Error("timeout")), 5000))]);
    return NextResponse.json({ ok: true, db: "up" });
  } catch (e) {
    console.error("health: db check failed:", e instanceof Error ? e.message : "unknown");
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
