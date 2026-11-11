/**
 * Analytics placeholders. Nothing loads or sends unless these env vars are set.
 * There is deliberately no purchase event: the site only takes order requests.
 */
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type Tracked = "view_package" | "begin_order" | "generate_lead" | "view_promotion" | "select_promotion";
type Win = Window & { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };

export function trackEvent(name: Tracked, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as Win;
  w.gtag?.("event", name, params);
  w.fbq?.("trackCustom", name, params);
}

/** GA4 promotion events for an offer: view_promotion when it is seen, select_promotion on a Claim click. */
export function trackPromotion(name: "view_promotion" | "select_promotion", promotionId: string, slot: string) {
  trackEvent(name, { promotion_id: promotionId, promotion_name: "Personal Brand Bundle", creative_slot: slot, items: [{ promotion_id: promotionId, creative_slot: slot }] });
}
