/**
 * Analytics placeholders. Nothing loads or sends unless these env vars are set.
 * There is deliberately no purchase event: the site only takes order requests.
 */
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type Tracked = "view_package" | "begin_order" | "generate_lead";
type Win = Window & { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };

export function trackEvent(name: Tracked, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as Win;
  w.gtag?.("event", name, params);
  w.fbq?.("trackCustom", name, params);
}
