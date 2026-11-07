import { HERO_PERSONAS } from "@/config/heroPersonas";
import { MARKETS, MARKET_KEYS, isMarketKey, ogLabel } from "@/config/markets";
import { OG_SIZE, OG_TYPE, ogImage } from "@/lib/og";

export const alt = "Pixely Careers";
export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const generateStaticParams = () => MARKET_KEYS.filter((k) => k !== "us").map((market) => ({ market }));

export default async function Image({ params }: { params: Promise<{ market: string }> }) {
  const { market } = await params;
  if (!isMarketKey(market)) return ogImage("Pixely Careers", "Stand out from the stack.");
  const { line1, line2 } = HERO_PERSONAS[market].heroCopy;
  return ogImage(ogLabel(MARKETS[market]), `${line1} ${line2}`);
}
