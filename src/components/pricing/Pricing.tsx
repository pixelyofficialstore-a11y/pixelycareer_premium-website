"use client";

import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import { useEffect, useState, type ReactNode } from "react";
import { saveMarket } from "@/components/ui/useMarket";
import Faq from "@/components/sections/Faq";
import { OfferBand, inline, useLive } from "@/components/offer/Offer";
import { BUNDLE, BUNDLE_NOW, onlineOpen, onlinePrice } from "@/config/offers";
import { MARKETS, formatPricingPrice, getComparison, getComparisonGroups, getPackages, orderHref, type MarketKey } from "@/config/markets";
import { WHATSAPP_URL , whatsappMessage } from "@/lib/site";
import styles from "./Pricing.module.css";


/** Card copy. The US says "resume" where the others say "CV"; Naukrigulf only for the Gulf and Pakistan. */
function getCardContent(market: MarketKey) {
  const doc = market === "us" ? "resume" : "CV";
  const gulf = market === "ae" || market === "sa" || market === "pk";
  return {
    "ats-career": {
      audience: "For beginners and early careers",
      name: "ATS Career",
      button: "Get ATS Ready",
      lead: "",
      items: [`ATS / Europass ${doc}, 1 to 2 pages`, "Tailored cover letter", "LinkedIn content optimization", "Keywords for your target job", "PDF & editable Word files", "Unlimited revisions until satisfied"],
      support: "30 days",
      delivery: "2 days",
      updates: "3",
    },
    "international-pro": {
      audience: "For 3+ years of experience",
      name: "International Career Pro",
      button: "Go Global",
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
      audience: "For 7+ years of experience",
      name: "Executive Career Branding",
      button: "Build My Brand",
      lead: "Everything in International Pro, plus:",
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
}: {
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
  const base = getComparison(m);
  const comparison = (showBundle
    ? base.flatMap((r) => (r[0] === "Digital contact card" ? [[...r, r[3]], ["Personal website", "✕", "✕", "✕", "✓"]] : [r[0] === "Delivery" ? [...r, "5 days"] : [...r, r[3]]]))
    : base) as string[][];
  const GROUPS = getComparisonGroups(comparison as [string, string, string, string][]);
  const cardContent = getCardContent(market);
  const cols = [
    ...packages.map((p) => ({ id: p.id as string, name: p.name, price: online ? formatPricingPrice(m, onlinePrice(p.price)) : p.priceLabel, href: orderHref(m, p.id), button: cardContent[p.id].button })),
    ...(showBundle ? [{ id: "executive_bundle", name: "11.11 Sale Bundle", price: formatPricingPrice(m, BUNDLE_NOW), href: "/order?market=pk&package=executive&offer=brand-bundle", button: "Claim My Bundle" }] : []),
  ];
  const HeroHeading = standalone ? "h1" : "h2";
  const [selectedPackage, setSelectedPackage] = useState(1);

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
          <HeroHeading className={`${styles.heroTitle} ${compact || standalone ? styles.compactHeroTitle : ""}${standalone ? " display" : ""}`}>
            {heading ?? (compact || standalone ? <>Invest once. <em className="m-break">Apply with confidence.</em></> : <>One price. <em>No surprises.</em></>)}
          </HeroHeading>
          {(compact || standalone) && (
            <p className={styles.guaranteeSub}>
              {note ?? "100% money back guarantee. Zero risk."}
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

      <section id={compact ? undefined : "pricing"} className={`${styles.packages} ${compact ? styles.compactPackages : ""}`} aria-label="Pricing packages">
        <div className={styles.sectionInner}>
          <ul className={`${styles.priceGrid} ${compact ? styles.compactPriceGrid : ""} ${showBundle ? styles.grid4 : ""}`}>
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
                    <Link href={orderHref(m, p.id)} className={`${styles.choose} ${recommended ? styles.choosePrimary : ""}`} data-cta={compact ? `home-pricing-order-${p.id}` : `pricing-choose-${p.id}`}>
                      {content.button}<ArrowIcon />
                    </Link>
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
              <li className={`${styles.cardSlot} ${styles.bundleSlot}`} data-reveal>
                <article className={`${styles.card} price-card ${styles.cardBundle}`} aria-label="11.11 Sale Bundle package">
                  <span className={`${styles.badge} ${styles.badgeSale}`}>11.11 Sale</span>
                  <h3 className={`${styles.packageName} price-name`}>11.11 Sale Bundle</h3>
                  <p className={styles.audience}>Executive Branding + Website</p>
                  <p className={styles.saleLabel} suppressHydrationWarning>Ends in {inline(saleT)} · {saleLeft ?? BUNDLE.totalSlots} slots left</p>
                  <div className={styles.pricePair}><s className={styles.compareAt}><PriceAmount label={formatPricingPrice(m, BUNDLE.compareAt)} /></s><PriceAmount label={formatPricingPrice(m, BUNDLE_NOW)} /></div>
                  <Link href="/order?market=pk&package=executive&offer=brand-bundle" className={`of-exec-claim ${styles.bundleCta}`} data-cta="pricing-claim-bundle">Claim My Bundle<ArrowIcon /></Link>
                  <hr className={styles.divider} />
                  <div className={styles.includedContent}>
                    <ul className={styles.itemList}>
                      <li className={styles.listLead}>Everything in Executive, plus:</li>
                      <li><span className={styles.textCheck} aria-hidden="true">✓</span>Personal portfolio website</li>
                      <li><span className={styles.textCheck} aria-hidden="true">✓</span>Free domain &amp; hosting for the first year</li>
                    </ul>
                  </div>
                  <div className={styles.supportRow}>
                    <div className={styles.supportBlock}><strong>{cardContent.executive.support}</strong><span>Support</span></div>
                    <div className={styles.supportBlock}><strong>5 days</strong><span>Delivery</span></div>
                    <div className={styles.supportBlock}><strong>{cardContent.executive.updates}</strong><span>Free updates</span></div>
                  </div>
                </article>
              </li>
            )}
          </ul>
          {compact && (
            <nav className={styles.compactCta} aria-label="Pricing details">
              <Link href={`/pricing?m=${market}#compare`} data-cta="home-pricing-compare">
                Compare all features <ArrowIcon />
              </Link>
            </nav>
          )}
        </div>
      </section>

      {standalone && market === "pk" && <OfferBand market={market} slot="pricing_band" />}
      {!compact && <section id="compare" className={styles.compare} aria-labelledby="compare-heading">
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle} id="compare-heading">Compare <em className="m-break">every detail.</em></h2>
          <div className={`${styles.compareCard} ${styles.desktopCompare}`}>
            <table className={styles.table}>
              <colgroup><col /><col /><col className={styles.recommendedCol} /><col />{showBundle && <col />}</colgroup>
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Feature</span></th>
                  {cols.map((p, i) => <th scope="col" className={i === 1 ? styles.recommendedCol : i === 3 ? styles.bundleCol : ""} key={p.id}>
                    {p.name}<span className={styles.tablePrice}>{p.price}</span>
                  </th>)}
                </tr>
              </thead>
              <tbody>
                {comparison.map(([label, ...values], index) => (
                  <FragmentRow
                    key={label}
                    groups={GROUPS}
                    label={label}
                    values={values}
                    index={index}
                  />
                ))}
              </tbody>
              <tfoot>
                <tr className={styles.ctaRow}>
                  <td />
                  {cols.map((p, i) => (
                    <td className={i === 1 ? styles.recommendedCol : i === 3 ? styles.bundleCol : ""} key={p.id}>
                      <Link href={p.href} className={`${styles.choose} ${i === 1 ? styles.choosePrimary : ""}`} data-cta={`pricing-table-${p.id}`}>{p.button}</Link>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
          <div className={styles.mobileCompare}>
            <div className={styles.mobileTabs} role="tablist" aria-label="Choose a package to compare">
              {cols.map((p, index) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedPackage === index}
                  aria-controls="pricing-mobile-comparison"
                  className={`${styles.mobileTab} ${selectedPackage === index ? styles.mobileTabActive : ""}`}
                  onClick={() => setSelectedPackage(index)}
                >
                  {["ATS", "Pro", "Executive", "11.11 Bundle"][index]}
                </button>
              ))}
            </div>
            <div className={styles.mobileCompareCard} id="pricing-mobile-comparison" role="tabpanel">
              <div className={styles.mobileCompareTitle}>
                <strong>{cols[selectedPackage]?.name}</strong>
                <span>{cols[selectedPackage]?.price}</span>
              </div>
              {GROUPS.map((group) => (
                <div key={group.name}>
                  <p className={styles.mobileGroup}>{group.name}</p>
                  {comparison.slice(group.start, group.end).map(([label, ...values]) => (
                    <div className={styles.mobileRow} key={label}>
                      <span>{label}</span>
                      <span className={styles.mobileRowValue}><CellValue value={values[selectedPackage]} /></span>
                    </div>
                  ))}
                </div>
              ))}
              <Link href={cols[selectedPackage]?.href ?? orderHref(m)} className={`${styles.choose} ${selectedPackage === 1 ? styles.choosePrimary : ""} ${styles.mobileChoose}`} data-cta={`pricing-mobile-${cols[selectedPackage]?.id}`}>{cols[selectedPackage]?.button}</Link>
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

function FragmentRow({ label, values, index, groups }: { label: string; values: string[]; index: number; groups: { name: string; start: number; end: number }[] }) {
  const group = groups.find((item) => item.start === index);
  return (
    <>
      {group && <tr className={styles.groupRow}><th colSpan={values.length + 1}>{group.name}</th></tr>}
      <tr>
        <th scope="row">{label}</th>
        {values.map((value, column) => <td className={column === 1 ? styles.recommendedCol : column === 3 ? styles.bundleCol : ""} key={column}><CellValue value={value} /></td>)}
      </tr>
    </>
  );
}
