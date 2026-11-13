import type { MarketKey, PackageId } from "./markets";

/**
 * Time limited offers. The price is not discounted here: the bundle is the package plus its add-on at
 * the normal add-on price (Executive Rs 7,500 + portfolio with Executive Rs 12,500 = Rs 20,000).
 * compareAt is the real standalone total (Executive 7,500 + website alone 20,000).
 */
export type Offer = {
  id: string;
  markets: MarketKey[];
  title: string;
  headline: string;
  /** For tight spaces: hero pill, ticker, sticky bar. */
  short: string;
  includes: string[];
  packageId: PackageId;
  addonId: string;
  price: number;
  compareAt: number;
  /** Orders from this moment count towards the slots. */
  startsAt: string;
  endsAt: string;
  totalSlots: number;
  active: boolean;
};

export const OFFERS: Offer[] = [
  {
    id: "brand-bundle",
    markets: ["pk"],
    title: "11.11 Sale",
    headline: "Executive Career Branding + Personal Website",
    short: "Executive Branding & Website",
    includes: ["Executive Career Branding package", "Portfolio website with free domain and hosting for the first year"],
    packageId: "executive",
    addonId: "portfolio",
    price: 20000,
    compareAt: 27500,
    // CONFIRM (owner only, never rendered): the real start and end dates.
    startsAt: "2026-11-11T00:00:00+05:00",
    endsAt: "2026-11-30T23:59:59+05:00",
    totalSlots: 10,
    active: true,
  },
];

export const BUNDLE = OFFERS[0];
export const getOffer = (id?: string | null) => OFFERS.find((o) => o.id === id);

/** Live by config and clock. The slot count is checked separately (lib/offer-server, /api/offer). */
export const offerOpen = (o: Offer, market: MarketKey, now = Date.now()) =>
  o.active && o.markets.includes(market) && now >= Date.parse(o.startsAt) && now < Date.parse(o.endsAt);

export const offerHref = (o: Offer) => `/order?market=pk&package=${o.packageId}&addons=${o.addonId}&offer=${o.id}`;

/** Days, hours, minutes and seconds left until endsAt. The same real deadline for every visitor. */
export function timeLeft(endsAt: string, now = Date.now()) {
  const s = Math.max(0, Math.floor((Date.parse(endsAt) - now) / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, done: s === 0 };
}

export type OfferState = { id: string; open: boolean; remaining: number; total: number; endsAt: string };

/**
 * Online payment discount (pk). Applies to package + add-ons until ONLINE.endsAt, then prices go back to full.
 * full: pay everything on the website, 20% off. advance: pay 50% on the website, 10% off.
 * The discounted total is rounded to the nearest Rs 50; the 50% advance is rounded up to the next Rs 50.
 * The 11.11 Bundle has its own fixed pay now prices and gets no extra percentage.
 */
export const ONLINE = {
  full: { pct: 20, label: "online_20" },
  advance: { pct: 10, label: "online_10" },
  endsAt: "2026-11-30T23:59:59+05:00",
  round: 50,
  bundleOff: { full: 1000, advance: 500 },
} as const;
export type PayAmountType = "advance" | "full";
export type DiscountType = "online_20" | "online_10" | "bundle" | "none";
export const onlineOpen = (now = Date.now()) => now < Date.parse(ONLINE.endsAt);
export const ONLINE_ENDS_LABEL = "30 Nov";

export function payPlan(subtotal: number, type: PayAmountType, opts: { bundle?: boolean; now?: number } = {}) {
  const r = ONLINE.round;
  let total = subtotal, discountType: DiscountType = "none";
  if (opts.bundle) { total = subtotal - ONLINE.bundleOff[type]; discountType = "bundle"; }
  else if (onlineOpen(opts.now)) { total = Math.round((subtotal * (100 - ONLINE[type].pct)) / 100 / r) * r; discountType = ONLINE[type].label; }
  const today = type === "full" ? total : Math.ceil(total / 2 / r) * r;
  return { type, subtotal, discount: subtotal - total, total, today, balance: total - today, discountType: total < subtotal ? discountType : "none" as DiscountType };
}
/** Pay in full online price for display (cards). */
export const onlinePrice = (price: number, type: PayAmountType = "full", now?: number) => payPlan(price, type, { now }).total;

/** The bundle price shown everywhere: the pay in full online price. */
export const BUNDLE_NOW = BUNDLE.price - ONLINE.bundleOff.full;
export const BUNDLE_EXTRA_LINE = `Book your slot online and save an extra Rs ${ONLINE.bundleOff.full.toLocaleString("en-US")}.`;

/** What the 11.11 Bundle includes. The pricing card and the order page both read this, so they never differ. */
export const BUNDLE_ITEMS = ["Premium executive CV", "Personal portfolio website", "Free domain & hosting for 1 year", "Executive bio statement", "LinkedIn makeover + content pack (10 posts)", "Interview preparation guide"] as const;
export const BUNDLE_ALL_LINE = "Includes everything in Executive Career Branding.";
