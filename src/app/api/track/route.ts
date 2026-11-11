import { NextResponse } from "next/server";
import { dbError } from "@/lib/db";
import { isConfigError } from "@/lib/server/env";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, events, orders } from "@/lib/db";
import { sendCapi } from "@/lib/server/capi";
import { attribution, fail, honeypot, limited, opt, readJson } from "@/lib/server/request";
import { currentOrderId } from "@/lib/server/orders";

export const runtime = "nodejs";

const META = { view_content: "ViewContent", add_to_cart: "AddToCart", initiate_checkout: "InitiateCheckout", add_payment_info: "AddPaymentInfo", lead: "Lead" } as const;

const body = z.object({
  ...honeypot,
  name: z.enum(["view_content", "add_to_cart", "initiate_checkout", "add_payment_info", "lead"]),
  eventId: z.string().trim().min(4).max(120),
  sessionId: opt(80),
  market: opt(4),
  value: z.number().min(0).max(10_000_000).optional(),
  currency: opt(3),
  page: opt(500),
  meta: z.record(z.string().max(40), z.union([z.string().max(200), z.number(), z.boolean(), z.array(z.string().max(60)).max(20)])).optional(),
  fbp: opt(100), fbc: opt(400),
});

/**
 * Funnel log. Writes the event and mirrors it to the Conversions API with the same event id the browser Pixel used,
 * so Meta deduplicates them. Purchase is never accepted here: it only comes from /api/mark-paid.
 */
export async function POST(req: Request) {
  if (limited(req, "track", 60)) return fail(429);
  const b = await readJson(req, body);
  if (!b || b.website) return fail();
  try {
    const attr = await attribution(req, { fbp: b.fbp, fbc: b.fbc });
    const orderId = await currentOrderId().catch(() => null);
    let user: { whatsapp: string | null; email: string | null } = { whatsapp: null, email: null };
    if (orderId) {
      const [o] = await db().select({ whatsapp: orders.whatsapp, email: orders.email }).from(orders).where(and(eq(orders.id, orderId))).limit(1);
      if (o) user = o;
    }
    await db().insert(events).values({
      ...attr, market: b.market, sessionId: b.sessionId, orderId, name: b.name,
      value: b.value != null ? String(b.value) : null, currency: b.currency, page: b.page, meta: { ...(b.meta ?? {}), event_id: b.eventId },
    });
    await sendCapi(META[b.name], b.eventId, { phone: user.whatsapp, email: user.email, ip: attr.clientIp, ua: attr.userAgent, fbp: attr.fbp, fbc: attr.fbc, country: attr.country },
      { ...(b.value != null ? { value: b.value, currency: b.currency } : {}), ...(b.meta?.content_name ? { content_name: b.meta.content_name } : {}), ...(Array.isArray(b.meta?.content_ids) ? { content_ids: b.meta.content_ids, content_type: "product" } : {}) },
      b.page);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("track failed:", dbError(e));
    if (isConfigError(e)) return fail(503, "This is not configured yet. Please message us on WhatsApp.");
    return fail(500);
  }
}
