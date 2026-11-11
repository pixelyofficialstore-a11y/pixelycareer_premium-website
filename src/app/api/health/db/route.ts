import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, dbError } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Database check: 200 when a query answers within 8 seconds, otherwise 503 with the real error. */
export async function GET() {
  const t = Date.now();
  try {
    await Promise.race([db().execute(sql`select 1`), new Promise((_, no) => setTimeout(() => no(new Error("timeout after 8s")), 8000))]);
    return NextResponse.json({ ok: true, db: "up", ms: Date.now() - t });
  } catch (e) {
    const error = dbError(e);
    console.error("health/db failed:", error);
    return NextResponse.json({ ok: false, db: "down", error }, { status: 503 });
  }
}
