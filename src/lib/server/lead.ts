import "server-only";
import { dbError } from "@/lib/db";
import { isConfigError } from "@/lib/server/env";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendCapi } from "./capi";
import { adSource, attribution, fail, honeypot, limited, normalizePhone, opt, readJson, turnstileOk } from "./request";

/** Common fields of every lead form: contact, market, Turnstile token, honeypot, Meta browser ids. */
export const leadBase = {
  ...honeypot,
  turnstile: z.string().max(4096),
  market: opt(4),
  name: z.string().trim().min(1).max(120),
  code: opt(6),
  whatsapp: z.string().trim().min(5).max(30),
  email: z.string().trim().max(160).email().optional().nullable().or(z.literal("")).transform((v) => v || null),
  notes: opt(1000),
  fbp: opt(100), fbc: opt(400),
  eventId: opt(120),
};

/**
 * Shared flow for the lead forms: rate limit, zod, honeypot, Turnstile, phone normalisation, attribution, insert.
 * Returns only a short reference, never the row.
 */
export async function handleLead<S extends z.ZodObject<typeof leadBase & z.ZodRawShape>>(
  req: Request, bucket: string, schema: S, insert: (data: z.infer<S> & { whatsapp: string }, attr: Awaited<ReturnType<typeof attribution>>) => Promise<{ id: string } | undefined>,
) {
  if (limited(req, bucket, 5)) return fail(429, "Too many requests. Please wait a moment.");
  const b = (await readJson(req, schema)) as (z.infer<S> & z.infer<z.ZodObject<typeof leadBase>>) | null;
  if (!b || b.website) return fail();
  const whatsapp = normalizePhone(b.whatsapp, b.code ?? "");
  if (!whatsapp) return fail(400, "Enter a valid WhatsApp number.");
  try {
    if (!(await turnstileOk(b.turnstile, req))) return fail(400, "Please complete the security check.");
    const ad = await adSource();
    const attr = { ...(await attribution(req, { fbp: b.fbp, fbc: b.fbc, market: (b as { market?: string }).market })), ...ad, leadEventId: b.eventId ?? null };
    const row = await insert({ ...b, whatsapp }, attr);
    if (!row) return fail();
    // Conversions API Lead, same event_id as the browser Pixel. Fire and forget.
    const lead = bucket === "partners" ? "partner" : "cv_review";
    void sendCapi("Lead", b.eventId ?? `Lead_${row.id}`, { phone: whatsapp, email: b.email, name: b.name, ip: attr.clientIp, ua: attr.userAgent, fbp: attr.fbp, fbc: attr.fbc, country: attr.country, externalId: [ad.externalId, row.id] },
      { content_name: lead, content_ids: [lead], content_type: "product", value: 0, currency: "PKR" }, req.headers.get("referer"));
    return NextResponse.json({ ref: row.id.slice(0, 8).toUpperCase() });
  } catch (e) {
    console.error(`${bucket} insert failed:`, dbError(e));
    if (isConfigError(e)) return fail(503, "This is not configured yet. Please message us on WhatsApp.");
    return fail(500, "Something went wrong. Please try again.");
  }
}
