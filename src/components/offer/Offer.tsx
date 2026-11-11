"use client";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { BUNDLE, offerHref } from "@/config/offers";
import type { MarketKey } from "@/config/markets";
import { trackFunnel, trackPromotion, type Commerce } from "@/lib/analytics";
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
      if (e.isIntersecting) {
        trackPromotion("view_promotion", BUNDLE.id, slot);
        if (slot.endsWith("_band")) trackFunnel("view", OFFER_ITEM);
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  });
  return ref;
}

export const inline = (t: { d: number; h: number; m: number }) => `${t.d}d ${pad(t.h)}h ${pad(t.m)}m`;
const OFFER_ITEM: Commerce = { name: BUNDLE.title, ids: [BUNDLE.packageId, BUNDLE.addonId], value: BUNDLE.price, currency: "PKR", items: 2 };
const claim = (slot: string) => () => { trackPromotion("select_promotion", BUNDLE.id, slot); trackFunnel("cart", OFFER_ITEM); };

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
    <section id="offer" ref={ref} className="of-band" aria-labelledby="of-band-title">
      <div className="wrap of-band-grid">
        <div className="of-band-copy">
          <span className="of-tag of-tag-big"><Flame size={15} />11.11 SALE</span>
          <h2 id="of-band-title">Executive Career Branding <em>& Personal Website.</em></h2>
          <ul className="of-list">
            {["Premium CV and LinkedIn makeover", "Personal portfolio website", "Free domain and hosting for 1 year"].map((item) => (
              <li key={item}><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 8.5 3.2 3L13 4.5" /></svg>{item}</li>
            ))}
          </ul>
        </div>
        <div className="of-price-card">
          <p className="of-was">Total value <s>{rs(BUNDLE.compareAt)}</s></p>
          <p className="of-now">{rs(BUNDLE.price)}</p>
          <span className="of-save">You save {rs(BUNDLE.compareAt - BUNDLE.price)}</span>
          <p className="of-ends" suppressHydrationWarning>Ends in {inline(t)}</p>
          <Countdown t={t} />
          <Link href={OFFER_HREF} className="of-btn" data-cta={`offer-claim-${slot}`} onClick={claim(slot)}>Claim 11.11 offer →</Link>
          {remaining !== null && remaining <= SHOW_SLOTS_AT && <p className="of-band-slots">Only {remaining} slots left</p>}
          <p className="of-band-note">Money back guarantee · <Link href="/terms#offers">T&C apply</Link></p>
        </div>
      </div>
    </section>
  );
}

/** Executive card: a gradient pill on the card's top border, like the Recommended badge. */
export function ExecTag({ market }: { market: MarketKey }) {
  const { live } = useLive(market, 60_000);
  return live ? <span className="of-card-tag">11.11 Sale</span> : null;
}

/** Executive card: the offer box between the price and the button. The whole box is one link. */
export function ExecUpgrade({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`of-up${on ? " of-up-on" : ""}`}>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} />
      <span className="of-up-box" aria-hidden="true"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8.5 3.2 3L13 4.5" /></svg></span>
      <span className="of-up-body">
        <b>Upgrade to the 11.11 Bundle</b>
        <span className="of-up-row"><span>Executive Career Branding</span><span>7,500</span></span>
        <span className="of-up-row"><span>Personal Website + domain</span><span>20,000</span></span>
        <span className="of-up-row of-up-total"><span>Worth <s>27,500</s></span><strong>Both for {rs(BUNDLE.price)}</strong></span>
      </span>
    </label>
  );
}

/** Claim button for the ticked bundle. */
export function ExecClaim() {
  return <Link href={OFFER_HREF} className="of-exec-claim" data-cta="offer-claim-pricing_card" onClick={claim("pricing_card")}>Claim 11.11 Bundle →</Link>;
}

/**
 * Final CTA on pk while the sale is on: a checklist and two stats under the subtext, and a navy bundle card
 * in place of the CV image (stacked under the subtext on mobile). Otherwise the normal buttons.
 */
export function FinalCtaOffer({ market, blog = false, children }: { market: MarketKey; blog?: boolean; children: ReactNode }) {
  const { live, t } = useLive(market, 60_000);
  if (!live) return <>{children}</>;
  return (
    <>
      <div className="of-fstats"><p><b>1,800+</b>Professionals helped</p><p><b>100%</b>Recommended on Facebook</p></div>
      <div className="of-fcard">
        <div className="of-fcard-top"><span className="of-tag">11.11 BUNDLE</span><span suppressHydrationWarning>Ends in {inline(t)}</span></div>
        <p className="of-fcard-title">Executive Career Branding <em>& Personal Website</em></p>
        <p className="of-fcard-was">Worth <s>{rs(BUNDLE.compareAt)}</s></p>
        <p className="of-fcard-price"><b>{rs(BUNDLE.price)}</b><span>Save 7,500</span></p>
        <Link href={OFFER_HREF} className="of-exec-claim" data-cta="offer-claim-final_cta" onClick={claim("final_cta")}>Claim 11.11 Bundle →</Link>
        <p className="of-fcard-alt">Just need a CV? <Link href="/pricing?m=pk" data-cta={blog ? "blog-final-packages" : "final-packages"}>See all packages</Link></p>
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
