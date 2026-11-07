import Link from "next/link";
import { MARKETS, getComparison, getPackages, orderHref, type MarketKey } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";
import { WHATSAPP_URL } from "@/lib/site";

const SPLIT_PRICE = /^(\D+)\s?([\d,]+)$/;
const Y = "✓";
const N = "—";
// Every package has these, so they go in a note: the table only shows what differs.
const SAME_IN_ALL = /Keyword|File formats/;

const Value = ({ v }: { v: string }) => (v === Y ? <span aria-label="Included" className="pt-yes">✓</span> : v === N ? <span aria-label="Not included" className="pt-no">—</span> : <>{v}</>);

export default function Pricing({ market, standalone = false }: { market: MarketKey; standalone?: boolean }) {
  const m = MARKETS[market];
  const packages = getPackages(m);
  const rows = getComparison(m).filter(([row]) => !SAME_IN_ALL.test(row));
  const cls = (i: number) => (i === 1 ? "pt-rec" : i === 2 ? "pt-exec" : "");

  return (
    <section id="pricing" aria-labelledby={standalone ? undefined : "pricing-title"} aria-label={standalone ? "Packages" : undefined} className={standalone ? "bg-tint py-16 lg:py-20" : "section bg-tint"}>
      <div className="wrap">
        <div className="pt-wrap">
          <div className="pt-head" data-reveal>
            {standalone ? (
              <p className="text-sm text-navy/70">Prices in {m.currency}</p>
            ) : (
              <>
                <p className="label">Pricing</p>
                <h2 id="pricing-title" className="h2 mt-4">
                  Choose your <em>package.</em>
                </h2>
                <p className="mt-3 text-base text-navy/70">Clear prices. First delivery in 2–3 days.</p>
              </>
            )}
            {!m.approved && (
              <p className="mt-2">
                <span className="confirm">[CONFIRM pricing]</span>
              </p>
            )}
          </div>

          {/* Large screens: one table, so the difference between packages is clear at a glance */}
          <table className="pt" data-reveal>
            <thead>
              <tr>
                <td />
                {packages.map((p, i) => {
                  const [, unit, value] = p.priceLabel.match(SPLIT_PRICE) ?? [];
                  return (
                    <th key={p.id} scope="col" className={cls(i)}>
                      {i === 1 && <span className="pt-badge">Recommended</span>}
                      <span className="pt-name">{p.name}</span>
                      <span className="pt-price">
                        <small>{unit?.trim()}</small> {value}
                      </span>
                      <span className="pt-for">{p.forLine}</span>
                      <Link href={orderHref(m, p.id)} className="pt-btn" data-cta={`pricing-choose-${p.id}`}>
                        {p.button}
                      </Link>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map(([row, ...values]) => (
                <tr key={row}>
                  <th scope="row">{row}</th>
                  {values.map((v, i) => (
                    <td key={i} className={cls(i)}>
                      <Value v={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Small screens: one card per package, recommended first */}
          <ul className="price-grid">
            {packages.map((p) => {
              const rec = p.id === "international-pro";
              const exec = p.id === "executive";
              return (
                <li key={p.id} className={`price-card ${exec ? "price-exec" : ""} ${rec ? "price-rec" : ""}`} data-reveal>
                  {rec && <span className="price-badge">Recommended</span>}
                  <h3 className="price-name">{p.name}</h3>
                  <p className="price-for">{p.forLine}</p>
                  <p className="pt-price pt-price-m">{p.priceLabel}</p>
                  {p.lead && <p className="price-lead">{p.lead}</p>}
                  <ul className="price-items">
                    {p.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="price-extras">
                    {p.value.map((v) => `${v.n} ${v.label}`).join(" · ")} · Same day {p.sameDayLabel}
                  </p>
                  <Link href={orderHref(m, p.id)} className="price-btn" data-cta={`pricing-choose-${p.id}`}>
                    {p.button}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-5 text-center text-[13px] text-navy/70">All packages include keyword optimization and PDF + Word files. Prices in {m.currency}. You place an order request first; we confirm details and payment on WhatsApp.</p>
        <div className="price-strip" data-reveal>
          <p>
            <b className="font-semibold">Need something different?</b> We build custom packages around your requirements.
          </p>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="link-u font-head font-medium text-vivid" data-cta="pricing-custom-whatsapp">
            Ask us on WhatsApp
            <ArrowRight />
          </a>
        </div>
      </div>
    </section>
  );
}
