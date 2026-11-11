"use client";
import { useRouter } from "next/navigation";
import { MARKETS } from "@/config/markets";
import { useMarket } from "./useMarket";

/** Back to the previous page on this site; with no such page, to the blog (posts) or the market home. */
export default function BackButton({ fallback }: { fallback?: string }) {
  const router = useRouter();
  const home = MARKETS[useMarket()].path;
  const goBack = () => {
    let sameSite = false;
    try { sameSite = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch {}
    if (sameSite && history.length > 1) router.back();
    else router.push(fallback ?? home);
  };
  return (
    <button type="button" onClick={goBack} className="crumb-back" aria-label="Go back">←</button>
  );
}
