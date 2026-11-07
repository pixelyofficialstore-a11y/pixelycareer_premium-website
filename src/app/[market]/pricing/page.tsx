import { notFound, redirect } from "next/navigation";
import { MARKET_KEYS, isMarketKey } from "@/config/markets";

type Props = { params: Promise<{ market: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => MARKET_KEYS.filter((key) => key !== "us").map((market) => ({ market }));

export default async function MarketPricingPage({ params }: Props) {
  const { market } = await params;
  if (!isMarketKey(market) || market === "us") notFound();
  redirect(`/pricing?m=${market}`);
}
