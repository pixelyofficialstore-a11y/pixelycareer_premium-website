import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { attribution, fail, honeypot, limited, normalizePhone, opt, readJson, turnstileOk } from "./request";

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
    const attr = await attribution(req, { fbp: b.fbp, fbc: b.fbc, market: (b as { market?: string }).market });
    const row = await insert({ ...b, whatsapp }, attr);
    if (!row) return fail();
    return NextResponse.json({ ref: row.id.slice(0, 8).toUpperCase() });
  } catch (e) {
    console.error(`${bucket} insert failed:`, e instanceof Error ? e.message : "unknown");
    return fail(500, "Something went wrong. Please try again.");
  }
}
