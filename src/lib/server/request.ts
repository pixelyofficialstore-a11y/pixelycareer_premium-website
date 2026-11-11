import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "./env";

export const fail = (status = 400, error = "Please check your details and try again.") => NextResponse.json({ error }, { status });

export function clientIp(req: Request) {
  return (req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "").split(",")[0].trim().slice(0, 60) || null;
}
export function ipCountry(req: Request, market?: string | null) {
  const h = (req.headers.get("cf-ipcountry") ?? req.headers.get("x-vercel-ip-country") ?? "").toUpperCase().slice(0, 2);
  if (h && h !== "XX") return h;
  return market ? ({ us: "US", uk: "GB", ae: "AE", sa: "SA", pk: "PK" } as Record<string, string>)[market] ?? null : null;
}

/** Per-IP fixed window rate limit, kept in memory per server instance. */
const hits = new Map<string, { n: number; at: number }>();
export function limited(req: Request, bucket: string, max: number, windowMs = 60_000) {
  const key = `${bucket}:${clientIp(req) ?? "unknown"}`;
  const now = Date.now();
  const h = hits.get(key);
  if (!h || now - h.at > windowMs) { hits.set(key, { n: 1, at: now }); return false; }
  h.n++;
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v.at > windowMs) hits.delete(k);
  return h.n > max;
}

/** Cloudflare Turnstile check for final submits. */
export async function turnstileOk(token: string | null | undefined, req: Request) {
  if (!token) return false;
  const body = new URLSearchParams({ secret: env("TURNSTILE_SECRET_KEY"), response: token });
  const ip = clientIp(req);
  if (ip) body.set("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    return ((await r.json()) as { success?: boolean }).success === true;
  } catch { return false; }
}

/** Pakistan numbers become +92XXXXXXXXXX; others keep their country code. Returns null when invalid. */
export function normalizePhone(raw: string, code = "") {
  const c = code.replace(/[^\d]/g, "");
  let d = raw.replace(/[^\d]/g, "");
  if (c === "92" || (!c && /^(92)?0?3\d{9}$/.test(d))) {
    d = d.replace(/^92(?=3\d{9}$)/, "").replace(/^0/, "");
    return /^3\d{9}$/.test(d) ? `+92${d}` : null;
  }
  d = `${c}${d.replace(/^0/, "")}`;
  return /^\d{8,15}$/.test(d) ? `+${d}` : null;
}

/** First-touch attribution saved by the proxy in the px_attr cookie, plus the request's IP, UA and country. */
export async function attribution(req: Request, browser: { fbp?: string | null; fbc?: string | null; market?: string | null } = {}) {
  const jar = await cookies();
  let a: Record<string, unknown> = {};
  try { a = JSON.parse(jar.get("px_attr")?.value ?? "{}"); } catch {}
  const s = (k: string, max = 300) => (typeof a[k] === "string" ? (a[k] as string).slice(0, max) : "") || null;
  const fbclid = s("fbclid");
  const fbc = browser.fbc || jar.get("_fbc")?.value || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : "");
  return {
    utmSource: s("utm_source", 100), utmMedium: s("utm_medium", 100), utmCampaign: s("utm_campaign", 150), utmContent: s("utm_content", 150), utmTerm: s("utm_term", 150),
    fbclid, gclid: s("gclid"), landingPage: s("landing_page", 500), referrer: s("referrer", 500),
    fbp: (browser.fbp || jar.get("_fbp")?.value || "").slice(0, 100) || null, fbc: fbc.slice(0, 400) || null,
    clientIp: clientIp(req), userAgent: (req.headers.get("user-agent") ?? "").slice(0, 300) || null, country: ipCountry(req, browser.market),
  };
}

/** Shared zod pieces. `website` is the honeypot: real visitors never fill it. */
export const opt = (max = 200) => z.string().trim().max(max).optional().nullable().transform((v) => v || null);
export const req_ = (max = 200) => z.string().trim().min(1).max(max);
export const honeypot = { website: z.string().max(0).optional() };

export async function readJson<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<z.infer<T> | null> {
  try {
    const r = schema.safeParse(await req.json());
    return r.success ? r.data : null;
  } catch { return null; }
}
