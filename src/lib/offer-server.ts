import "server-only";
import { and, count, eq, gte, inArray } from "drizzle-orm";
import { getOffer, offerOpen, type Offer, type OfferState } from "@/config/offers";
import { db, orders } from "@/lib/db";

const TTL = 60_000;
const cache = new Map<string, { at: number; used: number }>();

/** Slots used: offer orders since the offer started that came with a payment or were marked paid by the team. Cached for 60 seconds. */
async function usedSlots(o: Offer) {
  const hit = cache.get(o.id);
  if (hit && Date.now() - hit.at < TTL) return hit.used;
  let used = 0;
  if (process.env.DATABASE_URL) {
    try {
      const [r] = await db().select({ n: count() }).from(orders).where(and(
        eq(orders.offer, o.id),
        inArray(orders.status, ["payment_submitted", "paid", "in_progress", "delivered"]),
        gte(orders.createdAt, new Date(o.startsAt)),
      ));
      used = Number(r?.n ?? 0);
    } catch { /* the offer stays open if the database is briefly unreachable */ }
  }
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
