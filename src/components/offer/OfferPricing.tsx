"use client";
/**
 * /offer pricing: "Which one is for you?"
 * Desktop: four equal cards. Mobile: segmented tabs that swap the content of one fixed card.
 * Tab taps fire ViewContent (once per package per session). AddToCart only on the button.
 */
import Link from "next/link";
import { useState } from "react";
import Pricing, { getCardContent } from "@/components/pricing/Pricing";
import { MARKETS, formatPricingPrice, getPackages, type PackageId } from "@/config/markets";
import { onlineOpen, onlinePrice } from "@/config/offers";
import { trackFunnel } from "@/lib/analytics";
import { addPlan } from "@/lib/cart";
import "./landing.css";
import "./pricing.css";

const m = MARKETS.pk;
const money = (n: number) => formatPricingPrice(m, n);
const POPULAR: PackageId = "international-pro";

const SHORT: Record<string, { tab: string; desc: string; days: string; feats: string[]; button: string }> = {
  "cv-starter": { tab: "Basic", desc: "CV and cover letter", days: "2 days delivery", feats: ["ATS CV", "Cover letter", "Job keywords", "PDF and Word"], button: "Get started" },
  "ats-career": { tab: "Fresher", desc: "Freshers and early careers", days: "2 days delivery", feats: ["ATS / Europass CV", "Cover letter", "LinkedIn optimization", "Unlimited revisions"], button: "Get ATS ready" },
  "international-pro": { tab: "Abroad", desc: "Jobs in the Gulf and abroad", days: "2 days delivery", feats: ["Gulf / international CV", "Country cover letter", "LinkedIn makeover", "NaukriGulf profile"], button: "Go international" },
  executive: { tab: "Manager", desc: "Managers and seniors", days: "3 days delivery", feats: ["Executive CV", "Visual profile", "LinkedIn 10 posts", "Interview guide"], button: "Go executive" },
};
const TABS: PackageId[] = ["cv-starter", "ats-career", "international-pro", "executive"];

const Lock = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
const Check = () => <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 8.5 3 3 7-7" /></svg>;

export default function OfferPricing() {
  const packages = getPackages(m);
  const content = getCardContent("pk");
  const online = onlineOpen();
  const [tab, setTab] = useState<PackageId>("international-pro");
  const now = (price: number) => (online ? onlinePrice(price) : price);
  const pkg = (id: PackageId) => packages.find((p) => p.id === id)!;
  const add = (p: (typeof packages)[number]) => {
    const name = content[p.id].name;
    trackFunnel("cart", { name, ids: [p.id], value: p.price, currency: "PKR", items: 1, category: "plan" });
    addPlan(p.id, name);
  };
  const pick = (id: PackageId) => {
    setTab(id);
    trackFunnel("view", { name: content[id].name, ids: [id], value: now(pkg(id).price), currency: "PKR" });
  };

  const Card = (p: (typeof packages)[number], mobile = false) => {
    const s = SHORT[p.id];
    const pop = p.id === POPULAR;
    const old = online ? <s>{money(p.price)}</s> : null;
    const cur = <b>{money(now(p.price))}</b>;
    return (
      <article className={`op-card${pop ? " op-pop" : ""}`} aria-label={`${content[p.id].name} package`}>
        {pop && <span className="op-badge">Most popular</span>}
        <h3>{content[p.id].name}</h3>
        <p className="op-desc">{s.desc}</p>
        <p className="op-price">{mobile ? <>{cur}{old}</> : <>{old}{cur}</>}</p>
        <p className="op-days">{s.days}</p>
        <ul className="op-feats">{s.feats.map((f) => <li key={f}><Check />{f}</li>)}</ul>
        <button type="button" className={`op-btn${pop ? " op-btn-fill" : ""}`} onClick={() => add(p)} data-cta={`offer-pricing-order-${p.id}`}>{s.button}</button>
      </article>
    );
  };

  const compare = <Link href="/pricing#compare" data-cta="offer-pricing-compare">Compare all features →</Link>;

  const heading = <>Invest once. <em className="m-break">Apply with confidence.</em></>;
  const pay = <><Lock /> Pay safely with JazzCash · Easypaisa · UBL</>;

  const idx = packages.findIndex((p) => p.id === tab) + 1;

  return (
    <section id="pricing" className="op" aria-label="Pricing" data-tab={idx}>
      <div id="plans" className="wrap op-inner op-mobile-only">
        <h2 className="h2 op-title" data-anchor>{heading}</h2>
        <p className="op-sub">100% money back guarantee. Zero risk.</p>
        <div className="op-tabs" role="tablist" aria-label="Who is it for">
          {TABS.map((id) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "op-tab-on" : ""} onClick={() => pick(id)} data-cta={`offer-tab-${id}`}>{SHORT[id].tab}</button>)}
        </div>
      </div>
      <Pricing market="pk" variant="compact" anchorless plain heading={heading} note="100% money back guarantee. Zero risk." />
      <div className="op-trust"><p>{pay}<span className="op-gap" />{compare}</p></div>
    </section>
  );
}
