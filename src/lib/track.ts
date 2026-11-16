/**
 * The one tracking helper. Every funnel event goes through send():
 * - browser Pixel + Conversions API (same event_id) through meta.track, and the GA4 mirror;
 * - a once-guard: the same event + key never fires twice in a page view (or a session, for scope "session");
 * - nothing for bots, crawlers, automated browsers or test visits (?test=1, kept for the visit).
 *
 * | Event            | Fires exactly when                                          | Value             |
 * | PageView         | each page view / route change, once                         | none              |
 * | ViewContent      | #plans in view (once per session) or a service page view    | lowest plan price |
 * | AddToCart        | an explicit Add to cart / Claim click, never on load        | item price        |
 * | InitiateCheckout | checkout starts, once per cart id                           | cart total        |
 * | AddPaymentInfo   | order submitted, both options, once per order id            | discounted total  |
 * |                  |   content_category + GA4 payment_type: pay_now / whatsapp   |                   |
 * | Lead             | free CV review form and partner/agency form only            | 0                 |
 * | Contact          | any WhatsApp link or button click                           | none              |
 * | Purchase         | CRM only, when an order (either option) is verified/placed  | order total       |
 *
 * Every Conversions API event carries client_ip_address, client_user_agent, fbp, fbc (after an ad click),
 * external_id (sha256 of px_vid, plus the order id once one exists) and event_source_url; the server warns when one is missing.
 */
import { track as metaTrack, type MetaEvent } from "./meta";

export type TrackEvent = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "AddPaymentInfo" | "Lead" | "Contact";
const GA_NAMES: Record<TrackEvent, string> = {
  PageView: "page_view", ViewContent: "view_item", AddToCart: "add_to_cart", InitiateCheckout: "begin_checkout", AddPaymentInfo: "add_payment_info", Lead: "generate_lead", Contact: "contact",
};

export const GA4_ID = process.env.NEXT_PUBLIC_GA_ID;
type Win = Window & { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] };

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|bingpreview|googleother|python|curl|wget|phantom|puppeteer|playwright|selenium/i;
/** True for bots, automated browsers and test visits. */
export function blocked() {
  if (typeof window === "undefined") return true;
  try {
    if (new URLSearchParams(location.search).get("test") === "1") sessionStorage.setItem("pixely-test", "1");
    if (sessionStorage.getItem("pixely-test")) return true;
  } catch {}
  return !!navigator.webdriver || BOT.test(navigator.userAgent);
}

/** gtag, queued until gtag.js arrives so early events are not lost. */
export function gtag(...a: unknown[]) {
  if (!GA4_ID || typeof window === "undefined") return;
  const w = window as Win;
  w.dataLayer = w.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  w.gtag = w.gtag || function () { w.dataLayer!.push(arguments); };
  w.gtag(...a);
}

// Page-view scope: cleared on every route change by resetPageOnce().
let fired = new Set<string>();
export function resetPageOnce() { fired = new Set(); }
function once(key: string, scope: "page" | "session") {
  if (scope === "session") {
    try {
      const k = `pixely-once:${key}`;
      if (sessionStorage.getItem(k)) return false;
      sessionStorage.setItem(k, "1");
      return true;
    } catch {}
  }
  if (fired.has(key)) return false;
  fired.add(key);
  return true;
}

export type TrackData = {
  /** Item id or order id. The once-guard key is the event name + this. */
  key?: string;
  scope?: "page" | "session";
  name?: string;
  ids?: string[];
  value?: number;
  currency?: string;
  items?: number;
  category?: string;
  /** Shared event id for the Pixel, the Conversions API and the server copy. */
  eventId?: string;
  /** false when the server sends the Conversions API event itself (Lead). */
  server?: boolean;
  /** GA4-only extra parameters. */
  ga?: Record<string, unknown>;
};

/** Sends one event to Meta (browser + server) and GA4. Returns false when blocked or already sent. */
export function send(event: TrackEvent, d: TrackData = {}) {
  if (blocked()) return false;
  if (!once(`${event}:${d.key ?? ""}`, d.scope ?? "page")) return false;
  const params = {
    ...(d.name ? { content_name: d.name } : {}),
    ...(d.ids?.length ? { content_ids: d.ids, content_type: "product" } : {}),
    ...(d.value != null ? { value: d.value, currency: d.currency ?? "PKR" } : {}),
    ...(d.items ? { num_items: d.items } : {}),
    ...(d.category ? { content_category: d.category } : {}),
  };
  const eventId = d.eventId;
  metaTrack(event as MetaEvent, params, undefined, { eventId, server: d.server ?? true });
  gtag("event", GA_NAMES[event], {
    ...(d.value != null ? { value: d.value, currency: d.currency ?? "PKR" } : {}),
    ...(eventId ? { event_id: eventId } : {}),
    ...(d.ids?.length ? { items: d.ids.map((id) => ({ item_id: id, item_name: d.name ?? id })) } : {}),
    ...(event === "PageView" ? { page_location: location.href, page_path: location.pathname, page_title: document.title } : {}),
    ...(d.ga ?? {}),
  });
  return true;
}

/** GA4-only events (promotions), with the same bot filter and once-guard. */
export function sendGa(name: string, params: Record<string, unknown>, key = "") {
  if (blocked() || !once(`ga:${name}:${key}`, "page")) return;
  gtag("event", name, params);
}
