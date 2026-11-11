import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq, isNotNull, lt } from "drizzle-orm";
import { db, orders } from "@/lib/db";
import { env } from "@/lib/server/env";
import { fail } from "@/lib/server/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Carts with a WhatsApp number and no activity for 1 hour become abandoned. Vercel Cron sends Authorization: Bearer CRON_SECRET. */
export async function GET(req: Request) {
  const secret = env("CRON_SECRET");
  const got = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? req.headers.get("x-cron-secret") ?? "";
  if (got.length !== secret.length || !timingSafeEqual(Buffer.from(got), Buffer.from(secret))) return fail(401, "Unauthorized.");
  try {
    const rows = await db().update(orders).set({ status: "abandoned", updatedAt: new Date() })
      .where(and(eq(orders.status, "cart"), isNotNull(orders.whatsapp), lt(orders.lastActivityAt, new Date(Date.now() - 60 * 60 * 1000))))
      .returning({ id: orders.id });
    return NextResponse.json({ ok: true, abandoned: rows.length });
  } catch (e) {
    console.error("abandoned cron failed:", e instanceof Error ? e.message : "unknown");
    return fail(500, "Something went wrong.");
  }
}
