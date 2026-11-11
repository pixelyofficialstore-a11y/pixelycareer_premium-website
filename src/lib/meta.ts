/**
 * Meta Pixel + Conversions API, one dataset: NEXT_PUBLIC_META_PIXEL_ID is the only source of the id.
 * track() fires the browser Pixel and mirrors the event to /api/track (Conversions API) with the same event_id,
 * so Meta deduplicates them. Purchase is never sent from the website: the CRM sends it after payment is verified.
 */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type Fbq = (...a: unknown[]) => void;
let enabled = false;
/** Turned on by <Analytics /> once it decides the Pixel may run on this host. */
export function enableMeta() { enabled = true; }

const cookie = (n: string) => (typeof document === "undefined" ? null : document.cookie.match(new RegExp(`(?:^|; )${n}=([^;]+)`))?.[1] ?? null);

/** A stable anonymous id for this browser (external_id). Shared with the server through the px_vid cookie. */
export function visitorId() {
  let id = cookie("px_vid");
  if (!id) {
    id = `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    document.cookie = `px_vid=${id}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  }
  return id;
}

export const newEventId = (_name?: string) => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`);
export type MetaUser = { email?: string | null; phone?: string | null; firstName?: string | null; lastName?: string | null };

const SERVER_NAMES = { PageView: "page_view", ViewContent: "view_content", AddToCart: "add_to_cart", InitiateCheckout: "initiate_checkout", AddPaymentInfo: "add_payment_info", Lead: "lead" } as const;
export type MetaEvent = keyof typeof SERVER_NAMES;
export type MetaParams = { value?: number; currency?: string; content_ids?: string[]; content_name?: string; content_type?: string; num_items?: number };

/** Browser Pixel + server mirror. Never throws, never blocks. `server: false` when the server sends it itself (Lead). */
export function track(eventName: MetaEvent, params: MetaParams = {}, userData?: MetaUser, opts: { eventId?: string; server?: boolean } = {}) {
  if (typeof window === "undefined" || !META_PIXEL_ID || !enabled) return;
  const eventId = opts.eventId ?? newEventId();
  const fire = (tries = 0) => {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    if (fbq) fbq("track", eventName, params, { eventID: eventId });
    else if (tries < 30) setTimeout(() => fire(tries + 1), 200);
  };
  fire();
  if (opts.server === false) return;
  try {
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, signal: AbortSignal.timeout(5000), body: JSON.stringify({
      name: SERVER_NAMES[eventName], eventId, value: params.value, currency: params.currency, page: location.href.slice(0, 500),
      meta: { ...(params.content_name ? { content_name: params.content_name } : {}), ...(params.content_ids ? { content_ids: params.content_ids } : {}) },
      fbp: cookie("_fbp"), fbc: cookie("_fbc"), ...(userData ? { user: userData } : {}),
    }) }).catch(() => {});
  } catch {}
}
