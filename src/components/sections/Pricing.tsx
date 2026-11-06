"use client";
import Link from "next/link";
import { useId, useState } from "react";
import { MARKETS, getComparison, getPackages, orderHref, type MarketKey } from "@/config/markets";
import { ArrowDown, ArrowRight } from "@/components/ui/Icons";
import { refreshScroll } from "@/lib/motion";
import { WHATSAPP_URL } from "@/lib/site";

const SPLIT_PRICE = /^(\D+)\s?([\d,]+)$/;

export default function Pricing({ market, standalone = false }: { market: MarketKey; standalone?: boolean }) {
  const m = MARKETS[market];
  const [open, setOpen] = useState(standalone);
  const panel = useId();
  const packages = getPackages(m);

  return (
    <section id="pricing" aria-labelledby={standalone ? undefined : "pricing-title"} aria-label={standalone ? "Packages" : undefined} className={standalone ? "bg-tint py-16 lg:py-20" : "section bg-tint"}>
      <div className="wrap">
        {standalone ? (
          <div className="flex items-center justify-center gap-2 text-sm text-navy/70">
            Prices in {m.currency}
            {!m.approved && <span className="confirm">[CONFIRM pricing]</span>}
          </div>
        ) : (
          <div data-reveal>
            <p className="label">Pricing</p>
            <h2 id="pricing-title" className="h2 mt-6">
              Choose your <em>package.</em>
            </h2>
            <p className="mt-5 text-lg text-navy/70">Clear prices. First delivery in 2–3 days.</p>
            {!m.approved && (
              <p className="mt-3">
                <span className="confirm">[CONFIRM pricing]</span>
              </p>
            )}
          </div>
        )}

        <ul className="price-grid">
          {packages.map((p) => {
            const exec = p.id === "executive";
            const rec = p.id === "international-pro";
            const [, unit, value] = p.priceLabel.match(SPLIT_PRICE) ?? [];
            return (
              <li key={p.id} className={`price-card lift ${exec ? "price-exec" : ""} ${rec ? "price-rec" : ""}`} data-reveal>
                {rec && <span className="price-badge">Recommended</span>}
                <p className="price-tier">{p.tier}</p>
                <h3 className="price-name">{p.name}</h3>
                <p className="price-for">{p.forLine}</p>
                <p className={m.symbol ? "price-amount price-amount-sym" : "price-amount"}>
                  <small>{unit?.trim()}</small>{m.symbol ? "" : " "}<b>{value}</b>
                </p>
                <div className="price-value">
                  {p.value.map((v) => (
                    <div key={v.label}>
                      <b>{v.n}</b>
                      <span>{v.label}</span>
                    </div>
                  ))}
                </div>
                <div>
                  {p.lead && <p className="price-lead">{p.lead}</p>}
                  <ul className="price-items">
                    {p.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <p className="price-extras">Same day {p.sameDayLabel}</p>
                <Link href={orderHref(m, p.id)} className="price-btn" data-cta={`pricing-choose-${p.id}`}>
                  {p.button}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 text-center">
          <button type="button" className="price-toggle" aria-expanded={open} aria-controls={panel} onClick={() => setOpen(!open)}>
            {open ? "Hide comparison" : "Compare all features"}
            <span className={`inline-block transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
              <ArrowDown />
            </span>
          </button>
        </div>
        <div
          id={panel}
          inert={!open}
          onTransitionEnd={(e) => {
            if (e.propertyName === "grid-template-rows") refreshScroll();
          }}
          className={`grid transition-[grid-template-rows] duration-500 ease-out-soft ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          <div className="overflow-hidden">
            {/* Scrolls inside its own box on small screens */}
            <div className="price-table-box" tabIndex={open ? 0 : -1} role="region" aria-label="Package comparison">
              <table className="price-table">
                <thead>
                  <tr>
                    <th scope="col">Included</th>
                    <th scope="col">ATS Career</th>
                    <th scope="col">International Pro</th>
                    <th scope="col" className="price-th-gold">
                      Executive
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getComparison(m).map(([row, ...values]) => (
                    <tr key={row}>
                      <th scope="row">{row}</th>
                      {values.map((v, i) => (
                        <td key={i} className={v === "—" ? "price-no" : v === "✓" ? "price-yes" : ""}>
                          {v === "—" ? <span aria-label="Not included">—</span> : v === "✓" ? <span aria-label="Included">✓</span> : v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="price-strip" data-reveal>
          <p>
            <b className="font-semibold">Need something different?</b> We build custom packages around your requirements.
          </p>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="link-u font-head font-medium text-vivid" data-cta="pricing-custom-whatsapp">
            Ask us on WhatsApp
            <ArrowRight />
          </a>
        </div>
        <p className="mt-6 text-center text-[13px] text-navy/70">Prices in {m.currency}. You place an order request first; we confirm details and payment on WhatsApp.</p>
      </div>
    </section>
  );
}
