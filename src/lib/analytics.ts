/**
 * Analytics. Nothing loads or sends unless the env vars are set:
 * NEXT_PUBLIC_META_PIXEL_ID (Meta Pixel) and NEXT_PUBLIC_GA_ID or NEXT_PUBLIC_GA4_ID (GA4).
 * Purchase is never sent from the browser: it goes through the Conversions API when an order is marked paid.
 */
export const GA4_ID = process.env.NEXT_PUBLIC_GA_ID ?? process.env.NEXT_PUBLIC_GA4_ID;
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type Win = Window & { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };

/** GA4 only: the site's own events (view_promotion, select_promotion, ...). */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  (window as Win).gtag?.("event", name, params);
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

export type Commerce = { name: string; ids: string[]; value: number; currency: string; items?: number; orderId?: string };

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
  const w = window as Win;
  const [meta, ga] = FUNNEL[step];
  const eventId = c.orderId ?? cartId();
  w.fbq?.("track", meta, {
    content_name: c.name, content_ids: c.ids, content_type: "product", value: c.value, currency: c.currency,
    ...(c.items ? { num_items: c.items } : {}), ...(c.orderId ? { order_id: c.orderId } : {}),
  }, { eventID: `${meta}_${eventId}` });
  w.gtag?.("event", ga, {
    value: c.value, currency: c.currency, ...(c.orderId ? { transaction_id: c.orderId } : {}), event_id: `${ga}_${eventId}`,
    items: c.ids.map((id) => ({ item_id: id, item_name: c.name })),
  });
}
