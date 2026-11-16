import "server-only";
import { createHash } from "node:crypto";
import { optionalEnv } from "./env";

const sha = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

export type CapiUser = { phone?: string | null; email?: string | null; ip?: string | null; ua?: string | null; fbp?: string | null; fbc?: string | null; country?: string | null; name?: string | null; externalId?: (string | null | undefined)[] };

/** The only event names the website may send. Purchase is the CRM's. Anything else is refused and logged. */
export const CAPI_EVENTS = ["PageView", "ViewContent", "AddToCart", "InitiateCheckout", "AddPaymentInfo", "Lead", "Contact", "Schedule"] as const;
export const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|facebookexternalhit|bingpreview|googleother|python|curl|wget|phantom|puppeteer|playwright|selenium/i;

/** Meta Conversions API. Skipped when the pixel id or token is not set. Never logs personal data. */
export async function sendCapi(name: string, eventId: string, user: CapiUser, custom: Record<string, unknown> = {}, sourceUrl?: string | null) {
  const pixel = optionalEnv("NEXT_PUBLIC_META_PIXEL_ID"), token = optionalEnv("META_CAPI_ACCESS_TOKEN") || optionalEnv("META_CAPI_TOKEN");
  if (!(CAPI_EVENTS as readonly string[]).includes(name) || !eventId) {
    console.warn("capi: refused event without a valid event_name", JSON.stringify({ name: String(name).slice(0, 60), eventId: String(eventId ?? "").slice(0, 60) }));
    return false;
  }
  if (user.ua && BOT_UA.test(user.ua)) return false;
  if (sourceUrl && /[?&]test=1(&|$)/.test(sourceUrl)) return false;
  if (!pixel || !token) return false;
  const test = optionalEnv("META_TEST_EVENT_CODE");
  // Local machines only send when a test event code is set.
  if (!test && sourceUrl && /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(sourceUrl)) return false;
  const user_data: Record<string, unknown> = {};
  const ext = (user.externalId ?? []).filter((v): v is string => !!v);
  if (ext.length) user_data.external_id = ext.map(sha);
  if (user.phone) user_data.ph = [sha(user.phone.replace(/\D/g, ""))];
  if (user.email) user_data.em = [sha(user.email)];
  const [fn, ...rest] = (user.name ?? "").trim().split(/\s+/).filter(Boolean);
  if (fn) user_data.fn = [sha(fn)];
  if (rest.length) user_data.ln = [sha(rest[rest.length - 1])];
  if (user.country) user_data.country = [sha(user.country)];
  if (user.ip) user_data.client_ip_address = user.ip;
  if (user.ua) user_data.client_user_agent = user.ua;
  if (user.fbp) user_data.fbp = user.fbp;
  if (user.fbc) user_data.fbc = user.fbc;
  // Match quality: name the fields this event is missing (names only, never values). fbc is optional (only after an ad click).
  const missing = [!user_data.client_ip_address && "client_ip_address", !user_data.client_user_agent && "client_user_agent", !user_data.fbp && "fbp", !user_data.external_id && "external_id", !sourceUrl && "event_source_url"].filter(Boolean);
  if (missing.length) console.warn(`capi: ${name} is missing ${missing.join(", ")}`);
  const body = {
    data: [{ event_name: name, event_time: Math.floor(Date.now() / 1000), event_id: eventId, action_source: "website", ...(sourceUrl ? { event_source_url: sourceUrl } : {}), user_data, custom_data: custom }],
    ...(test ? { test_event_code: test } : {}),
  };
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${pixel}/events?access_token=${encodeURIComponent(token)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(5000) });
    if (!r.ok) console.error(`CAPI ${name} failed with status ${r.status}: ${(await r.text().catch(() => "")).slice(0, 300)}`);
    return r.ok;
  } catch {
    console.error(`CAPI ${name} request failed`);
    return false;
  }
}
