import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unitAt } from "@/config/addons";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import { formatPricingPrice, getPackages, homeHref, localize, localizeTitle, type Market } from "@/config/markets";
import { SERVICES, getService, type Service, type ServiceIcon } from "@/config/services";
import Pricing from "@/components/pricing/Pricing";
import Faq from "@/components/sections/Faq";
import FinalCta from "@/components/sections/FinalCta";
import ServicePageMotion from "@/components/sections/ServicePageMotion";
import Reveal from "@/components/ui/Reveal";
import { requestMarket } from "@/lib/market-server";
import { JsonLd, SITE, breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import "./service-page.css";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ market?: string }> };

/** Market copy: "resume" on US pages, Naukrigulf only outside the US and UK, the persona's own domain. */
function copy(m: Market) {
  const portals = m.key === "us" || m.key === "uk" ? "Indeed" : "Indeed and Naukrigulf";
  const domain = (HERO_PERSONAS[m.key] ?? HERO_PERSONAS.us).sample.domain;
  return (t: string) => localize(m, t.replaceAll("{portals}", portals).replaceAll("{domain}", domain));
}

export async function generateMetadata({ params }: Props) {
  const s = getService((await params).slug);
  if (!s) return {};
  const m = await requestMarket();
  const l = copy(m);
  return pageMetadata(`/services/${s.slug}`, `${localizeTitle(m, s.name)} | Pixely Careers`, `${l(s.sub)} First draft in 2 days.`, `/services/${s.slug}/opengraph-image`);
}

const ICONS: Record<ServiceIcon, string> = {
  doc: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  target: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 11.5v1",
  chart: "M4 20h16M7 16v-4M12 16V8M17 16v-7",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  file: "M12 4v11M7 10l5 5 5-5M5 20h14",
  user: "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c1-4 4-6 8-6s7 2 8 6",
  link: "M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1",
  pen: "M4 20l4-1 11-11-3-3L5 16zM14 6l3 3",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  phone: "M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
};

function Visual({ s, m }: { s: Service; m: Market }) {
  const p = HERO_PERSONAS[m.key] ?? HERO_PERSONAS.us;
  const { name, initials, role, domain } = p.sample;
  if (s.visual === "cv") {
    const cv = p.images.good;
    return (
      <div className="sp-cv">
        <Image src={cv.src} alt={cv.alt ?? localize(m, `ATS CV written by Pixely Careers for ${name}`)} width={cv.width} height={cv.height} sizes="(min-width: 1024px) 30vw, 70vw" priority />
      </div>
    );
  }
  if (s.visual === "letter")
    return (
      <div className="sp-letter" aria-hidden="true">
        <b>{name}</b>
        <small>{role.split("|")[0].trim()}</small>
        <hr />
        <p>I&apos;m applying for the Senior Accountant role. I&apos;ve spent five years managing month end close for multi entity businesses.</p>
        <p>In my current role I moved the team to a shared reporting calendar, so managers got their numbers earlier each month.</p>
        <p>I&apos;d welcome the chance to talk about what your team needs next.</p>
        <p>Kind regards,</p>
        <em>{name}</em>
      </div>
    );
  if (s.visual === "profile")
    return (
      <div className="sp-profile" aria-hidden="true">
        <div className="sp-banner" />
        <div className="sp-avatar">{initials}</div>
        <b>{name}</b>
        <small>{role}</small>
        <span className="sp-open">Open to work</span>
        <div className="sp-lines"><i /><i /><i /></div>
      </div>
    );
  if (s.visual === "browser")
    return (
      <div className="sp-browser" aria-hidden="true">
        <div className="sp-bar"><i /><i /><i /><span>{domain}</span></div>
        <div className="sp-site">
          <b>{name}</b>
          <small>{role.split("|")[0].trim()}</small>
          <span>View my work</span>
        </div>
        <div className="sp-tiles"><i /><i /><i /></div>
      </div>
    );
  const portals = m.key === "us" || m.key === "uk" ? ["Indeed"] : ["Indeed", "Naukrigulf"];
  return (
    <div className="sp-portals" aria-hidden="true">
      {portals.map((portal) => (
        <div key={portal} className="sp-portal">
          <div className="sp-avatar">{initials}</div>
          <div>
            <small>{portal}</small>
            <b>{name}</b>
            <small>{role.split("|")[0].trim()}</small>
          </div>
          <span className="sp-done">100%</span>
        </div>
      ))}
    </div>
  );
}

export default async function Page({ params, searchParams }: Props) {
  const s = getService((await params).slug);
  if (!s) notFound();
  const m = await requestMarket((await searchParams).market);
  const l = copy(m);
  const name = localizeTitle(m, s.name);
  const faq = s.faq.map((i) => ({ q: l(i.q), a: l(i.a) }));
  const packages = getPackages(m);
  const from = s.addon ? Math.min(...packages.map((p) => unitAt(m.key, s.addon!, 1, p.id))) : 0;
  const orderLink = `/order?service=${s.slug}&market=${m.key}`;
  const words = (t: string) => l(t).split(" ").map((w, i) => <Fragment key={i}><span className="sp-word"><span>{w}</span></span>{" "}</Fragment>);

  return (
    <div className="sp">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name,
          description: l(s.sub),
          url: `${SITE}/services/${s.slug}`,
          provider: { "@id": `${SITE}/#org` },
          areaServed: "Worldwide",
        }}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name, path: `/services/${s.slug}` }])} />
      <JsonLd data={faqJsonLd(faq)} />

      <section className="sp-hero">
        <div className="wrap sp-hero-grid">
          <div className="sp-hero-copy">
            <nav className="sp-crumbs" aria-label="Breadcrumb">
              <Link href="/services" className="sp-back" aria-label="Back to services">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M13 8H3M7 4 3 8l4 4" /></svg>
              </Link>
              <Link href={m.path}>Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/services">Services</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{name}</span>
            </nav>
            <h1 className="display">
              <span className="sp-line"><span>{localizeTitle(m, l(s.h1[0]))}</span></span>
              <em className="sp-line"><span>{l(s.h1[1])}</span></em>
            </h1>
            <p className="sp-sub">{l(s.sub)}</p>
            <div className="sp-actions">
              <Link href={orderLink} className="btn btn-primary min-h-14 px-8" data-cta={`service-${s.slug}-order`}>Order this service →</Link>
              <Link href={homeHref(m, "#pricing")} className="sp-link" data-cta={`service-${s.slug}-packages`}>See packages</Link>
            </div>
          </div>
          <div className="sp-visual">
            <Visual s={s} m={m} />
          </div>
        </div>
      </section>

      <section className="sp-problem on-dark" aria-labelledby="sp-problem-title" data-sp>
        <div className="wrap">
          <h2 id="sp-problem-title" className="display">
            <span className="sp-row">{words(s.problem[0])}</span>
            <em className="sp-row">{words(s.problem[1])}</em>
          </h2>
          <ul className="sp-pills">
            {s.pills.map((p, i) => <li key={p} style={{ ["--i" as string]: i }}>{l(p)}</li>)}
          </ul>
        </div>
      </section>

      <section className="sp-section" aria-labelledby="sp-gets-title" data-sp>
        <div className="wrap">
          <h2 id="sp-gets-title" className="display sp-h2">What you <em>get.</em></h2>
          <ul className="sp-gets">
            {s.gets.map((g, i) => (
              <li key={g.title} style={{ ["--i" as string]: i }}>
                <span className="sp-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[g.icon]} /></svg></span>
                <b>{l(g.title)}</b>
                <p>{l(g.line)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sp-section sp-ba-section" aria-labelledby="sp-ba-title" data-sp>
        <div className="wrap">
          <h2 id="sp-ba-title" className="display sp-h2">Before / <em>after.</em></h2>
          <div className="sp-ba">
            <div className="sp-before">
              <span className="sp-tag sp-tag-bad">✕ Before</span>
              <p>{l(s.before)}</p>
            </div>
            <div className="sp-after">
              <span className="sp-tag sp-tag-good">✓ After</span>
              <p>{l(s.after)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="sp-pricing">
        <Pricing
          market={m.key}
          variant="compact"
          heading={<>Choose your <em>package.</em></>}
          note={s.addon ? `Add ${name} to any package from ${formatPricingPrice(m, from)}.` : undefined}
          tag={s.includedIn ? { id: s.includedIn, text: `Includes ${name}` } : undefined}
        />
      </div>

      <Faq items={faq} homepage />
      <FinalCta market={m} />
      <ServicePageMotion />
      <Reveal />
    </div>
  );
}

export const generateStaticParams = () => SERVICES.map((s) => ({ slug: s.slug }));
