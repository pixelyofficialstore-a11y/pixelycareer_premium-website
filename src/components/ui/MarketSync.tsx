"use client";
import { useEffect } from "react";
import { MARKETS, type MarketKey } from "@/config/markets";
import { saveMarket } from "./useMarket";

/** Visiting a market's home remembers it, so Services and Pricing then show that market's prices. */
export default function MarketSync({ market }: { market: MarketKey }) {
  useEffect(() => {
    saveMarket(market);
    document.documentElement.lang = MARKETS[market].hreflang;
    return () => {
      document.documentElement.lang = "en-US";
    };
  }, [market]);
  return null;
}
