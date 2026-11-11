import { notFound } from "next/navigation";
import HomePage from "@/components/HomePage";
import { MARKETS, MARKET_KEYS, isMarketKey } from "@/config/markets";
import { BUNDLE, offerOpen } from "@/config/offers";
import { homeMetadata } from "@/lib/seo";

type Props = { params: Promise<{ market: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => MARKET_KEYS.filter((k) => k !== "us").map((market) => ({ market }));

export async function generateMetadata({ params }: Props) {
  const { market } = await params;
  return isMarketKey(market) && market !== "us" ? homeMetadata(MARKETS[market], market === "pk" && offerOpen(BUNDLE, "pk")) : {};
}

export default async function Page({ params }: Props) {
  const { market } = await params;
  if (!isMarketKey(market) || market === "us") notFound();
  return <HomePage market={MARKETS[market]} />;
}
