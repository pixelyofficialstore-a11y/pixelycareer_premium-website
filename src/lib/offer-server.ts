import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { getOffer, offerOpen, type Offer, type OfferState } from "@/config/offers";

const TTL = 60_000;
const cache = new Map<string, { at: number; used: number }>();

type OrderRecord = { package?: string; addons?: { id: string }[]; offer_id?: string; status?: string; payment_choice?: string; created_at?: string };

/**
 * Slots used: paid or confirmed orders with the package and add-on since the offer started.
 * "Paid" means a payment screenshot came with the order (payment_choice "now"); a status of
 * "paid" or "confirmed" set by the team also counts. Cached for 60 seconds.
 */
async function usedSlots(o: Offer) {
  const hit = cache.get(o.id);
  if (hit && Date.now() - hit.at < TTL) return hit.used;
  const dir = process.env.ORDERS_DIR ?? path.join(process.cwd(), ".orders");
  let used = 0;
  try {
    const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
    for (const f of files) {
      try {
        const r = JSON.parse(await readFile(path.join(dir, f), "utf8")) as OrderRecord;
        const match = r.offer_id === o.id || (r.package === o.packageId && r.addons?.some((a) => a.id === o.addonId));
        const paid = r.status === "paid" || r.status === "confirmed" || r.payment_choice === "now";
        if (match && paid && r.created_at && Date.parse(r.created_at) >= Date.parse(o.startsAt)) used++;
      } catch {}
    }
  } catch {}
  cache.set(o.id, { at: Date.now(), used });
  return used;
}

export const clearOfferCache = () => cache.clear();

export async function getOfferState(id: string, market: string): Promise<OfferState | null> {
  const o = getOffer(id);
  if (!o) return null;
  const remaining = Math.max(0, o.totalSlots - (await usedSlots(o)));
  const open = offerOpen(o, market as Offer["markets"][number]) && remaining > 0;
  return { id: o.id, open, remaining, total: o.totalSlots, endsAt: o.endsAt };
}
