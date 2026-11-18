"use client";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { BUNDLE, BUNDLE_NOW, SALE, offerHref, onlinePrice } from "@/config/offers";
import { MARKETS, formatPricingPrice, getPackages, type MarketKey } from "@/config/markets";
import { usePathname } from "next/navigation";
import { trackFunnel, trackPromotion, type Commerce } from "@/lib/analytics";
import { useCountdown, useOffer, useSale } from "./useOffer";
import "./offer.css";

/**
 * November Sale (pk). One offer: "Executive Branding & Personal Website" (short: "Executive Branding & Website"),
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
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  });
  return ref;
}

export const inline = (t: { d: number; h: number; m: number }) => `${t.d}d ${pad(t.h)}h ${pad(t.m)}m`;
export const OFFER_ITEM: Commerce = { name: BUNDLE.title, ids: [BUNDLE.packageId, BUNDLE.addonId], value: BUNDLE.price, currency: "PKR", items: 2 };
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
      <span className="of-pill-chip">Nov</span>
      <span className="of-pill-long">{BUNDLE.short} · {rs(BUNDLE_NOW)}</span>
      <span className="of-pill-short">Executive & Website · {rs(BUNDLE_NOW)}</span>
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
          <b suppressHydrationWarning>{pad(n)}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

/** The offer band (id="offer") under the hero: the November Sale (20% off online) with its countdown. */
export function OfferBand({ market, slot = "home_band" }: { market: MarketKey; slot?: string }) {
  const { live, t } = useSale(1000);
  const ref = useSeen(slot);
  if (!live || market !== "pk") return null;
  return (
    <section id="offer" ref={ref} className="of-band" aria-labelledby="of-band-title">
      <div className="wrap of-band-grid">
        <div className="of-band-copy">
          <span className="of-tag of-tag-big"><Flame size={15} />{SALE.tag}</span>
          <h2 id="of-band-title">Flat 20% off <em>all packages.</em></h2>
          <ul className="of-list">
            {SALE.bullets.map((item) => (
              <li key={item}><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 8.5 3.2 3L13 4.5" /></svg>{item}</li>
            ))}
          </ul>
        </div>
        <div className="of-price-card">
          <p className="of-was">Sale ends 30 Nov</p>
          <p className="of-ends" suppressHydrationWarning>Ends in {inline(t)}</p>
          <Countdown t={t} />
          <a href="#pricing" className="of-btn" data-cta={`offer-see-plans-${slot}`} onClick={() => trackPromotion("select_promotion", "sale-20", slot)}>See plans</a>
          <p className="of-band-note">100% money back guarantee</p>
        </div>
      </div>
    </section>
  );
}

/** Executive card: a gradient pill on the card's top border, like the Recommended badge. */
export function ExecTag({ market }: { market: MarketKey }) {
  const { live } = useLive(market, 60_000);
  return live ? <span className="of-card-tag">November Sale</span> : null;
}

/** Executive card: the offer box between the price and the button. The whole box is one link. */
export function ExecUpgrade({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`of-up${on ? " of-up-on" : ""}`}>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} />
      <span className="of-up-box" aria-hidden="true"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8.5 3.2 3L13 4.5" /></svg></span>
      <span className="of-up-body">
        <b>Upgrade to the November Bundle</b>
        <span className="of-up-row"><span>Executive Branding</span><span>7,500</span></span>
        <span className="of-up-row"><span>Personal Website + domain</span><span>20,000</span></span>
        <span className="of-up-row of-up-total"><span>Worth <s>27,500</s></span><strong>Both for {rs(BUNDLE_NOW)}</strong></span>
      </span>
    </label>
  );
}

/** Claim button for the ticked bundle. */
export function ExecClaim() {
  return <Link href={OFFER_HREF} className="of-exec-claim" data-cta="offer-claim-pricing_card" onClick={claim("pricing_card")}>Claim November Bundle →</Link>;
}

/**
 * Final CTA on pk while the sale is on: a checklist and two stats under the subtext, and a navy bundle card
 * in place of the CV image (stacked under the subtext on mobile). Otherwise the normal buttons.
 */
export function FinalCtaOffer({ market, blog = false, children }: { market: MarketKey; blog?: boolean; children: ReactNode }) {
  const { live, t } = useSale(1000);
  if (!live || market !== "pk") return <>{children}</>;
  return (
    <>
      <div className="of-fstats"><p><b>1,800+</b>Professionals helped</p><p><b>100%</b>Recommended on Facebook</p></div>
      <div className="of-fcard">
        <div className="of-fcard-top"><span className="of-tag">{SALE.tag}</span><span>Ends 30 Nov</span></div>
        <p className="of-fcard-title">{SALE.headline}</p>
        <ul className="of-fcard-list">{SALE.bullets.map((x) => <li key={x}><span className="of-tick" aria-hidden="true">✓</span> {x}</li>)}</ul>
        <Countdown t={t} />
        <a href={blog ? "/#pricing" : "#pricing"} className="of-btn of-btn-blue of-fcard-btn" data-cta={blog ? "blog-final-see-plans" : "final-see-plans"}>See plans</a>
      </div>
    </>
  );
}

/** Mobile sticky bar content while the sale is on. */
export function StickyOffer() {
  return (
    <div className="of-sticky">
      <div>
        <span className="of-sticky-k">NOVEMBER SALE<b>{rs(BUNDLE_NOW)}</b></span>
        <span className="of-sticky-t">{BUNDLE.short}</span>
      </div>
      <Link href={OFFER_HREF} className="of-sticky-btn" data-cta="offer-claim-sticky" onClick={claim("sticky")}>Claim →</Link>
    </div>
  );
}

/** Announcement bar: one static line that fades between two messages. */
export const BAR_MESSAGES = [
  { href: "/#pricing", long: <><span className="of-hl">November Sale:</span> Flat 20% off all packages · See plans →</>, short: <><span className="of-hl">November Sale:</span> Flat 20% off · See plans →</> },
];
export function Ticker({ i }: { i: number }) {
  return (
    <span className="of-ticker">
      {BAR_MESSAGES.map((m, k) => (
        <span key={k} className={`of-msg${k === i ? " of-msg-on" : ""}`} aria-hidden={k !== i}>
          <span className="of-msg-long">{m.long}</span><span className="of-msg-short">{m.short}</span>
        </span>
      ))}
    </span>
  );
}



/** Final CTA card on every page. While the sale is on: the white sale card with the countdown. After SALE.endsAt: plans from the lowest full price, no countdown. */
export function FinalCtaCard() {
  const path = usePathname();
  const { live, t } = useSale(1000);
  const href = path === "/" || path === "/offer" ? "#pricing" : "/pricing#plans";
  // The lowest plan price, and the same plan at the online (sale) price.
  const m = MARKETS.pk;
  const low = Math.min(...getPackages(m).map((p) => p.price));
  const from = formatPricingPrice(m, low);
  if (live) {
    return (
      <div className="fc-card">
        <div className="fc-top"><span className="fc-tag">{SALE.tag}</span><span>Ends 30 Nov</span></div>
        <p className="fc-title">{SALE.headline}</p>
        <p className="fc-price">CVs from <s>{from}</s> <b>{formatPricingPrice(m, onlinePrice(low))}</b></p>
        <div className="fc-count" role="timer" aria-label={`${t.d} days, ${t.h} hours and ${t.m} minutes left`}>
          {([["Days", t.d], ["Hrs", t.h], ["Min", t.m], ["Sec", t.s]] as const).map(([label, n]) => (
            <div key={label}><b suppressHydrationWarning>{pad(n)}</b><span>{label}</span></div>
          ))}
        </div>
        <a href={href} className="fc-btn fc-btn-sale" data-cta="final-see-plans" onClick={() => trackPromotion("select_promotion", "sale-20", "final_cta")}>See plans</a>
      </div>
    );
  }
  return (
    <div className="fc-card fc-card-plain">
      <p className="fc-title">Plans from {from}</p>
      <a href={href} className="fc-btn fc-btn-blue" data-cta="final-see-plans">See plans</a>
    </div>
  );
}
