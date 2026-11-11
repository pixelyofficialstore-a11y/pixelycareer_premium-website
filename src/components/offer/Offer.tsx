"use client";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { BUNDLE, offerHref } from "@/config/offers";
import type { MarketKey } from "@/config/markets";
import { trackPromotion } from "@/lib/analytics";
import { useCountdown, useOffer } from "./useOffer";
import "./offer.css";

/**
 * 11.11 Sale (pk). One offer: "Executive Career Branding & Personal Website" (short: "Executive Branding & Website"),
 * Rs 27,500 → Rs 20,000.
 * Every piece hides itself when the offer ends by time or slots, all use the real endsAt, and all colors
 * come from the --sale tokens in offer.css (no green, no cyan).
 */

const rs = (n: number) => `Rs ${n.toLocaleString("en-US")}`;
const pad = (n: number) => String(n).padStart(2, "0");
export const OFFER_HREF = offerHref(BUNDLE);
const SAVE_PCT = Math.round(((BUNDLE.compareAt - BUNDLE.price) / BUNDLE.compareAt) * 100);
/** Slots show only once a few have sold. */
const SHOW_SLOTS_AT = 7;

export function useLive(market: MarketKey, tick = 1000) {
  const { open, remaining } = useOffer(market);
  const t = useCountdown(tick);
  return { live: open && !t.done, remaining, t };
}

/** Fires view_promotion once when the element is half visible. */
function useSeen(slot: string) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { trackPromotion("view_promotion", BUNDLE.id, slot); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  });
  return ref;
}

export const inline = (t: { d: number; h: number; m: number }) => `${t.d}d ${pad(t.h)}h ${pad(t.m)}m`;
const claim = (slot: string) => () => trackPromotion("select_promotion", BUNDLE.id, slot);

export function Flame({ size = 14 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true"><path d="M12 2c1 3.5-1.5 5.2-1.5 7.6 0 1.3.9 2.2 2 2.2 1.4 0 2.2-1.2 1.9-3.1 2.6 1.8 4.6 4.5 4.6 7.6A7 7 0 0 1 12 23a7 7 0 0 1-7-6.7c0-4.3 3.2-6.8 4.5-9.6.6 1 .9 2 .8 3.2C12.3 8.4 12.9 5.5 12 2Z" /></svg>;
}

/** Hero: one light pill above the H1. */
export function HeroPill({ market }: { market: MarketKey }) {
  const { live } = useLive(market, 60_000);
  if (!live) return null;
  return (
    <a href="#offer" className="of-pill" data-cta="offer-hero-pill">
      <span className="of-pill-chip">11.11</span>
      <span className="of-pill-long">{BUNDLE.short} · {rs(BUNDLE.price)}</span>
      <span className="of-pill-short">Executive & Website · {rs(BUNDLE.price)}</span>
      <span className="of-pill-arrow" aria-hidden="true">→</span>
    </a>
  );
}

/** One rounded container, four units with thin dividers. */
function Countdown({ t }: { t: { d: number; h: number; m: number; s: number } }) {
  return (
    <div className="of-count" role="timer" aria-label={`${t.d} days, ${t.h} hours and ${t.m} minutes left`}>
      {([["Days", t.d], ["Hours", t.h], ["Min", t.m], ["Sec", t.s]] as const).map(([label, n]) => (
        <div key={label}>
          <b key={label === "Sec" ? n : label} className={label === "Sec" ? "of-flip" : undefined} suppressHydrationWarning>{pad(n)}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

/** The offer band (id="offer"): right after the hero on /pk, above the heading on /pricing?m=pk. */
export function OfferBand({ market, slot = "home_band" }: { market: MarketKey; slot?: string }) {
  const { live, remaining, t } = useLive(market);
  const ref = useSeen(slot);
  if (!live) return null;
  return (
    <section id="offer" ref={ref} className={`of-band${slot === "pricing_band" ? " of-band-top" : ""}`} aria-labelledby="of-band-title">
      <div className="of-band-inner">
        <span className="of-tag of-tag-wide">11.11 SALE</span>
        <h2 id="of-band-title">Executive Career Branding <em>& Personal Website.</em></h2>
        <p className="of-band-price"><s>{rs(BUNDLE.compareAt)}</s><b>{rs(BUNDLE.price)}</b><span className="of-save">Save {SAVE_PCT}%</span></p>
        <Countdown t={t} />
        <Link href={OFFER_HREF} className="of-btn" data-cta={`offer-claim-${slot}`} onClick={claim(slot)}>Claim 11.11 offer →</Link>
        {remaining !== null && remaining <= SHOW_SLOTS_AT && <p className="of-band-slots">Only {remaining} slots left</p>}
        <p className="of-band-note">100% money back guarantee.</p>
      </div>
    </section>
  );
}

/** Executive card: a gradient pill on the card's top border, like the Recommended badge. */
export function ExecTag({ market }: { market: MarketKey }) {
  const { live } = useLive(market, 60_000);
  return live ? <span className="of-card-tag">11.11 · Add website for Rs 12,500</span> : null;
}

/** Executive card: the offer box between the price and the button. The whole box is one link. */
export function ExecOfferBox({ market }: { market: MarketKey }) {
  const { live, t } = useLive(market, 60_000);
  if (!live) return null;
  return (
    <Link href={OFFER_HREF} className="of-box" data-cta="offer-claim-pricing_card" onClick={claim("pricing_card")}>
      <b>{BUNDLE.short}</b>
      <span className="of-box-row of-box-meta"><span><s>27,500</s> <strong>{rs(BUNDLE.price)}</strong></span><em>Claim →</em></span>
      <span className="of-box-meta" suppressHydrationWarning>Ends in {inline(t)}</span>
    </Link>
  );
}

/** Final CTA on pk: a glass strip under the subtext and Claim as the main button while the sale is on. */
export function FinalCtaOffer({ market, children }: { market: MarketKey; children: ReactNode }) {
  const { live, t } = useLive(market, 60_000);
  if (!live) return <>{children}</>;
  return (
    <>
      <div className="of-glass">
        <span className="of-glass-a"><span className="of-tag">11.11 SALE</span><b>{BUNDLE.headline}</b></span>
        <span className="of-glass-b"><span><s>27,500</s> <strong>{rs(BUNDLE.price)}</strong></span><span className="of-glass-time" suppressHydrationWarning>{inline(t)}</span></span>
      </div>
      <div className="final-actions">
        <Link href={OFFER_HREF} className="btn of-cta-btn min-h-14 px-8 text-[1.0625rem]" data-cta="offer-claim-final_cta" onClick={claim("final_cta")}>Claim 11.11 offer →</Link>
        <Link href="/order?market=pk" className="btn final-wa min-h-14 px-7 text-[1.0625rem]" data-cta="home-final-order">Start your order</Link>
      </div>
    </>
  );
}

/** Mobile sticky bar content while the sale is on. */
export function StickyOffer() {
  return (
    <div className="of-sticky">
      <div>
        <span className="of-sticky-k">11.11 SALE<b>{rs(BUNDLE.price)}</b></span>
        <span className="of-sticky-t">{BUNDLE.short}</span>
      </div>
      <Link href={OFFER_HREF} className="of-sticky-btn" data-cta="offer-claim-sticky" onClick={claim("sticky")}>Claim →</Link>
    </div>
  );
}

/** Announcement bar ticker: the same line repeated for a seamless loop. */
export function Ticker({ t }: { t: { d: number; h: number; m: number } }) {
  const item = (
    <span className="of-tick-item">
      <span className="of-tick-name">11.11 SALE</span><i />
      {BUNDLE.short}<i />
      <s>Rs 27,500</s><b>Rs 20,000</b><i />
      <span suppressHydrationWarning>Ends in {inline(t)}</span><i />
      Claim offer →<i />
    </span>
  );
  return (
    <span className="of-ticker">
      <span className="of-tick-track" aria-hidden="true">{item}{item}{item}{item}</span>
      <span className="of-tick-static">11.11 Sale · {BUNDLE.short} · {rs(BUNDLE.price)} →</span>
    </span>
  );
}
