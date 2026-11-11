import Link from "next/link";
import Image from "next/image";
import { localize, orderHref } from "@/config/markets";
import { totalFor, unitAt } from "@/config/addons";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import FinalCta from "@/components/sections/FinalCta";
import ServicesMotion from "@/components/sections/ServicesMotion";
import { requestMarket } from "@/lib/market-server";
import { formatPricingPrice } from "@/config/markets";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/services",
  "Services | ATS CV, LinkedIn and Portfolio | Pixely Careers",
  "ATS CVs, cover letters, Europass, LinkedIn optimization and portfolio websites for professionals in any market.",
);

type Row = { name: string; line: string; tag: string; href: string };

export default async function Page({ searchParams }: { searchParams: Promise<{ market?: string }> }) {
  const market = await requestMarket((await searchParams).market);
  const m = market.key;
  const persona = HERO_PERSONAS[m] ?? HERO_PERSONAS.us;
  const sample = persona.sample;
  const cv = persona.images.good;
  const price = (fn: () => number) => { try { const n = fn(); return n > 0 ? formatPricingPrice(market, n) : ""; } catch { return ""; } };
  const from = (p: string) => (p ? `Add on from ${p}` : "Ask us");
  const pricing = `/pricing?m=${m}`;
  const gulf = m === "ae" || m === "sa" || m === "pk";

  const layers: { label: string; title: string; visual: "cv" | "profile" | "browser"; rows: Row[] }[] = [
    {
      label: "01 Get shortlisted", title: "Career documents", visual: "cv",
      rows: [
        { name: m === "us" ? "ATS resume" : "ATS CV", line: "Written for your role and country", tag: "In every package", href: "/services/ats-cv" },
        { name: "Cover letter", line: "Tailored to each application", tag: "In every package", href: "/services/cover-letter" },
        { name: "Europass CV", line: "For EU applications", tag: from(price(() => unitAt(m, "europass-pack", 1, "ats-career"))), href: "/services/europass-cv" },
        ...(gulf ? [{ name: "Arabic CV", line: "For Arabic speaking employers", tag: from(price(() => unitAt(m, "arabic", 1, "ats-career"))), href: pricing }] : []),
      ],
    },
    {
      label: "02 Get found", title: "Professional visibility", visual: "profile",
      rows: [
        { name: "LinkedIn optimization", line: "A profile recruiters can find", tag: "In Pro and Executive", href: "/services/linkedin" },
        { name: m === "us" || m === "uk" ? "Indeed profile" : "Indeed + Naukrigulf profiles", line: "Get found on job portals", tag: "In Pro and Executive", href: pricing },
        { name: "LinkedIn content pack", line: "10 posts to stay visible", tag: "In Executive", href: pricing },
      ],
    },
    {
      label: "03 Get remembered", title: "Digital presence", visual: "browser",
      rows: [
        { name: "Portfolio website", line: "Free domain and hosting for the first year", tag: (() => { const p = price(() => totalFor(m, "portfolio", 1, "executive")); return p ? `From ${p}` : "Ask us"; })(), href: "/services/portfolio-website" },
        { name: "Bio statement", line: "Your professional story", tag: "In Pro and Executive", href: pricing },
        { name: "Digital contact card", line: "Share your details in one tap", tag: "In Pro and Executive", href: pricing },
      ],
    },
  ];

  return (
    <div className="sv">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])} />

      <section className="sv-hero">
        <div className="wrap">
          <h1 className="display">
            <span className="sv-line"><span>Everything recruiters see.</span></span>
            <em className="sv-line"><span>Built by one team.</span></em>
          </h1>
          <p className="sv-sub">{localize(market, "Your CV, LinkedIn and portfolio, written to tell the same story.")}</p>
          <div className="sv-actions">
            <Link href={orderHref(market)} className="btn btn-primary min-h-14 px-8" data-cta="services-hero-order">Start your order →</Link>
            <Link href={pricing} className="sv-link" data-cta="services-hero-packages">See packages</Link>
          </div>
        </div>
      </section>

      <section className="sv-layers" aria-label="Our services">
        <div className="wrap sv-stack">
          {layers.map((layer, i) => (
            <article key={layer.title} className={`sv-card ${i === 1 ? "sv-flip" : ""}`} data-sv-card>
              <div className="sv-visual" aria-hidden="true">
                {layer.visual === "cv" && (
                  <div className="sv-mock sv-cv"><Image src={cv.src} alt="" width={cv.width} height={cv.height} sizes="320px" /></div>
                )}
                {layer.visual === "profile" && (
                  <div className="sv-mock sv-profile">
                    <div className="sv-banner" />
                    <div className="sv-avatar">{sample.initials}</div>
                    <b>{sample.name}</b>
                    <span>{sample.role}</span>
                    <i>Open to work</i>
                  </div>
                )}
                {layer.visual === "browser" && (
                  <div className="sv-mock sv-browser">
                    <div className="sv-bar"><i /><i /><i /><span>{sample.domain}</span></div>
                    <div className="sv-site">
                      <b>{sample.name}</b>
                      <span>{sample.role}</span>
                      <em>View my work</em>
                    </div>
                    <div className="sv-tiles"><i /><i /><i /></div>
                  </div>
                )}
              </div>
              <div className="sv-content">
                <p className="sv-label">{layer.label}</p>
                <h2>{layer.title}</h2>
                <ul className="sv-rows">
                  {layer.rows.map((r) => (
                    <li key={r.name} data-sv-row>
                      <Link href={r.href} className="sv-row">
                        <span className="sv-row-text"><b>{localize(market, r.name)}</b><small>{r.line}</small></span>
                        <span className="sv-tag">{r.tag}</span>
                        <span className="sv-arrow" aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sv-nudge">
        <p>Get them together in a package and save. <Link href={`${pricing}#compare`}><b>Compare packages →</b></Link></p>
      </section>

      <FinalCta market={market} />
      <ServicesMotion />

      <style>{`
        .sv-hero { padding: calc(80px + var(--bar-h, 0px) + 56px) 0 40px; background: #fff; }
        .sv-hero h1 { margin: 0; font-size: clamp(40px, 4.4vw, 60px); letter-spacing: -0.035em; line-height: 1.05; }
        .sv-hero h1 em { font-style: normal; color: #0048ff; }
        .sv-line { display: block; overflow: hidden; padding-bottom: 0.06em; }
        .sv-line > span { display: inline-block; animation: sv-rise 600ms cubic-bezier(.16,1,.3,1) both; }
        em.sv-line > span { animation-delay: 100ms; }
        .sv-sub { max-width: 520px; margin: 20px 0 0; color: #6b7280; font-size: 17px; line-height: 1.6; animation: sv-fade 500ms ease 400ms both; }
        .sv-actions { display: flex; align-items: center; gap: 24px; margin-top: 32px; animation: sv-fade 500ms ease 500ms both; }
        .sv-link { color: #0048ff; font-weight: 500; text-decoration: none; }
        .sv-link:hover { text-decoration: underline; }
        @keyframes sv-rise { from { transform: translateY(105%); } to { transform: none; } }
        @keyframes sv-fade { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }

        .sv-layers { padding: 40px 0 80px; background: #fff; }
        .sv-stack { display: grid; gap: 32px; }
        .sv-card { display: grid; grid-template-columns: 45fr 55fr; overflow: hidden; border: 1px solid #e6ecf5; border-radius: 24px; background: #fff; }
        .sv-flip .sv-visual { order: 2; }
        .sv-visual { position: relative; display: grid; min-height: 380px; place-items: center; overflow: hidden; background: #f6f8fc; transition: transform 600ms cubic-bezier(.16,1,.3,1), opacity 600ms ease; }
        .sv-content { padding: 48px; }
        .sv-label { margin: 0; color: #0048ff; font-size: 13px; font-weight: 600; }
        .sv-content h2 { margin: 8px 0 24px; font-family: var(--font-head); font-size: 32px; font-weight: 600; letter-spacing: -0.02em; }
        .sv-rows { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
        .sv-rows li { transition: opacity 500ms ease, transform 500ms ease; }
        .sv-row { display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 10px 16px; border: 1px solid #e6ecf5; border-radius: 14px; color: #010c28; text-decoration: none; transition: border-color 200ms ease; }
        .sv-row:hover { border-color: #0048ff; }
        .sv-row-text { display: grid; flex: 1; min-width: 0; gap: 2px; }
        .sv-row-text b { font-size: 16px; font-weight: 500; }
        .sv-row-text small { color: #6b7280; font-size: 13px; }
        .sv-tag { flex: none; padding: 4px 10px; border-radius: 999px; background: #eef3ff; color: #0048ff; font-size: 13px; font-weight: 600; white-space: nowrap; }
        .sv-arrow { flex: none; color: #0048ff; transition: transform 200ms ease; }
        .sv-row:hover .sv-arrow { transform: translateX(4px); }

        .sv-mock { transition: transform 350ms cubic-bezier(.16,1,.3,1); }
        .sv-card:hover .sv-mock { transform: translateY(-6px) rotate(0deg); }
        .sv-cv { width: 64%; max-width: 280px; height: 300px; overflow: hidden; border-radius: 6px 6px 0 0; box-shadow: 0 24px 48px -28px rgb(1 12 40 / .45); transform: rotate(-3deg); align-self: end; margin-top: 60px; }
        .sv-cv img { display: block; width: 100%; height: auto; }
        .sv-profile { position: relative; display: grid; width: min(300px, 80%); justify-items: start; gap: 4px; padding: 0 20px 20px; overflow: hidden; border: 1px solid #e1e7f0; border-radius: 14px; background: #fff; box-shadow: 0 24px 48px -28px rgb(1 12 40 / .35); transform: rotate(2deg); }
        .sv-banner { width: calc(100% + 40px); height: 56px; margin: 0 -20px; background: linear-gradient(110deg, #0048ff, #2074ff); }
        .sv-avatar { display: grid; width: 60px; height: 60px; margin-top: -30px; place-items: center; border: 3px solid #fff; border-radius: 50%; background: #e8efff; color: #0048ff; font-weight: 600; }
        .sv-profile b { margin-top: 6px; font-size: 17px; }
        .sv-profile span { color: #6b7280; font-size: 12px; }
        .sv-profile i { margin-top: 8px; padding: 4px 10px; border-radius: 999px; background: #eef3ff; color: #0048ff; font-size: 11px; font-style: normal; font-weight: 600; }
        .sv-browser { width: min(320px, 84%); overflow: hidden; border: 1px solid #e1e7f0; border-radius: 12px; background: #fff; box-shadow: 0 24px 48px -28px rgb(1 12 40 / .35); transform: rotate(-2deg); }
        .sv-bar { display: flex; align-items: center; gap: 5px; padding: 10px 12px; border-bottom: 1px solid #e6ecf5; color: #6b7280; font-size: 11px; }
        .sv-bar i { width: 7px; height: 7px; border-radius: 50%; background: #d5dce8; }
        .sv-bar span { margin-left: 8px; }
        .sv-site { display: grid; justify-items: start; gap: 4px; padding: 20px; background: #010c28; color: #fff; }
        .sv-site b { font-size: 18px; }
        .sv-site span { color: rgb(255 255 255 / .7); font-size: 11px; }
        .sv-site em { margin-top: 10px; padding: 6px 12px; border-radius: 6px; background: #0048ff; font-size: 11px; font-style: normal; font-weight: 500; }
        .sv-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 12px; }
        .sv-tiles i { height: 44px; border-radius: 6px; background: #eef1f6; }

        .sv-nudge { padding: 40px 20px; background: #f6f8fc; text-align: center; }
        .sv-nudge p { margin: 0; color: #536077; font-size: 16px; }
        .sv-nudge a { color: #0048ff; text-decoration: none; }
        .sv-nudge a:hover { text-decoration: underline; }

        .sv-js [data-sv-card]:not(.is-in) .sv-visual { opacity: 0; transform: translateX(-40px); }
        .sv-js [data-sv-card].sv-flip:not(.is-in) .sv-visual { transform: translateX(40px); }
        .sv-js [data-sv-card]:not(.is-in) [data-sv-row] { opacity: 0; transform: translateY(16px); }

        @media (max-width: 1023px) {
          .sv-card { grid-template-columns: 1fr; }
          .sv-flip .sv-visual { order: 0; }
          .sv-visual { min-height: 0; height: 220px; }
          .sv-cv { height: 180px; margin-top: 40px; width: 50%; }
          .sv-content { padding: 28px 20px; }
        }
        @media (max-width: 767px) {
          .sv-hero { padding: calc(72px + var(--bar-h, 0px) + 40px) 0 32px; text-align: center; }
          .sv-hero h1 { font-size: clamp(34px, 9vw, 40px); }
          .sv-sub { margin-inline: auto; }
          .sv-actions { flex-direction: column; gap: 16px; }
          .sv-layers { padding: 24px 0 56px; }
          .sv-stack { gap: 20px; }
          .sv-content h2 { font-size: 26px; }
          .sv-row { flex-wrap: wrap; }
          .sv-tag { order: 3; margin-left: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sv-line > span, .sv-sub, .sv-actions { animation: none; }
          .sv-js [data-sv-card]:not(.is-in) .sv-visual, .sv-js [data-sv-card]:not(.is-in) [data-sv-row] { opacity: 1; transform: none; }
          .sv-mock, .sv-visual, .sv-rows li { transition: none; }
        }
        .sv-hero { padding: calc(80px + var(--bar-h, 0px) + 72px) 0 56px; text-align: center; }
        .sv-hero .wrap > * { max-width: 900px; margin-left: auto; margin-right: auto; }
        .sv-hero h1 em { display: block; }
        .sv-hero .sv-sub { max-width: 560px; margin-top: 16px; }
        .sv-hero .sv-actions { justify-content: center; gap: 24px; margin-top: 32px; }
        @media (max-width: 767px) { .sv-hero { padding: calc(72px + var(--bar-h, 0px) + 40px) 0 32px; } .sv-hero .sv-actions { flex-direction: column; align-items: stretch; } .sv-hero .sv-actions > * { width: 100%; justify-content: center; text-align: center; } }
      `}</style>
    </div>
  );
}
