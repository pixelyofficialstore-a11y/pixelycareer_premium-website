import { cookies } from "next/headers";
import { MARKETS, isMarketKey, type Market } from "@/config/markets";

/** Market for pages that share one URL: an explicit ?market= wins, then the saved choice, then the US main site. */
export async function requestMarket(fromQuery?: string): Promise<Market> {
  if (isMarketKey(fromQuery)) return MARKETS[fromQuery];
  const saved = (await cookies()).get("market")?.value;
  return isMarketKey(saved) ? MARKETS[saved] : MARKETS.us;
}
