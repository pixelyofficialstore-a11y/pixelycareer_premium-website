"use client";

import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import { useEffect, type ReactNode } from "react";
import { saveMarket } from "@/components/ui/useMarket";
import Faq from "@/components/sections/Faq";
import { OFFER_ITEM, inline, useLive } from "@/components/offer/Offer";
import { trackFunnel } from "@/lib/analytics";
import { BUNDLE, BUNDLE_ALL_LINE, BUNDLE_ITEMS, BUNDLE_NOW, onlineOpen, onlinePrice } from "@/config/offers";
import { MARKETS, PLAN_TAGLINE, formatPricingPrice, getComparison, getComparisonGroups, getPackages, orderHref, type MarketKey } from "@/config/markets";
import { WHATSAPP_URL , whatsappMessage } from "@/lib/site";
import styles from "./Pricing.module.css";
import { addPlan } from "@/lib/cart";


/** Card copy. The US says "resume" where the others say "CV"; Naukrigulf only for the Gulf and Pakistan. */
function getCardContent(market: MarketKey) {
  const doc = market === "us" ? "resume" : "CV";
  const gulf = market === "ae" || market === "sa" || market === "pk";
  return {
    "cv-starter": {
      audience: PLAN_TAGLINE["cv-starter"],
      name: "CV Starter",
      button: "Get Started",
      lead: "",
      items: [`ATS ${doc}, 1 to 2 pages`, "Tailored cover letter", "Keywords for your target job", "PDF & editable Word files"],
      support: "30 days",
      delivery: "2 days",
      updates: "2",
    },
    "ats-career": {
      audience: PLAN_TAGLINE["ats-career"],
      name: "ATS Career",
      button: "Get ATS Ready",
      lead: "",
      items: [`ATS / Europass ${doc}, 1 to 2 pages`, "Tailored cover letter", "LinkedIn content optimization", "Keywords for your target job", "PDF & editable Word files", "Unlimited revisions until satisfied"],
      support: "30 days",
      delivery: "2 days",
      updates: "3",
    },
    "international-pro": {
      audience: PLAN_TAGLINE["international-pro"],
      name: "International Career Pro",
      button: "Go International",
      lead: "Everything in ATS Career, plus:",
      items: [
        gulf ? "Gulf & international standard CV" : `International standard ${doc}`,
        "Country specific cover letter",
        "Complete LinkedIn optimization & makeover",
        gulf ? "Indeed & Naukrigulf profile optimization" : "Indeed profile optimization",
        "Bio statement & digital contact card",
      ],
      support: "3 months",
      delivery: "2 days",
      updates: "3",
    },
    executive: {
      audience: PLAN_TAGLINE.executive,
      name: "Executive Branding",
      button: "Go Executive",
      lead: "Everything in International Career Pro, plus:",
      items: [`Premium executive ${doc}`, "One page executive visual profile", "Executive cover letter & bio statement", "LinkedIn content pack (10 posts)", "Interview preparation guide (PDF)"],
      support: "6 months",
      delivery: "3 days",
      updates: "4",
    },
  };
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m4.5 10.2 3.4 3.4 7.7-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PriceAmount({ label }: { label: string }) {
  const parts = label.match(/^(.+?)\s?([\d,]+)$/);
  if (!parts) return <span className={styles.price}>{label}</span>;
  return (
    <span className={styles.price}>
      <span className={styles.priceUnit}>{parts[1]}</span>
      <span className={styles.priceNumber}>{parts[2]}</span>
    </span>
  );
}

function CellValue({ value }: { value: string }) {
  if (value === "✓") return <span className={styles.includedMark} aria-label="Included">✓</span>;
  if (value === "·" || value === "✕") return <svg className={styles.notIncludedIcon} viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" role="img" aria-label="Not included"><path d="m3 3 8 8M11 3l-8 8" /></svg>;
  return <>{value}</>;
}


export default function Pricing({
  market,
  standalone = false,
  variant = "default",
  faqItems = [],
  heading,
  note,
  tag,
  bare = false,
  plain = false,
}: {
  /** No extra lines under the cards (the homepage and /pricing). */
  plain?: boolean;
  /** Cards only under the heading: no subtitle, no extra lines (the /offer page). */
  bare?: boolean;
  heading?: ReactNode;
  note?: string;
  tag?: { id: string; text: string };
  market: MarketKey;
  standalone?: boolean;
  variant?: "default" | "compact";
  faqItems?: { q: string; a: string }[];
}) {
  const compact = variant === "compact";
  const m = MARKETS[market];
  const packages = getPackages(m);
  const doc = market === "us" ? "resume" : "CV";
  // 11.11 Sale (pk): a 4th card (first on mobile) and a bundle column. Gone after endsAt.
  const { live: saleLive, t: saleT, remaining: saleLeft } = useLive(market, 60_000);
  const showBundle = market === "pk" && saleLive;
  const online = market === "pk" && onlineOpen();
  const cardContent = getCardContent(market);
  /** One "Add to cart" for the cards and the table. */
  const addToCart = (p: (typeof packages)[number]) => () => {
    const name = cardContent[p.id].name;
    trackFunnel("cart", { name, ids: [p.id], value: p.price, currency: "PKR", items: 1, category: "plan" });
    addPlan(p.id, name);
  };
  // The table: one column per card, in card order. Names, prices, support, delivery and updates come from the card config.
  const fromCard: Record<string, "support" | "delivery" | "updates"> = { "WhatsApp support": "support", Delivery: "delivery", "Free updates after delivery": "updates" };
  const comparison = getComparison(m).map(([label, ...v]) => (fromCard[label] ? [label, ...packages.map((p) => cardContent[p.id][fromCard[label]])] : [label, ...v])) as string[][];
  const GROUPS = getComparisonGroups(comparison);
  const cols = packages.map((p) => ({
    id: p.id as string,
    name: cardContent[p.id].name,
    now: online ? formatPricingPrice(m, onlinePrice(p.price)) : p.priceLabel,
    was: online ? p.priceLabel : p.showCompareAt ? p.compareAtLabel : null,
    top: p.id === "international-pro",
    href: orderHref(m, p.id),
    button: cardContent[p.id].button,
    add: addToCart(p),
  }));
  const HeroHeading = standalone ? "h1" : "h2";

  useEffect(() => saveMarket(market), [market]);

  return (
    <div
      id={compact ? "pricing" : undefined}
      className={`${styles.page} ${standalone ? styles.standalone : ""} ${compact ? styles.compact : ""}`}
      data-pricing-surface
      data-pricing-page={standalone || undefined}
      data-pricing-variant={compact ? "compact" : undefined}
    >
      <header className={`${styles.hero} ${compact ? styles.compactHero : ""}`}>
        <div className={styles.heroInner} data-reveal>
          {!standalone && !compact && <p className={styles.eyebrow}>Pricing</p>}
          <HeroHeading data-anchor={compact || undefined} className={`${styles.heroTitle} ${compact || standalone ? styles.compactHeroTitle : ""}${standalone ? " display" : ""}`}>
            {heading ?? (market === "pk" ? <>Choose <em>your plan</em></> : compact || standalone ? <>Invest once. <em className="m-break">Apply with confidence.</em></> : <>One price. <em>No surprises.</em></>)}
          </HeroHeading>
          {(compact || standalone) && !bare && (
            <p className={styles.guaranteeSub}>
              {note ?? (market === "pk" ? "Pay online in full and save 20%." : "100% money back guarantee. Zero risk.")}
            </p>
          )}
          {!standalone && !compact && (
            <>
              <p className={styles.heroText}>Pick a package, pay once, and get a CV written for your role and your country.</p>
              <ul className={styles.heroChips} aria-label="Included with every package">
                <li><CheckIcon />PDF and Word files</li>
                <li><CheckIcon />Revisions included</li>
                <li><CheckIcon />First draft in 2 days</li>
              </ul>
            </>
          )}
        </div>
      </header>

      <section id={market === "pk" ? "plans" : compact ? undefined : "pricing"} className={`${styles.packages} ${compact ? styles.compactPackages : ""}`} aria-label="Pricing packages">
        <div className={styles.sectionInner}>
          <ul className={`${styles.priceGrid} ${compact ? styles.compactPriceGrid : ""} ${packages.length === 4 ? styles.grid4 : ""}`}>
            {packages.map((p) => {
              const recommended = p.id === "international-pro";
              const content = getCardContent(market)[p.id];
              return (
                <li key={p.id} className={`${styles.cardSlot} ${recommended ? styles.recommendedSlot : ""}`} data-reveal>
                  <article className={`${styles.card} price-card ${recommended ? styles.cardRecommended : ""}`} aria-label={`${content.name} package`}>
                    {recommended && <span className={styles.badge}>Most Popular</span>}
                    {p.id === "executive" && <span className={`${styles.badge} ${styles.badgeBest}`}>Best Results</span>}
                    {tag?.id === p.id && <span className="sp-includes">{tag.text}</span>}
                    <h3 className={`${styles.packageName} price-name`}>{content.name}</h3>
                    <p className={styles.audience}>{content.audience}</p>
                    {online && <p className={styles.saleLabel}>11.11 Sale · Flat 20% off</p>}
                    <div className={styles.pricePair}>
                      {online ? <><s className={styles.compareAt}><PriceAmount label={p.priceLabel} /></s><PriceAmount label={formatPricingPrice(m, onlinePrice(p.price))} /></> : <>{p.showCompareAt && <s className={styles.compareAt}><PriceAmount label={p.compareAtLabel} /></s>}<PriceAmount label={p.priceLabel} /></>}
                    </div>
                    {online ? null : <p className={styles.priceNote}>{p.showCompareAt && p.compareAt > p.price ? `Save ${formatPricingPrice(m, p.compareAt - p.price)}` : "\u00a0"}</p>}
                    {market === "pk" ? (
                      <button type="button" onClick={addToCart(p)} className={`${styles.choose} ${recommended ? styles.choosePrimary : ""}`} data-cta={compact ? `home-pricing-order-${p.id}` : `pricing-choose-${p.id}`}>
                        {content.button}<ArrowIcon />
                      </button>
                    ) : (
                      <Link href={orderHref(m, p.id)} className={`${styles.choose} ${recommended ? styles.choosePrimary : ""}`} data-cta={compact ? `home-pricing-order-${p.id}` : `pricing-choose-${p.id}`}>
                        {content.button}<ArrowIcon />
                      </Link>
                    )}
                    {(
                      <>
                        <hr className={styles.divider} />
                        <div className={styles.includedContent}>
                          <ul className={styles.itemList}>
                            {content.lead && <li className={styles.listLead}>{content.lead}</li>}
                            {content.items.map((item) => <li key={item}><span className={styles.textCheck} aria-hidden="true">✓</span>{item}</li>)}
                          </ul>
                        </div>
                        <div className={styles.supportRow}>
                          <div className={styles.supportBlock}>
                            <strong>{content.support}</strong>
                            <span>Support</span>
                          </div>
                          <div className={styles.supportBlock}>
                            <strong>{content.delivery}</strong>
                            <span>Delivery</span>
                          </div>
                          <div className={styles.supportBlock}>
                            <strong>{content.updates}</strong>
                            <span>Free updates</span>
                          </div>
                        </div>
                      </>
                    )}
                  </article>
                </li>
              );
            })}
            {showBundle && (
              <li className={`${styles.cardSlot} ${styles.bundleWide}`} data-reveal>
                <article className={`${styles.card} price-card ${styles.cardBundle} ${styles.bundleRow}`} aria-label="11.11 Sale Bundle package">
                  <div>
                    <span className={`${styles.badge} ${styles.badgeSale}`}>11.11 Sale</span>
                    <h3 className={`${styles.packageName} price-name`}>Executive Branding + Personal Website</h3>
                    <p className={styles.saleLabel} suppressHydrationWarning>{saleLeft ?? BUNDLE.totalSlots} slots left · ends in {inline(saleT)}</p>
                  </div>
                  <div className={styles.pricePair}><s className={styles.compareAt}><PriceAmount label={formatPricingPrice(m, BUNDLE.compareAt)} /></s><PriceAmount label={formatPricingPrice(m, BUNDLE_NOW)} /><span className={styles.bundleOnline}>online</span></div>
                  <button type="button" onClick={() => { trackFunnel("cart", OFFER_ITEM); addPlan("executive", "11.11 Bundle", "brand-bundle"); }} className={`of-exec-claim ${styles.bundleCta}`} data-cta="pricing-claim-bundle">Claim<ArrowIcon /></button>
                </article>
              </li>
            )}
          </ul>
          {market === "pk" && !bare && !plain && (
            <p className={styles.oneDoc}>Need just one document? Add it when you place your order. <a href={whatsappMessage("Hi, I'm interested in a CV. Can you guide me?")} target="_blank" rel="noopener" data-cta="plans-whatsapp">Questions? Chat on WhatsApp</a></p>
          )}
          {compact && !bare && (
            <nav className={styles.compactCta} aria-label="Pricing details">
              <Link href={`/pricing#compare`} data-cta="home-pricing-compare">
                Compare all features <ArrowIcon />
              </Link>
            </nav>
          )}
        </div>
      </section>

      {!compact && <section id="compare" className={styles.compare} aria-labelledby="compare-heading">
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle} id="compare-heading">Compare <em className="m-break">every detail.</em></h2>
          <div className={styles.compareCard}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col"><span className="sr-only">Feature</span></th>
                    {cols.map((c) => <th scope="col" className={c.top ? styles.recommendedCol : ""} key={c.id}>
                      {c.name}<span className={styles.tablePrice}>{c.now}</span>{c.was && <s className={styles.tableWas}>{c.was}</s>}
                    </th>)}
                  </tr>
                </thead>
                <tbody>
                  {comparison.map(([label, ...values], index) => (
                    <FragmentRow key={label} groups={GROUPS} label={label} values={values} index={index} top={cols.map((c) => c.top)} />
                  ))}
                </tbody>
                <tfoot>
                  <tr className={styles.ctaRow}>
                    <td />
                    {cols.map((c) => (
                      <td className={c.top ? styles.recommendedCol : ""} key={c.id}>
                        {market === "pk" ? (
                          <button type="button" onClick={c.add} className={`${styles.choose} ${c.top ? styles.choosePrimary : ""}`} data-cta={`pricing-table-${c.id}`}>{c.button}<ArrowIcon /></button>
                        ) : (
                          <Link href={c.href} className={`${styles.choose} ${c.top ? styles.choosePrimary : ""}`} data-cta={`pricing-table-${c.id}`}>{c.button}</Link>
                        )}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <aside className={styles.customBox}>
            <span>Need a custom package?</span>
            <a href={whatsappMessage("Hi Pixely, I'd like a custom package.")} target="_blank" rel="noopener noreferrer" data-cta="pricing-custom-whatsapp">
              Message us on WhatsApp <span aria-hidden="true">→</span>
            </a>
          </aside>
        </div>
      </section>}

      {!compact && faqItems.length > 0 && <Faq items={faqItems} homepage />}
    </div>
  );
}

function FragmentRow({ label, values, index, groups, top }: { label: string; values: string[]; index: number; groups: { name: string; start: number; end: number }[]; top: boolean[] }) {
  const group = groups.find((item) => item.start === index);
  return (
    <>
      {group && <tr className={styles.groupRow}><th colSpan={values.length + 1}>{group.name}</th></tr>}
      <tr>
        <th scope="row">{label}</th>
        {values.map((value, column) => <td className={top[column] ? styles.recommendedCol : ""} key={column}><CellValue value={value} /></td>)}
      </tr>
    </>
  );
}
