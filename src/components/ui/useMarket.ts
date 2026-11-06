"use client";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { isMarketKey, type MarketKey } from "@/config/markets";

const EVENT = "pixely-market";

function readCookie(): MarketKey | null {
  const v = document.cookie.match(/(?:^|; )market=([^;]+)/)?.[1];
  return isMarketKey(v) ? v : null;
}

export function saveMarket(key: MarketKey) {
  document.cookie = `market=${key}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new Event(EVENT));
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

export function marketFromPath(path: string): MarketKey | null {
  if (path === "/") return "us";
  const seg = path.split("/")[1];
  return isMarketKey(seg) && seg !== "us" && path === `/${seg}` ? seg : null;
}

/** A market home's URL decides its market; every other page follows the saved choice. */
export function useMarket(): MarketKey {
  const path = usePathname();
  const saved = useSyncExternalStore(subscribe, readCookie, () => null);
  return marketFromPath(path) ?? saved ?? "us";
}
