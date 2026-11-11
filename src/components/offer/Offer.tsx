"use client";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { BUNDLE, offerHref } from "@/config/offers";
import type { MarketKey } from "@/config/markets";
import { trackPromotion } from "@/lib/analytics";
import { useCountdown, useOffer } from "./useOffer";
import "./offer.css";

/** 11.11 Brand Sale (pk). Every piece hides itself when the offer ends by time or slots. */

const rs = (n: number) => `Rs ${n.toLocaleString("en-US")}`;
const pad = (n: number) => String(n).padStart(2, "0");
const HREF = offerHref(BUNDLE);
const SAVE = BUNDLE.compareAt - BUNDLE.price;

/** Live and not past the deadline. */
function useLive(market: MarketKey) {
  const { open, remaining } = useOffer(market);
  const t = useCountdown(1000);
  return { live: open && !t.done, remaining, t };
}

/** Fires view_promotion once when the element is half visible. */
function useSeen(slot: string) {
  const ref = useRef<HTMLDivElement>(null);
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

export function OfferBadge({ className = "" }: { className?: string }) {
  return <span className={`of-badge ${className}`}>{BUNDLE.title}</span>;
}

export function Countdown({ t, dark = false }: { t: { d: number; h: number; m: number; s: number }; dark?: boolean }) {
  return (
    <div className={`of-count${dark ? " of-count-dark" : ""}`} role="timer" aria-label={`${t.d} days, ${t.h} hours and ${t.m} minutes left`}>
      {([["Days", t.d], ["Hours", t.h], ["Min", t.m], ["Sec", t.s]] as const).map(([label, n]) => (
        <div key={label}><b suppressHydrationWarning>{pad(n)}</b><span>{label}</span></div>
      ))}
    </div>
  );
}

export function SlotsBar({ remaining, dark = false }: { remaining: number | null; dark?: boolean }) {
  if (remaining === null) return null;
  return (
    <div className={`of-slots${dark ? " of-slots-dark" : ""}`}>
      <p>Only <b>{remaining} of {BUNDLE.totalSlots}</b> slots left</p>
      <div className="of-track"><i style={{ width: `${(remaining / BUNDLE.totalSlots) * 100}%` }} /></div>
    </div>
  );
}

function Claim({ slot, className, children = "Claim offer →" }: { slot: string; className: string; children?: ReactNode }) {
  return (
    <Link href={HREF} className={className} data-cta={`offer-claim-${slot}`} onClick={() => trackPromotion("select_promotion", BUNDLE.id, slot)}>
      {children}
    </Link>
  );
}

/** Hero: under the buttons, before the CV mockup on mobile. */
export function HeroOfferCard({ market }: { market: MarketKey }) {
  const { live, remaining, t } = useLive(market);
  const ref = useSeen("home_hero");
  if (!live) return null;
  return (
    <div ref={ref} className="of-hero">
      <div className="of-hero-top"><OfferBadge />{remaining !== null && <span className="of-left">Only {remaining} slots left</span>}</div>
      <p className="of-hero-title">{BUNDLE.headline}</p>
      <p className="of-price"><s>{rs(BUNDLE.compareAt)}</s> <b>{rs(BUNDLE.price)}</b> <span className="of-save">Save {rs(SAVE)}</span></p>
      <div className="of-hero-foot">
        <Countdown t={t} />
        <Claim slot="home_hero" className="btn btn-primary of-hero-btn" />
      </div>
    </div>
  );
}

const EXEC = ["Premium executive CV", "One page visual profile", "Executive cover letter and bio", "LinkedIn makeover and 10 posts", "Indeed and Naukrigulf profiles", "Interview preparation guide"];
const SITE = ["Personal website design", "Mobile friendly", "Free domain and hosting for the first year", "Linked to your CV and LinkedIn"];

/** Homepage section id="bundle", right after the trust strip. */
export function BundleSection({ market }: { market: MarketKey }) {
  const { live, remaining, t } = useLive(market);
  const ref = useSeen("home_bundle");
  if (!live) return null;
  return (
    <section id="bundle" className="of-bundle" aria-labelledby="of-bundle-title">
      <div ref={ref} className="wrap of-bundle-grid">
        <div>
          <OfferBadge />
          <h2 id="of-bundle-title" className="display">Your CV, LinkedIn and website. <em>One price. {rs(BUNDLE.price)}.</em></h2>
          <div className="of-groups">
            <div>
              <h3>Executive Career Branding</h3>
              <ul>{EXEC.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
            <div>
              <h3>Portfolio website</h3>
              <ul>{SITE.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          </div>
        </div>
        <div className="of-card">
          <dl>
            <div><dt>Executive Career Branding</dt><dd>{rs(7500)}</dd></div>
            <div><dt>Portfolio website</dt><dd>{rs(20000)}</dd></div>
            <div className="of-rule"><dt>Total value</dt><dd><s>{rs(BUNDLE.compareAt)}</s></dd></div>
            <div className="of-sale"><dt>{BUNDLE.title} price</dt><dd>{rs(BUNDLE.price)}</dd></div>
            <div className="of-saved"><dt>You save</dt><dd>{rs(SAVE)}</dd></div>
          </dl>
          <Countdown t={t} dark />
          <SlotsBar remaining={remaining} dark />
          <Claim slot="home_bundle" className="of-white-btn" />
        </div>
      </div>
    </section>
  );
}

/** Executive pricing card: under its button. */
export function PricingOfferBox({ market }: { market: MarketKey }) {
  const { live, t } = useLive(market);
  if (!live) return null;
  return (
    <div className="of-box">
      <p>Add your website: {rs(7500)} + {rs(20000)} = <s>{rs(BUNDLE.compareAt)}</s></p>
      <p className="of-box-big">Get both for <b>{rs(BUNDLE.price)}</b></p>
      <p className="of-box-row"><span suppressHydrationWarning>Ends in {inline(t)}</span><Claim slot="pricing_card" className="of-box-link" /></p>
    </div>
  );
}

/** Executive card tag. */
export function OfferTag({ market }: { market: MarketKey }) {
  const { live } = useLive(market);
  return live ? <OfferBadge className="of-badge-card" /> : null;
}

/** /pricing: navy strip under the cards, a compact version of the homepage section. */
export function OfferStrip({ market }: { market: MarketKey }) {
  const { live, remaining, t } = useLive(market);
  const ref = useSeen("pricing_strip");
  if (!live) return null;
  return (
    <div ref={ref} className="of-strip" role="region" aria-label={BUNDLE.title}>
      <div>
        <OfferBadge />
        <p className="of-strip-title">{BUNDLE.headline}: <s>{rs(BUNDLE.compareAt)}</s> <b>{rs(BUNDLE.price)}</b></p>
        <p className="of-strip-meta" suppressHydrationWarning>Ends in {inline(t)}{remaining !== null && ` · ${remaining} slots left`}</p>
      </div>
      <Claim slot="pricing_strip" className="of-white-btn of-strip-btn" />
    </div>
  );
}

/** Final CTA on pk: an offer line and Claim as the main button while the sale is on; otherwise the normal buttons. */
export function FinalCtaOffer({ market, children }: { market: MarketKey; children: ReactNode }) {
  const { live, t } = useLive(market);
  if (!live) return <>{children}</>;
  return (
    <>
      <p className="of-final-line" suppressHydrationWarning>{BUNDLE.title}: Executive + website for {rs(BUNDLE.price)} · ends in {inline(t)}</p>
      <div className="final-actions">
        <Claim slot="final_cta" className="btn btn-white min-h-14 px-8 text-[1.0625rem]" />
        <Link href="/order?market=pk" className="btn final-wa min-h-14 px-7 text-[1.0625rem]" data-cta="home-final-order">Start your order</Link>
      </div>
    </>
  );
}
