import { getPackages, localize, type Market, type MarketKey, type PackageId } from "@/config/markets";

// CONFIRM non PKR prices with the owner. Every price lives here, per market.
type Tier = "ats" | "pro" | "exec";
export const TIER: Record<PackageId, Tier> = { "ats-career": "ats", "international-pro": "pro", executive: "exec" };

/** tiers: units price by their own tier (unit 1, units 2 to 5, units 6 to 10). flat: one price per unit. fixed: one price once. byPackage: one price per package. */
type Price =
  | { kind: "tiers"; a: number; b: number; c: number }
  | { kind: "flat"; price: number }
  | { kind: "byPackage"; ats: number; pro: number; exec: number };

type Row = Record<string, Price>;
const T = (a: number, b: number, c: number): Price => ({ kind: "tiers", a, b, c });
const F = (price: number): Price => ({ kind: "flat", price });
const PK = (ats: number, pro: number, exec: number): Price => ({ kind: "byPackage", ats, pro, exec });

const GULF: Row = {
  "role-pack": T(129, 99, 75), arabic: T(149, 99, 69),
  "content-pack": F(269), bio: F(99), "job-portals": F(149), "contact-card": F(49), portfolio: PK(1999, 1599, 1199),
};
const PRICES: Record<MarketKey, Row> = {
  pk: {
    "role-pack": T(1300, 1000, 750), arabic: T(1500, 1000, 700),
    "content-pack": F(2500), bio: F(1000), "job-portals": F(1500), "contact-card": F(500), portfolio: PK(20000, 16000, 12500),
  },
  us: {
    "role-pack": T(43, 33, 25), arabic: T(49, 33, 23),
    "content-pack": F(89), bio: F(33), "job-portals": F(49), "contact-card": F(17), portfolio: PK(649, 529, 399),
  },
  uk: {
    "role-pack": T(30, 23, 17), arabic: T(35, 23, 16),
    "content-pack": F(65), bio: F(23), "job-portals": F(35), "contact-card": F(12), portfolio: PK(459, 369, 279),
  },
  ae: GULF,
  sa: GULF,
};

export type Addon = {
  id: string;
  name: string;
  /** Used for us and uk, where the job portal add-on is Indeed only. */
  nameWestern?: string;
  benefit: string;
  qty: boolean;
  badge?: string;
  /** Packages that already include this add-on, so it is hidden for them. */
  hiddenOn: Tier[];
  markets: MarketKey[] | "all";
};

export const ADDONS: Addon[] = [
  { id: "role-pack", name: "Another CV + cover letter", benefit: "Another role, or the same role in another format", qty: true, badge: "Most added", hiddenOn: [], markets: "all" },
  { id: "arabic", name: "Arabic CV", benefit: "For Arabic speaking employers", qty: true, hiddenOn: [], markets: ["ae", "sa", "pk"] },
  { id: "content-pack", name: "LinkedIn content pack", benefit: "Stay visible to recruiters", qty: false, hiddenOn: ["exec"], markets: "all" },
  { id: "bio", name: "Bio statement", benefit: "Your professional story", qty: false, hiddenOn: ["pro", "exec"], markets: "all" },
  { id: "job-portals", name: "Indeed + Naukrigulf profiles", nameWestern: "Indeed profile", benefit: "Get found on job portals", qty: false, hiddenOn: ["pro", "exec"], markets: "all" },
  { id: "contact-card", name: "Digital contact card", benefit: "Share your details in one tap", qty: false, hiddenOn: ["pro", "exec"], markets: "all" },
  { id: "portfolio", name: "Portfolio website", benefit: "Free domain and hosting for the first year", qty: false, hiddenOn: [], markets: "all" },
];
const BY_ID = new Map(ADDONS.map((a) => [a.id, a]));

/** Price of the nth unit (1 based). */
export function unitAt(market: MarketKey, id: string, n: number, pkg: PackageId) {
  const p = PRICES[market][id];
  if (p.kind === "tiers") return n <= 1 ? p.a : n <= 5 ? p.b : p.c;
  if (p.kind === "flat") return p.price;
  return p[TIER[pkg]];
}

/** Total for q units: each unit at its own tier, so earlier units never get cheaper. */
export function totalFor(market: MarketKey, id: string, q: number, pkg: PackageId) {
  let sum = 0;
  for (let n = 1; n <= q; n++) sum += unitAt(market, id, n, pkg);
  return sum;
}

export function availableAddons(m: Market, pkg: PackageId) {
  return ADDONS.filter((a) => (a.markets === "all" || a.markets.includes(m.key)) && !a.hiddenOn.includes(TIER[pkg])).map((a) => ({
    id: a.id,
    name: localize(m, a.nameWestern && (m.key === "us" || m.key === "uk") ? a.nameWestern : a.name),
    benefit: localize(m, a.benefit),
    qty: a.qty,
    badge: a.badge,
  }));
}

export type Selection = Record<string, number>;
export type OrderLine = { id: string; name: string; qty: number; unitBreakdown: { qty: number; unitPrice: number }[]; total: number };

/** The one place totals are worked out, used by the form and by the server. */
export function calcOrder(m: Market, pkgId: PackageId, sameDay: boolean, selection: Selection) {
  const pkg = getPackages(m).find((p) => p.id === pkgId)!;
  const list: OrderLine[] = availableAddons(m, pkgId)
    .filter((a) => (selection[a.id] ?? 0) > 0)
    .map((a) => {
      const qty = BY_ID.get(a.id)!.qty ? Math.min(10, Math.max(1, Math.floor(selection[a.id]))) : 1;
      const groups: Record<number, number> = {};
      for (let n = 1; n <= qty; n++) { const u = unitAt(m.key, a.id, n, pkgId); groups[u] = (groups[u] ?? 0) + 1; }
      const unitBreakdown = Object.entries(groups).map(([price, count]) => ({ qty: count, unitPrice: Number(price) }));
      return { id: a.id, name: a.name, qty, unitBreakdown, total: totalFor(m.key, a.id, qty, pkgId) };
    });
  const addonsTotal = list.reduce((s, a) => s + a.total, 0);
  const total = pkg.price + (sameDay ? pkg.sameDay : 0) + addonsTotal;
  return { pkg, list, addonsTotal, total };
}
