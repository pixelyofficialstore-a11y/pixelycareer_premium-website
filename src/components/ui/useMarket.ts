"use client";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { isMarketKey, type MarketKey } from "@/config/markets";
import { getBlogMarket, getPostMarket } from "@/lib/blog-market";

const EVENT = "pixely-market";

function readCookie(): MarketKey | null {
  const current = document.cookie.match(/(?:^|; )pc_market=([^;]+)/)?.[1];
  if (isMarketKey(current)) return current;
  const legacy = document.cookie.match(/(?:^|; )market=([^;]+)/)?.[1];
  return isMarketKey(legacy) ? legacy : null;
}

export function saveMarket(key: MarketKey) {
  document.cookie = `pc_market=${key}; path=/; max-age=31536000; samesite=lax`;
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

function marketFromQuery(path: string): MarketKey | null {
  if (path !== "/pricing") return null;
  const params = new URLSearchParams(window.location.search);
  const explicit = params.get("m");
  const legacy = params.get("market");
  return isMarketKey(explicit) ? explicit : isMarketKey(legacy) ? legacy : null;
}

/** A market home's URL decides its market; every other page follows the saved choice. */
export function useMarket(): MarketKey {
  const path = usePathname();
  const saved = useSyncExternalStore(
    subscribe,
    () => marketFromQuery(path) ?? readCookie(),
    () => null,
  );
  const blogMarket = useSyncExternalStore(
    subscribe,
    () => (path === "/blog" || path.startsWith("/blog/") ? getBlogMarket(getPostMarket(), { saved: readCookie(), country: document.cookie.match(/(?:^|; )pc_geo=([^;]+)/)?.[1] }) : null),
    () => null,
  );
  // Blog pages route by the post, then the visitor (see getBlogMarket).
  if (blogMarket) return blogMarket;
  return marketFromPath(path) ?? saved ?? "us";
}
