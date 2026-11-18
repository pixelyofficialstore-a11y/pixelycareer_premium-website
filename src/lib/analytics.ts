/**
 * Analytics setup and commerce wrappers. Every event goes through send() in ./track (one helper, once-guard, bot filter).
 * Nothing loads or sends unless NEXT_PUBLIC_META_PIXEL_ID (Meta Pixel) or NEXT_PUBLIC_GA_ID (GA4) is set.
 * Purchase is never sent from the browser: the CRM sends it after payment is verified.
 */
import { GA4_ID, gtag, send, sendGa } from "./track";
export { META_PIXEL_ID } from "./meta";
export { GA4_ID };

/** GA4 sends only from the public site (its own host and www), never from the CRM, previews or localhost. */
export function gaAllowed(host: string) {
  const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pixelycareers.com").hostname.replace(/^www\./, "");
  return host === site || host === `www.${site}`;
}

/** Starts GA4 once: js and config go first in the queue. page_view is sent by Analytics on each route. */
let gaStarted = false;
export function gaInit() {
  if (gaStarted || !GA4_ID) return;
  gaStarted = true;
  gtag("js", new Date());
  gtag("config", GA4_ID, { send_page_view: false });
}

/** GA4 promotion events for an offer: view_promotion once when seen, select_promotion on a Claim click. */
export function trackPromotion(name: "view_promotion" | "select_promotion", promotionId: string, slot: string) {
  sendGa(name, { promotion_id: promotionId, promotion_name: "November Sale", creative_slot: slot, items: [{ promotion_id: promotionId, creative_slot: slot }] }, slot);
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

const FUNNEL = { view: "ViewContent", cart: "AddToCart", checkout: "InitiateCheckout", payment: "AddPaymentInfo", lead: "Lead" } as const;

/**
 * Commerce events with their once-guard keys:
 * view: once per session per key · cart: per item, per click (call only from a click) ·
 * checkout: once per cart id · payment and lead: once per order.
 */
export function trackFunnel(step: keyof typeof FUNNEL, c: Commerce, key?: string) {
  const event = FUNNEL[step];
  const id = c.orderId ?? cartId();
  send(event, {
    key: key ?? (step === "cart" ? `${c.ids.join(",")}:${Date.now()}` : step === "view" ? c.ids.join(",") : id),
    scope: step === "view" || step === "checkout" ? "session" : "page",
    name: c.name, ids: c.ids, value: c.value, currency: c.currency, items: c.items, category: c.category,
    eventId: `${event}_${id}${step === "cart" ? `_${Date.now().toString(36)}` : ""}`,
    // Lead and AddPaymentInfo: the server sends the Conversions API event itself (with the contact details).
    server: step !== "lead" && step !== "payment",
    ...(c.orderId || step === "payment" ? { ga: { ...(c.orderId ? { transaction_id: c.orderId } : {}), ...(step === "payment" && c.category ? { payment_type: c.category } : {}) } } : {}),
  });
}
