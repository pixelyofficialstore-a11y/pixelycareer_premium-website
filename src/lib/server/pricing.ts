import "server-only";
import { calcOrder } from "@/config/addons";
import { MARKETS, getPackages, isMarketKey, type PackageId } from "@/config/markets";
import { OFFERS } from "@/config/offers";
import { getOfferState } from "@/lib/offer-server";
import type { AddonLine } from "@/lib/db/schema";

export type PriceInput = { market: string; package: string; addons: Record<string, number>; sameDay: boolean; bundle: boolean; payChoice: "now" | "later" | null };

/** Prices are always worked out here from config. Anything the browser says about money is ignored. */
export async function priceOrder(i: PriceInput) {
  if (!isMarketKey(i.market)) return null;
  const m = MARKETS[i.market];
  // executive_bundle: the 11.11 Bundle as its own package (Executive + portfolio at the offer price).
  const asBundle = i.package === "executive_bundle";
  const pkgId = (asBundle ? "executive" : i.package) as PackageId;
  if (asBundle) i = { ...i, bundle: true };
  if (!getPackages(m).some((p) => p.id === pkgId)) return null;
  const offer = OFFERS.find((o) => o.packageId === pkgId && o.markets.includes(m.key));
  const state = i.bundle && offer ? await getOfferState(offer.id, m.key) : null;
  const isBundle = !!(offer && state?.open);
  const selection: Record<string, number> = {};
  for (const [k, v] of Object.entries(i.addons ?? {})) selection[k] = Math.min(10, Math.max(0, Math.floor(Number(v) || 0)));
  if (isBundle) selection[offer!.addonId] = 1;
  const { pkg, list, total } = calcOrder(m, pkgId, i.sameDay, selection);
  const addons: AddonLine[] = list.map((a) => ({ id: a.id, name: a.name, qty: a.qty, price: a.total }));
  const discount = isBundle && i.payChoice === "now" ? offer!.payNowDiscount : 0;
  return {
    market: m.key, package: isBundle ? "executive_bundle" : pkgId, packagePrice: pkg.price, addons, sameDay: i.sameDay, offer: isBundle ? offer!.id : null, isBundle,
    discount, subtotal: total, total: total - discount, currency: m.currency,
  };
}
