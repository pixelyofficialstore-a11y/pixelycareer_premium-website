import { MARKETS, MARKET_KEYS, isMarketKey, ogLabel } from "@/config/markets";
import { OG_SIZE, OG_TYPE, ogImage } from "@/lib/og";

export const alt = "Pixely Careers";
export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const generateStaticParams = () => MARKET_KEYS.filter((k) => k !== "us").map((market) => ({ market }));

export default async function Image({ params }: { params: Promise<{ market: string }> }) {
  const { market } = await params;
  return ogImage(isMarketKey(market) ? ogLabel(MARKETS[market]) : "Pixely Careers", "Stand out from the stack.");
}
