import "server-only";
import { createHash } from "node:crypto";
import { optionalEnv } from "./env";

const sha = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

export type CapiUser = { phone?: string | null; email?: string | null; ip?: string | null; ua?: string | null; fbp?: string | null; fbc?: string | null; country?: string | null };

/** Meta Conversions API. Skipped when the pixel id or token is not set. Never logs personal data. */
export async function sendCapi(name: string, eventId: string, user: CapiUser, custom: Record<string, unknown> = {}, sourceUrl?: string | null) {
  const pixel = optionalEnv("NEXT_PUBLIC_META_PIXEL_ID"), token = optionalEnv("META_CAPI_TOKEN");
  if (!pixel || !token) return false;
  const user_data: Record<string, unknown> = {};
  if (user.phone) user_data.ph = [sha(user.phone.replace(/\D/g, ""))];
  if (user.email) user_data.em = [sha(user.email)];
  if (user.country) user_data.country = [sha(user.country)];
  if (user.ip) user_data.client_ip_address = user.ip;
  if (user.ua) user_data.client_user_agent = user.ua;
  if (user.fbp) user_data.fbp = user.fbp;
  if (user.fbc) user_data.fbc = user.fbc;
  const test = optionalEnv("META_TEST_EVENT_CODE");
  const body = {
    data: [{ event_name: name, event_time: Math.floor(Date.now() / 1000), event_id: eventId, action_source: "website", ...(sourceUrl ? { event_source_url: sourceUrl } : {}), user_data, custom_data: custom }],
    ...(test ? { test_event_code: test } : {}),
  };
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${pixel}/events?access_token=${encodeURIComponent(token)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) console.error(`CAPI ${name} failed with status ${r.status}`);
    return r.ok;
  } catch {
    console.error(`CAPI ${name} request failed`);
    return false;
  }
}
