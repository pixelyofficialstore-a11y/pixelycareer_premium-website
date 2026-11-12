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
  /** Off the offer price when the customer pays now (uploads a payment screenshot) instead of paying later. */
  payNowDiscount: number;
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
    // CONFIRM (owner only, never rendered): the pay now saving.
    payNowDiscount: 1000,
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
 * Pay now rules (pk). Add-ons are in the total before the discount.
 * advance: pay 50% now, 5% off (max Rs 500). full: pay everything now, 10% off (max Rs 1,000).
 * The discount and the discounted total are rounded to the nearest Rs 50; the 50% advance is rounded up to the next Rs 50.
 */
export const PAY_NOW = {
  advance: { pct: 5, cap: 500 },
  full: { pct: 10, cap: 1000 },
  round: 50,
} as const;
export type PayAmountType = "advance" | "full";

export function payPlan(subtotal: number, type: PayAmountType) {
  const r = PAY_NOW.round;
  const rule = PAY_NOW[type];
  const off = Math.round(Math.min((subtotal * rule.pct) / 100, rule.cap) / r) * r;
  const total = Math.round((subtotal - off) / r) * r;
  const today = type === "full" ? total : Math.ceil(total / 2 / r) * r;
  return { type, subtotal, discount: subtotal - total, total, today, balance: total - today };
}
