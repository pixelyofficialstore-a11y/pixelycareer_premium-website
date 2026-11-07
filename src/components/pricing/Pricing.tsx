"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { saveMarket } from "@/components/ui/useMarket";
import { MARKETS, getComparison, getPackages, orderHref, type MarketKey } from "@/config/markets";
import { WHATSAPP_URL } from "@/lib/site";
import styles from "./Pricing.module.css";

const GROUPS = [
  { name: "Documents", start: 0, end: 3 },
  { name: "Profiles", start: 3, end: 7 },
  { name: "Extras", start: 7, end: 8 },
  { name: "Service", start: 8, end: 12 },
];

const CARD_CONTENT = {
  "ats-career": {
    audience: "For beginners",
    name: "ATS Career",
    button: "Choose ATS Career",
    lead: "",
    items: ["ATS CV, 1 to 2 pages", "Tailored cover letter", "LinkedIn profile content", "Keywords for your target job", "PDF and editable Word files"],
    support: "30 days",
    delivery: "2 days",
    revisions: "3 revisions",
  },
  "international-pro": {
    audience: "For professionals",
    name: "International Career Pro",
    button: "Choose International Pro",
    lead: "Everything in ATS Career, plus:",
    items: ["International standard CV", "Country specific cover letter", "Full LinkedIn makeover", "Indeed and Naukrigulf profiles", "Bio statement and digital contact card"],
    support: "3 months",
    delivery: "2 days",
    revisions: "3 revisions",
  },
  executive: {
    audience: "For executives",
    name: "Executive Career Branding",
    button: "Choose Executive",
    lead: "Everything in International Pro, plus:",
    items: ["Premium executive CV", "One page visual CV", "Executive cover letter and bio", "LinkedIn content pack (10 posts)", "Interview preparation guide"],
    support: "6 months",
    delivery: "3 days",
    revisions: "4 revisions",
  },
} as const;

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
  if (value === "·") return <span className={styles.notIncluded} aria-label="Not included" />;
  return <>{value}</>;
}

export default function Pricing({
  market,
  standalone = false,
  compact = false,
  faqItems = [],
}: {
  market: MarketKey;
  standalone?: boolean;
  compact?: boolean;
  faqItems?: { q: string; a: string }[];
}) {
  const m = MARKETS[market];
  const packages = getPackages(m);
  const comparison = getComparison(m);
  const HeroHeading = standalone ? "h1" : "h2";
  const [selectedPackage, setSelectedPackage] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => saveMarket(market), [market]);

  return (
    <div
      className={`${styles.page} ${standalone ? styles.standalone : ""} ${compact ? styles.compact : ""}`}
      data-pricing-surface
      data-pricing-variant={compact ? "compact" : undefined}
    >
      <header className={`${styles.hero} ${compact ? styles.compactHero : ""}`}>
        <div className={styles.heroInner}>
          {!standalone && !compact && <p className={styles.eyebrow}>Pricing</p>}
          <HeroHeading className={`${styles.heroTitle} ${compact ? styles.compactHeroTitle : ""}`}>
            {compact ? <>Simple pricing. <em>Real results.</em></> : <>One price. <em>No surprises.</em></>}
          </HeroHeading>
          {compact && <p className={styles.compactHeroText}>One time payment. PDF and Word files included.</p>}
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

      <section id="pricing" className={`${styles.packages} ${compact ? styles.compactPackages : ""}`} aria-label="Pricing packages">
        <div className={styles.sectionInner}>
          <ul className={`${styles.priceGrid} ${compact ? styles.compactPriceGrid : ""}`}>
            {packages.map((p) => {
              const recommended = p.id === "international-pro";
              const content = CARD_CONTENT[p.id];
              return (
                <li key={p.id} className={`${styles.cardSlot} ${recommended ? styles.recommendedSlot : ""}`}>
                  <article className={`${styles.card} price-card ${recommended ? styles.cardRecommended : ""} ${compact ? styles.compactCard : ""}`} aria-label={`${content.name} package`}>
                    {recommended && <span className={styles.badge}>Recommended</span>}
                    <h3 className={`${styles.packageName} price-name`}>{content.name}</h3>
                    <p className={styles.audience}>{content.audience}</p>
                    <div className={styles.pricePair}>
                      {p.showCompareAt && <s className={styles.compareAt}><PriceAmount label={p.compareAtLabel} /></s>}
                      <PriceAmount label={p.priceLabel} />
                    </div>
                    <p className={styles.resultLine}><ArrowIcon className={styles.resultArrow} /><span>{m.pricingResults[p.id]}</span></p>
                    <Link href={orderHref(m, p.id)} className={`${styles.choose} ${recommended ? styles.choosePrimary : ""}`} data-cta={`pricing-choose-${p.id}`}>
                      {content.button}<ArrowIcon />
                    </Link>
                    {compact ? (
                      <div className={styles.compactSupportRow}>
                        <span>{content.support} Support</span><span aria-hidden="true">·</span>
                        <span>{content.delivery} Delivery</span><span aria-hidden="true">·</span>
                        <span>{content.revisions}</span>
                      </div>
                    ) : (
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
                            <strong>{content.revisions}</strong>
                            <span>Revisions</span>
                          </div>
                        </div>
                      </>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
          {compact && (
            <nav className={styles.compactCta} aria-label="Pricing details and questions">
              <Link href={`/pricing?m=${market}`} data-cta="home-pricing-compare">
                Compare every feature <ArrowIcon />
              </Link>
              <span className={styles.compactCtaDivider} aria-hidden="true">·</span>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" data-cta="home-pricing-whatsapp">
                Not sure? Ask on WhatsApp
              </a>
            </nav>
          )}
        </div>
      </section>

      {!compact && <section className={styles.compare} aria-labelledby="compare-heading">
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle} id="compare-heading">Compare <em>every detail.</em></h2>
          <div className={`${styles.compareCard} ${styles.desktopCompare}`}>
            <table className={styles.table}>
              <colgroup><col /><col /><col className={styles.recommendedCol} /><col /></colgroup>
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Feature</span></th>
                  {packages.map((p, i) => <th scope="col" className={i === 1 ? styles.recommendedCol : ""} key={p.id}>
                    {p.name}<span className={styles.tablePrice}>{p.priceLabel}</span>
                  </th>)}
                </tr>
              </thead>
              <tbody>
                {comparison.map(([label, ...values], index) => (
                  <FragmentRow
                    key={label}
                    label={label}
                    values={values}
                    index={index}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.mobileCompare}>
            <div className={styles.mobileTabs} role="tablist" aria-label="Choose a package to compare">
              {packages.map((p, index) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedPackage === index}
                  aria-controls="pricing-mobile-comparison"
                  className={`${styles.mobileTab} ${selectedPackage === index ? styles.mobileTabActive : ""}`}
                  onClick={() => setSelectedPackage(index)}
                >
                  {index === 0 ? "ATS" : index === 1 ? "Pro" : "Executive"}
                </button>
              ))}
            </div>
            <div className={styles.mobileCompareCard} id="pricing-mobile-comparison" role="tabpanel">
              <div className={styles.mobileCompareTitle}>
                <strong>{packages[selectedPackage].name}</strong>
                <span>{packages[selectedPackage].priceLabel}</span>
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
            </div>
          </div>

          <aside className={styles.customStrip}>
            <p><strong>Need something different?</strong> Europass CV, a portfolio website, or a package for your team. We&apos;ll build it around you.</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={styles.whatsAppLink} data-cta="pricing-custom-whatsapp">
              Ask on WhatsApp <ArrowIcon />
            </a>
          </aside>
        </div>
      </section>}

      {!compact && faqItems.length > 0 && (
        <section className={styles.faq} aria-labelledby="faq-heading">
          <div className={`${styles.sectionInner} ${styles.faqLayout}`}>
            <div className={styles.faqIntro}>
              <h2 className={styles.sectionTitle} id="faq-heading">Fair <em>questions.</em></h2>
              <p className={styles.faqContact}>Still unsure? <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Ask us on WhatsApp <span aria-hidden="true">→</span></a></p>
            </div>
            <div className={styles.faqList}>
              {faqItems.map(({ q, a }, index) => {
                const open = openFaq === index;
                const answerId = `pricing-faq-answer-${index}`;
                return (
                  <article className={styles.faqItem} key={q}>
                    <h3>
                      <button
                        type="button"
                        className={styles.faqQuestion}
                        aria-expanded={open}
                        aria-controls={answerId}
                        onClick={() => setOpenFaq(open ? null : index)}
                      >
                        {q}<span className={styles.faqPlus} aria-hidden="true">+</span>
                      </button>
                    </h3>
                    <div id={answerId} className={`${styles.faqAnswer} ${open ? styles.faqAnswerOpen : ""}`} aria-hidden={!open} inert={!open}>
                      <div className={styles.faqAnswerInner}><p>{a}</p></div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function FragmentRow({ label, values, index }: { label: string; values: string[]; index: number }) {
  const group = GROUPS.find((item) => item.start === index);
  return (
    <>
      {group && <tr className={styles.groupRow}><th colSpan={4}>{group.name}</th></tr>}
      <tr>
        <th scope="row">{label}</th>
        {values.map((value, column) => <td className={column === 1 ? styles.recommendedCol : ""} key={column}><CellValue value={value} /></td>)}
      </tr>
    </>
  );
}
