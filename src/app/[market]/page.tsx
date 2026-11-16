import { notFound } from "next/navigation";
import HomePage from "@/components/HomePage";
import { ENABLED_MARKETS, MARKETS, MARKET_KEYS, isMarketKey } from "@/config/markets";
import { BUNDLE, offerOpen } from "@/config/offers";
import { homeMetadata } from "@/lib/seo";

type Props = { params: Promise<{ market: string }> };

export const dynamicParams = false;
// Hidden markets (UK, UAE, KSA) are not built; /pk has its own route.
export const generateStaticParams = () => MARKET_KEYS.filter((k) => k !== "us" && k !== "pk" && ENABLED_MARKETS.includes(k)).map((market) => ({ market }));

export async function generateMetadata({ params }: Props) {
  const { market } = await params;
  return isMarketKey(market) && market !== "us" ? homeMetadata(MARKETS[market], market === "pk" && offerOpen(BUNDLE, "pk")) : {};
}

export default async function Page({ params }: Props) {
  const { market } = await params;
  if (!isMarketKey(market) || market === "us") notFound();
  return <HomePage market={MARKETS[market]} />;
}
