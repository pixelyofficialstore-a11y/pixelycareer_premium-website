"use client";
import { usePathname } from "next/navigation";
import { marketOfPath, type MarketKey } from "@/config/markets";

/** Kept for older callers. The market never comes from a cookie or the visitor's country any more. */
export function saveMarket(_key: MarketKey) {}

export const marketFromPath = (path: string): MarketKey | null => (path === "/" ? "pk" : null);

/** The market comes from the URL only: /pk and every page under it is Pakistan, everything else is the US site. */
export function useMarket(): MarketKey {
  return marketOfPath(usePathname() ?? "/");
}
