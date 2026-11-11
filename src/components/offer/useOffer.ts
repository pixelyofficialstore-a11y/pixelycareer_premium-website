"use client";
import { useEffect, useState } from "react";
import { BUNDLE, offerOpen, timeLeft, type OfferState } from "@/config/offers";
import type { MarketKey } from "@/config/markets";

let request: Promise<OfferState | null> | null = null;
let requestAt = 0;

/** One shared request per page view (refreshed after 60s), so the bar, strip and order page agree. */
function fetchState(): Promise<OfferState | null> {
  if (!request || Date.now() - requestAt > 60_000) {
    requestAt = Date.now();
    request = fetch(`/api/offer?id=${BUNDLE.id}&market=pk`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  }
  return request;
}

/**
 * The bundle's live state for this market. Before the slot count arrives it is open by the clock alone,
 * so the bar and strip show at once; remaining is null until it is known.
 */
export function useOffer(market: MarketKey) {
  const eligible = market === "pk";
  const [state, setState] = useState<{ open: boolean; remaining: number } | null>(null);
  useEffect(() => {
    if (!eligible) return;
    let alive = true;
    fetchState().then((s) => { if (alive && s) setState({ open: s.open, remaining: s.remaining }); });
    return () => { alive = false; };
  }, [eligible]);
  const open = eligible && (state ? state.open : offerOpen(BUNDLE, "pk"));
  return { offer: BUNDLE, open, remaining: state?.remaining ?? null };
}

/** Re-renders every `ms` and returns the time left to the offer's real end. */
export function useCountdown(ms = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return timeLeft(BUNDLE.endsAt, now);
}

export const short = (t: { d: number; h: number; m: number }) => `${t.d}d ${t.h}h ${t.m}m`;
