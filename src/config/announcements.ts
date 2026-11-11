import { formatPrice, homeHref, localize, orderHref, type Market } from "@/config/markets";
import { WHATSAPP_URL } from "@/lib/site";

/**
 * The announcement bar's messages.
 * {price} is the current market's lowest package price and {currency} its currency, both from markets.ts.
 * An href of "#pricing" means the current market's pricing section. Never use countdowns, urgency or invented statistics.
 */
export type Announcement = { key: string; text: string; href: string; ctaLabel?: string };

const PRICING = "#pricing";
const GULF = "Applying in the Gulf? CVs built for UAE & Saudi roles →";
const BUNDLE = "CV + cover letter + LinkedIn, from {price} →";

/** Matched against utm_campaign, case-insensitive. The first match wins. */
const CAMPAIGNS: { keywords: string[]; message: Announcement }[] = [
  { keywords: ["gulf"], message: { key: "campaign-gulf", text: GULF, href: PRICING } },
  { keywords: ["review"], message: { key: "campaign-review", text: "Your free CV review is one message away →", href: "/free-cv-review" } },
  { keywords: ["executive"], message: { key: "campaign-executive", text: "Executive Career Branding: your full professional brand →", href: PRICING } },
  { keywords: ["bundle", "profile"], message: { key: "campaign-bundle", text: BUNDLE, href: PRICING } },
];

const PAGES: { match: (path: string) => boolean; message: Announcement }[] = [
  { match: (p) => p === "/pk", message: { key: "pk", text: "First draft in 2 days. Same-day delivery available →", href: PRICING } },
  { match: (p) => p === "/ae", message: { key: "ae", text: GULF, href: PRICING } },
  { match: (p) => p === "/sa", message: { key: "sa", text: GULF, href: PRICING } },
  { match: (p) => p === "/uk", message: { key: "uk", text: "UK CVs, plus Europass for EU applications →", href: PRICING } },
  { match: (p) => p === "/", message: { key: "us", text: "Get a free resume review →", href: "/free-cv-review?market=us" } },
  { match: (p) => p.startsWith("/services/"), message: { key: "services", text: BUNDLE, href: PRICING } },
  { match: (p) => p === "/pricing", message: { key: "pricing", text: "Not sure which package? Ask us on WhatsApp →", href: WHATSAPP_URL } },
  { match: (p) => p === "/blog" || p.startsWith("/blog/"), message: { key: "blog", text: "We know what gets shortlisted. Let us build your CV →", href: "{pricing}" } },
  { match: (p) => p === "/partners", message: { key: "partners", text: "Partner rates on a 15 minute call. No minimum volume →", href: "#agency-enquiry" } },
];

const FALLBACK: Announcement = { key: "free-review", text: "Free CV review. Send your CV on WhatsApp →", href: "/free-cv-review" };

/** Pages with no bar at all. The layout's inline script repeats this test, so it holds before first paint. */
export const isBarHidden = (path: string) => path === "/order" || path.startsWith("/order/") || path === "/free-cv-review";

function fill(m: Market, message: Announcement, path: string): Announcement {
  const lowest = Math.min(...Object.values(m.prices));
  const text = localize(m, message.text).replaceAll("{price}", formatPrice(m, lowest)).replaceAll("{currency}", m.currency);
  // On this market's own home, stay on the page. Anywhere else, go to its home first.
  const href = message.href === "{pricing}" ? `/pricing?m=${m.key}` : message.href === PRICING ? (path === m.path ? PRICING : homeHref(m, PRICING)) : message.href;
  return { ...message, text, href };
}

/** Priority: campaign, then page rule, then fallback. */
export function getAnnouncement(m: Market, path: string, campaign?: string | null): Announcement {
  if (m.key === "pk" && !isBarHidden(path)) {
    return { key: "pk-pay", text: "Pay easily with JazzCash, Easypaisa or bank transfer →", href: orderHref(m) };
  }
  if (path === "/pricing") {
    return { key: "pricing", text: "Not sure which package? Ask us on WhatsApp →", href: WHATSAPP_URL };
  }
  const name = campaign?.toLowerCase();
  const match =
    (name && CAMPAIGNS.find((c) => c.keywords.some((k) => name.includes(k)))?.message) || PAGES.find((p) => p.match(path))?.message || FALLBACK;
  return fill(m, match, path);
}
