import { MARKETS, type Market } from "@/config/markets";

/** Pakistan is the only live market: every page is the PK site. Other markets stay in config, disabled (ENABLED_MARKETS). */
export async function requestMarket(_fromUrl?: string): Promise<Market> {
  return MARKETS.pk;
}
