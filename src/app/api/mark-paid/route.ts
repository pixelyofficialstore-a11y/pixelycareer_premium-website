import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db, events, orders } from "@/lib/db";
import { clearOfferCache } from "@/lib/offer-server";
import { sendCapi } from "@/lib/server/capi";
import { env } from "@/lib/server/env";
import { fail } from "@/lib/server/request";

export const runtime = "nodejs";

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

type Payload = { type?: string; schema?: string; table?: string; record?: { id?: string; status?: string; paid_at?: string | null }; old_record?: { status?: string } | null };

/**
 * Supabase Database Webhook (website.orders, UPDATE). Sends the Conversions API Purchase once:
 * only when the status turns to paid and paid_at is still empty. paid_at is claimed first, so a retry can never send it twice.
 */
export async function POST(req: Request) {
  if (!same(req.headers.get("x-webhook-secret") ?? "", env("CRM_WEBHOOK_SECRET"))) return fail(401, "Unauthorized.");
  let p: Payload;
  try { p = await req.json(); } catch { return fail(); }
  const r = p.record;
  if (p.schema !== "website" || p.table !== "orders" || !r?.id) return NextResponse.json({ ok: true, skipped: "not an order" });
  if (r.status !== "paid" || p.old_record?.status === "paid" || r.paid_at) return NextResponse.json({ ok: true, skipped: "no change to paid" });
  try {
    const [o] = await db().update(orders).set({ paidAt: new Date() })
      .where(and(eq(orders.id, r.id), eq(orders.status, "paid"), isNull(orders.paidAt))).returning();
    if (!o) return NextResponse.json({ ok: true, skipped: "already sent" });
    clearOfferCache();
    const eventId = `Purchase_${o.eventId ?? o.id}`;
    const ids = [o.package, ...o.addons.map((a) => a.id)];
    const sent = await sendCapi("Purchase", eventId, { phone: o.whatsapp, email: o.email, ip: o.clientIp, ua: o.userAgent, fbp: o.fbp, fbc: o.fbc, country: o.country },
      { value: o.total, currency: o.currency, content_ids: ids, content_type: "product", content_name: o.isBundle ? "11.11 Bundle" : o.package, order_id: o.id, num_items: ids.length }, o.landingPage);
    await db().insert(events).values({ market: o.market, orderId: o.id, name: "purchase", value: String(o.total), currency: o.currency, meta: { event_id: eventId, capi_sent: sent } });
    return NextResponse.json({ ok: true, sent });
  } catch (e) {
    console.error("mark-paid failed:", e instanceof Error ? e.message : "unknown");
    return fail(500, "Something went wrong.");
  }
}
