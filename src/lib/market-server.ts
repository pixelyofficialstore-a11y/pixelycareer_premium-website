import { cookies } from "next/headers";
import { MARKETS, isMarketKey, type Market } from "@/config/markets";

/** Market for pages that share one URL: an explicit ?market= wins, then the saved choice, then Pakistan by geo country, then the US main site. */
export async function requestMarket(fromQuery?: string): Promise<Market> {
  if (isMarketKey(fromQuery)) return MARKETS[fromQuery];
  const jar = await cookies();
  const saved = jar.get("pc_market")?.value ?? jar.get("market")?.value;
  if (isMarketKey(saved)) return MARKETS[saved];
  return jar.get("pc_geo")?.value === "PK" ? MARKETS.pk : MARKETS.us;
}
