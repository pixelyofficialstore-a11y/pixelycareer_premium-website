import { NextResponse } from "next/server";
import { dbError } from "@/lib/db";
import { isConfigError } from "@/lib/server/env";
import { z } from "zod";
import { clearOfferCache } from "@/lib/offer-server";
import { ownUpload } from "@/lib/server/cloudinary";
import { and, eq, notInArray } from "drizzle-orm";
import { db, orders } from "@/lib/db";
import { ORDER_COOKIE, orderBody, saveOrder } from "@/lib/server/orders";
import { MARKETS } from "@/config/markets";
import { sendCapi } from "@/lib/server/capi";
import { adSource, attribution, fail, limited, normalizePhone, opt, readJson, turnstileOk } from "@/lib/server/request";

export const runtime = "nodejs";

const body = orderBody.extend({
  name: z.string().trim().min(1).max(120),
  whatsapp: z.string().trim().min(5).max(30),
  terms: z.literal(true),
  turnstile: z.string().max(4096),
  cvUrl: opt(500), cvPublicId: opt(200),
  paymentMethod: z.enum(["easypaisa", "ubl", "jazzcash"]).optional().nullable(),
  screenshotUrl: opt(500), screenshotPublicId: opt(200),
  transactionId: opt(80),
});

/** Final order submit. Status: payment_submitted when proof of payment came with it, otherwise new. */
export async function POST(req: Request) {
  if (limited(req, "submit", 8)) return fail(429, "Too many requests. Please wait a moment.");
  const b = await readJson(req, body);
  if (!b || b.website) return fail();
  if (!normalizePhone(b.whatsapp, b.code ?? "")) return fail(400, "Enter a valid WhatsApp number.");
  try {
    // Idempotent: a retry of an order that already went through returns the same order.
    if (b.eventId) {
      const [done] = await db().select({ id: orders.id, eventId: orders.eventId, total: orders.total }).from(orders)
        .where(and(eq(orders.eventId, b.eventId), notInArray(orders.status, ["cart", "abandoned"]))).limit(1);
      if (done) {
        const res = NextResponse.json({ ref: done.id.slice(0, 8).toUpperCase(), eventId: done.eventId, total: done.total, repeat: true });
        res.cookies.delete(ORDER_COOKIE);
        return res;
      }
    }
    if (!(await turnstileOk(b.turnstile, req))) return fail(400, "Please complete the security check.");
    const pk = b.market === "pk";
    // PK sends CVs on WhatsApp; other markets may attach one. Uploads must be ours.
    const cvOk = !pk && ownUpload("cv", b.cvUrl, b.cvPublicId);
    const shotOk = pk && ownUpload("payment", b.screenshotUrl, b.screenshotPublicId);
    if (pk && b.payChoice === "now" && !shotOk && !b.transactionId) return fail(400, "Upload your payment screenshot.");
    const paid = pk && b.payChoice === "now" && (shotOk || !!b.transactionId);
    const attr = await attribution(req, { fbp: b.fbp, fbc: b.fbc, market: b.market });
    const ad = await adSource();
    const sourceUrl = (req.headers.get("referer") ?? "").slice(0, 500) || null;
    const row = await saveOrder(req, { ...b, step: 4 }, {
      fbp: attr.fbp, fbc: attr.fbc, clientIp: attr.clientIp, userAgent: attr.userAgent, eventSourceUrl: sourceUrl, ...ad,
      status: paid ? "payment_submitted" : "new",
      cvUrl: cvOk ? b.cvUrl : null, cvPublicId: cvOk ? b.cvPublicId : null,
      paymentMethod: paid ? b.paymentMethod ?? null : null,
      paymentScreenshotUrl: shotOk ? b.screenshotUrl : null, paymentScreenshotPublicId: shotOk ? b.screenshotPublicId : null,
      transactionId: paid ? b.transactionId : null,
    });
    if (!row) return fail();
    clearOfferCache();
    // Conversions API AddPaymentInfo for both options (Pay now / Order on WhatsApp), valued at the discounted total.
    // The browser Pixel fires the same event_id (AddPaymentInfo_<ref>), so Meta deduplicates them. Orders never send Lead.
    const ref = row.id.slice(0, 8).toUpperCase();
    const apiId = `AddPaymentInfo_${ref}`;
    await db().update(orders).set({ leadEventId: apiId }).where(eq(orders.id, row.id));
    void sendCapi("AddPaymentInfo", apiId, { phone: normalizePhone(b.whatsapp ?? "", b.code ?? ""), email: b.email, name: b.name, ip: attr.clientIp, ua: attr.userAgent, fbp: attr.fbp, fbc: attr.fbc, country: attr.country, externalId: [ad.externalId, row.id] },
      { value: row.total, currency: MARKETS[b.market as keyof typeof MARKETS]?.currency ?? "PKR", content_ids: [b.package], content_name: b.package, content_type: "product", content_category: b.payChoice === "now" ? "pay_now" : "whatsapp" }, sourceUrl);
    const res = NextResponse.json({ ref, eventId: row.eventId, total: row.total });
    res.cookies.delete(ORDER_COOKIE);
    return res;
  } catch (e) {
    console.error("order submit failed:", dbError(e));
    if (isConfigError(e)) return fail(503, "This is not configured yet. Please message us on WhatsApp.");
    return fail(500, "We could not save your order. Please try again.");
  }
}
