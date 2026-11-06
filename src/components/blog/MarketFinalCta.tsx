"use client";
import { MARKETS } from "@/config/markets";
import FinalCta from "@/components/sections/FinalCta";
import { useMarket } from "@/components/ui/useMarket";

/** For static pages: the order link follows the visitor's saved market. */
export default function MarketFinalCta() {
  return <FinalCta market={MARKETS[useMarket()]} />;
}
