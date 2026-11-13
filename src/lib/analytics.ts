/**
 * Analytics. Nothing loads or sends unless the env vars are set:
 * NEXT_PUBLIC_META_PIXEL_ID (Meta Pixel) and NEXT_PUBLIC_GA_ID (GA4).
 * Purchase is never sent from the browser: the CRM sends it after payment is verified.
 */
export const GA4_ID = process.env.NEXT_PUBLIC_GA_ID;

/** GA4 sends only from the public site (its own host and www), never from the CRM, previews or localhost. */
export function gaAllowed(host: string) {
  const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pixelycareers.com").hostname.replace(/^www./, "");
  return host === site || host === `www.${site}`;
}
import { track } from "./meta";
export { META_PIXEL_ID } from "./meta";

type Win = Window & { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] };

/** gtag, queued in dataLayer until gtag.js arrives, so early events are never lost. */
function gtag(...a: unknown[]) {
  if (!GA4_ID || typeof window === "undefined") return;
  const w = window as Win;
  w.dataLayer = w.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  w.gtag = w.gtag || function () { w.dataLayer!.push(arguments); };
  w.gtag(...a);
}

/** Starts GA4 once: js and config go first in the queue, page_view is sent by Analytics on each route. */
let gaStarted = false;
export function gaInit() {
  if (gaStarted || !GA4_ID) return;
  gaStarted = true;
  gtag("js", new Date());
  gtag("config", GA4_ID, { send_page_view: false });
}

/** GA4 only: the site's own events (view_promotion, select_promotion, ...). */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  gtag("event", name, params);
}

/** GA4 promotion events for an offer: view_promotion when it is seen, select_promotion on a Claim click. */
export function trackPromotion(name: "view_promotion" | "select_promotion", promotionId: string, slot: string) {
  trackEvent(name, { promotion_id: promotionId, promotion_name: "11.11 Sale", creative_slot: slot, items: [{ promotion_id: promotionId, creative_slot: slot }] });
}

/** One id per visit's cart. It is the event_id until an order exists, so the Pixel and the Conversions API can be matched. */
export function cartId() {
  try {
    let id = sessionStorage.getItem("pixely-cart-id");
    if (!id) { id = `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`; sessionStorage.setItem("pixely-cart-id", id); }
    return id;
  } catch {
    return "";
  }
}
export function setCartId(id: string) {
  try { sessionStorage.setItem("pixely-cart-id", id); } catch {}
}

export type Commerce = { name: string; ids: string[]; value: number; currency: string; items?: number; orderId?: string; category?: string };

const FUNNEL = {
  view: ["ViewContent", "view_item"],
  cart: ["AddToCart", "add_to_cart"],
  checkout: ["InitiateCheckout", "begin_checkout"],
  payment: ["AddPaymentInfo", "add_payment_info"],
  lead: ["Lead", "generate_lead"],
} as const;

/**
 * Funnel events, sent to both the Meta Pixel and GA4 with the same event id:
 * view (ViewContent / view_item), cart (AddToCart / add_to_cart), checkout (InitiateCheckout / begin_checkout),
 * payment (AddPaymentInfo / add_payment_info), lead (Lead / generate_lead).
 */
export function trackFunnel(step: keyof typeof FUNNEL, c: Commerce) {
  if (typeof window === "undefined") return;
  const [meta, ga] = FUNNEL[step];
  const eventId = c.orderId ?? cartId();
  // Lead: the server sends the Conversions API event itself (with the contact details), so the browser only fires the Pixel.
  track(meta, {
    content_name: c.name, content_ids: c.ids, content_type: "product", value: c.value, currency: c.currency, ...(c.items ? { num_items: c.items } : {}), ...(c.category ? { content_category: c.category } : {}),
  }, undefined, { eventId: `${meta}_${eventId}`, server: step !== "lead" });
  gtag("event", ga, {
    value: c.value, currency: c.currency, ...(c.orderId ? { transaction_id: c.orderId } : {}), event_id: `${ga}_${eventId}`,
    items: c.ids.map((id) => ({ item_id: id, item_name: c.name })),
  });
}
