import { cookies } from "next/headers";
import { MARKETS, isMarketKey, type Market } from "@/config/markets";

/** Market for pages that share one URL: an explicit ?market= wins, then the saved choice, then the US main site. */
export async function requestMarket(fromQuery?: string): Promise<Market> {
  if (isMarketKey(fromQuery)) return MARKETS[fromQuery];
  const store = await cookies();
  const saved = store.get("pc_market")?.value;
  if (isMarketKey(saved)) return MARKETS[saved];
  const legacy = store.get("market")?.value;
  return isMarketKey(legacy) ? MARKETS[legacy] : MARKETS.us;
}
