import type { Metadata } from "next";
import Link from "next/link";
import FinalCta from "@/components/sections/FinalCta";
import Reviews from "@/components/sections/Reviews";
import HeroBrandStack from "@/components/about/HeroBrandStack";
import ProofStrip from "@/components/about/ProofStrip";
import ProcessTimeline from "@/components/about/ProcessTimeline";
import Reveal from "@/components/ui/Reveal";
import { requestMarket } from "@/lib/market-server";
import { JsonLd, breadcrumbJsonLd, SITE } from "@/lib/seo";
import { WHATSAPP_URL } from "@/lib/site";
import { getReviews } from "@/lib/home-content";
import { MARKET_KEYS } from "@/config/markets";
import { aboutContent } from "../../../content/about";

export const metadata: Metadata = {
  title: { absolute: "About Pixely Careers | Career Branding Agency" },
  description: "Pixely Careers writes ATS CVs, LinkedIn profiles and portfolio websites for professionals in the US, UK, UAE, Saudi Arabia and Pakistan. 1,800+ clients served.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: `${SITE}/about`,
    siteName: "Pixely Careers",
    title: "About Pixely Careers | Career Branding Agency",
    description: "Pixely Careers writes ATS CVs, LinkedIn profiles and portfolio websites for professionals in the US, UK, UAE, Saudi Arabia and Pakistan. 1,800+ clients served.",
    locale: "en_US",
    images: [{ url: "/about/opengraph-image", width: 1200, height: 630, alt: "About Pixely Careers" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Pixely Careers | Career Branding Agency",
    description: "Pixely Careers writes ATS CVs, LinkedIn profiles and portfolio websites for professionals in the US, UK, UAE, Saudi Arabia and Pakistan. 1,800+ clients served.",
    images: ["/about/opengraph-image"],
  },
};

const beliefItems = [
  { icon: "document", title: "Readable by software.", text: "Every CV passes ATS first, then impresses a person." },
  { icon: "globe", title: "Written for your market.", text: "A Riyadh CV isn't a London CV. We know the difference." },
  { icon: "results", title: "Results over duties.", text: "We show what you achieved, not what your job description said." },
  { icon: "people", title: "Real people, real support.", text: "You talk to your writer on WhatsApp from start to finish." },
];

const services = [
  { label: "ATS CVs", href: "/services/ats-cv" },
  { label: "Cover letters", href: "/services/cover-letter" },
  { label: "LinkedIn profiles", href: "/services/linkedin" },
  { label: "Europass CVs", href: "/services/europass-cv" },
  { label: "Portfolio websites", href: "/services/portfolio-website" },
];

const boundaries = ["Job placement", "Visa or immigration services", "Interview guarantees"];
const markets = [
  { code: "US", country: "United States", line: "One page resume. No photo.", href: "/" },
  { code: "UK", country: "United Kingdom", line: "Two page CV. No photo.", href: "/uk" },
  { code: "AE", country: "United Arab Emirates", line: "CV with photo and visa status.", href: "/ae" },
  { code: "SA", country: "Saudi Arabia", line: "CV with photo and nationality.", href: "/sa" },
  { code: "PK", country: "Pakistan", line: "Local and overseas ready CVs.", href: "/pk" },
];

export default async function Page() {
  const market = await requestMarket();
  const reviews = MARKET_KEYS.flatMap((key) => getReviews(key)).filter((review, index, all) =>
    all.findIndex((item) => item.country.toLowerCase() === review.country.toLowerCase()) === index,
  );
  const hasMixedMarketReviews = reviews.length >= 3;

  return (
    <div className="about-page">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About Pixely Careers",
        url: `${SITE}/about`,
        mainEntity: { "@id": `${SITE}/#org` },
      }} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />

      <section className="about-hero">
        <div className="wrap about-hero-grid">
          <div className="about-hero-copy">
            <p className="label">About Pixely</p>
            <h1>Anyone can write a CV. <span>Few build a brand.</span></h1>
            <p className="about-lead">Pixely Careers is a career and personal branding agency. We write CVs, LinkedIn profiles and portfolio websites for professionals in the US, UK, Gulf and Pakistan.</p>
            <div className="about-hero-actions">
              <Link href="/pricing" className="btn btn-primary about-packages" data-cta="about-hero-packages">
                See packages <span aria-hidden="true">→</span>
              </Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="about-whatsapp" data-cta="about-hero-whatsapp">
                Chat on WhatsApp <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <HeroBrandStack />
        </div>
      </section>

      <section className="wrap about-proof" aria-label="Pixely Careers in numbers">
        <ProofStrip />
      </section>

      <section className="about-story">
        <div className="wrap">
          <div className="story-copy" data-reveal>
            <p className="label">Our story</p>
            <h2>Why we <em>started.</em></h2>
            <div className="story-body">
              {aboutContent.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </div>
      </section>

      <section className="about-beliefs">
        <div className="wrap">
          <div className="section-heading" data-reveal>
            <p className="label">What guides us</p>
            <h2>What we <em>believe.</em></h2>
          </div>
          <div className="belief-grid">
            {beliefItems.map((item) => (
              <article className="belief-card" key={item.icon} data-reveal>
                <span className="belief-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon === "document" && <><path d="M7 3.75h7l4 4v12.5H7z" /><path d="M14 3.75v4h4M10 12h5M10 15.5h5" /></>}
                    {item.icon === "globe" && <><circle cx="12" cy="12" r="8.5" /><path d="M3.8 12h16.4M12 3.5c2.1 2.3 3.1 5.1 3.1 8.5s-1 6.2-3.1 8.5c-2.1-2.3-3.1-5.1-3.1-8.5s1-6.2 3.1-8.5Z" /></>}
                    {item.icon === "results" && <><path d="M4 19.5h16M6.5 16V11M12 16V6.5M17.5 16V9" /><path d="m5.5 8 4-3 4 1.5 5-3" /></>}
                    {item.icon === "people" && <><circle cx="9" cy="8" r="3" /><path d="M3.8 19v-1.3a5.2 5.2 0 0 1 10.4 0V19zM16 5.5a3 3 0 0 1 0 5.8M17 14a4.5 4.5 0 0 1 3.2 4.3V19h-3" /></>}
                  </svg>
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-services">
        <div className="wrap">
          <div className="section-heading" data-reveal>
            <p className="label">A clear line</p>
            <h2>Clear about <em>what we do.</em></h2>
          </div>
          <div className="service-grid">
            <div className="service-card service-card-main" data-reveal>
              <h3>What we do</h3>
              <ul>
                {services.map((service) => (
                  <li key={service.href}>
                    <Link href={service.href}>
                      <span className="service-check" aria-hidden="true">✓</span>
                      <span>{service.label}</span>
                      <span className="service-arrow" aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="service-card service-card-boundary" data-reveal>
              <h3>What we don't do</h3>
              <ul>
                {boundaries.map((item) => (
                  <li key={item}><span className="boundary-cross" aria-hidden="true">×</span>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="service-note">We're a writing team, not a recruiter. That keeps our advice honest.</p>
        </div>
      </section>

      <section className="about-markets">
        <div className="wrap">
          <div className="market-heading" data-reveal>
            <p className="label">Local understanding</p>
            <h2>Built for <em>five markets.</em></h2>
            <p>Each country reads CVs differently. We write for the one you're applying to.</p>
          </div>
          <div className="market-grid">
            {markets.map((item) => (
              <Link key={item.code} href={item.href} className="market-tile" data-reveal>
                <span className="market-code">{item.code}</span>
                <span className="market-country">{item.country}</span>
                <span className="market-line">{item.line}</span>
                <span className="market-visit" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="about-process">
        <div className="wrap">
          <div className="section-heading" data-reveal>
            <p className="label">A simple process</p>
            <h2>How we <em>work.</em></h2>
          </div>
          <ProcessTimeline />
          <Link href="/pricing" className="process-link">See packages and prices <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      {hasMixedMarketReviews && <Reviews market={market} reviews={reviews} />}
      <FinalCta market={market} />
      <Reveal />

      <style>{`
        @scope (.about-page) {
        .about-hero { padding: 67px 0 52px; background: #fff; }
        .about-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(0, .92fr);
          align-items: center;
          gap: 30px;
          min-height: 470px;
        }
        .about-hero-copy { padding: 16px 0 22px; }
        .about-hero-copy h1 {
          max-width: 660px;
          margin: 21px 0 0;
          color: #010c28;
          font-size: clamp(40px, 5.2vw, 68px);
          line-height: 1.04;
          letter-spacing: -.062em;
          font-weight: 750;
        }
        .about-hero-copy h1 span { color: #0048ff; }
        .about-lead {
          max-width: 570px;
          margin: 22px 0 0;
          color: #4a5568;
          font-size: 18px;
          line-height: 1.7;
        }
        .about-hero-actions { display: flex; align-items: center; gap: 25px; margin-top: 30px; }
        .about-packages { display: inline-flex; align-items: center; gap: 13px; min-height: 54px; padding: 0 23px; border: 1px solid #0048ff; border-radius: 999px; background: #0048ff; color: #fff; font-weight: 650; text-decoration: none; }
        .about-packages:hover { background: #003fe0; border-color: #003fe0; }
        .about-packages span { font-size: 22px; line-height: 1; }
        .about-whatsapp { display: inline-flex; align-items: center; gap: 8px; color: #010c28; font-size: 15px; font-weight: 650; text-decoration: none; }
        .about-whatsapp span { color: #0048ff; transition: transform .2s ease; }
        .about-whatsapp:hover span { transform: translate(2px,-2px); }
        .about-proof { padding-top: 17px; padding-bottom: 74px; }
        .about-story { padding: 96px 0 104px; background: #f6f8fc; }
        .story-copy { max-width: 760px; }
        .story-copy h2, .section-heading h2, .market-heading h2 {
          margin: 12px 0 0;
          color: #010c28;
          font-size: clamp(32px, 3.6vw, 48px);
          line-height: 1.1;
          letter-spacing: -.052em;
          font-weight: 730;
        }
        .story-copy h2 em, .section-heading h2 em { color: #0048ff; font-style: normal; }
        .story-body { margin-top: 26px; color: #4a5568; font-size: 18px; line-height: 1.72; }
        .story-body p { margin: 0 0 17px; }
        .story-body p:last-child { margin-bottom: 0; }
        .about-beliefs { padding: 100px 0 106px; background: #fff; }
        .section-heading .label, .market-heading .label { margin: 0; }
        .belief-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-top: 40px; }
        .belief-card {
          min-height: 210px;
          padding: 24px 22px;
          border: 1px solid #e5eaf3;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 8px 24px rgba(21, 43, 84, .035);
          transition: transform .22s ease;
        }
        .belief-card:hover { transform: translateY(-4px); border-color: #b9caff; box-shadow: 0 16px 34px rgba(21,43,84,.08); }
        .belief-mark { display: grid; width: 36px; height: 36px; place-items: center; border-radius: 10px; background: #eef3ff; color: #0048ff; }
        .belief-mark svg { width: 20px; height: 20px; }
        .belief-card h3 { margin: 22px 0 8px; color: #010c28; font-size: 17px; line-height: 1.28; letter-spacing: -.02em; font-weight: 720; }
        .belief-card p { margin: 0; color: #59677d; font-size: 14px; line-height: 1.6; }
        .about-services { padding: 96px 0 103px; background: #eef3ff; }
        .service-grid { display: grid; grid-template-columns: 1.08fr .92fr; gap: 20px; margin-top: 38px; }
        .service-card { min-height: 322px; padding: 27px 30px; border-radius: 20px; background: #fff; }
        .service-card-main { border: 1px solid #0048ff; }
        .service-card-boundary { border: 1px solid #dfe5ef; }
        .service-card h3 { margin: 0; color: #010c28; font-size: 20px; letter-spacing: -.03em; font-weight: 720; }
        .service-card ul { margin: 17px 0 0; padding: 0; list-style: none; }
        .service-card li { border-bottom: 1px solid #edf0f5; }
        .service-card li:last-child { border-bottom: 0; }
        .service-card li a {
          display: grid;
          grid-template-columns: 21px 1fr 20px;
          align-items: center;
          gap: 9px;
          min-height: 47px;
          color: #26354f;
          font-size: 15px;
          text-decoration: none;
        }
        .service-check { color: #0048ff; font-size: 17px; font-weight: 750; }
        .service-arrow { color: #0048ff; opacity: 0; transform: translateX(-4px); transition: opacity .18s ease, transform .18s ease; }
        .service-card li a:hover .service-arrow, .service-card li a:focus-visible .service-arrow { opacity: 1; transform: translateX(0); }
        .service-card-boundary ul { display: grid; gap: 18px; margin-top: 25px; }
        .service-card-boundary li { display: flex; align-items: center; gap: 12px; border: 0; color: #758094; font-size: 15px; }
        .boundary-cross { color: #a1aaba; font-size: 21px; line-height: 1; }
        .service-note { margin: 17px 0 0; color: #6d788b; font-size: 13px; line-height: 1.5; }
        .about-markets { padding: 100px 0 104px; background: #010c28; color: #fff; }
        .market-heading { max-width: 650px; }
        .market-heading .label { color: rgba(255,255,255,.58); }
        .market-heading h2 { color: #fff; }
        .market-heading h2 em { color: #4576ff; font-style: normal; }
        .market-heading > p:last-child { margin: 17px 0 0; color: rgba(255,255,255,.7); font-size: 17px; line-height: 1.6; }
        .market-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-top: 40px; }
        .market-tile {
          position: relative;
          display: flex;
          min-height: 215px;
          flex-direction: column;
          padding: 22px 19px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 18px;
          background: #0a1a44;
          color: #fff;
          text-decoration: none;
          transition: transform .2s ease;
        }
        .market-tile:hover { transform: translateY(-4px); border-color: #4576ff; background: #102252; }
        .market-code { color: #fff; font-size: 40px; line-height: 1; letter-spacing: -.05em; font-weight: 760; }
        .market-country { margin-top: 22px; color: #fff; font-size: 14px; line-height: 1.35; font-weight: 650; }
        .market-line { margin-top: 8px; color: rgba(222,230,246,.68); font-size: 12px; line-height: 1.55; }
        .market-visit { position: absolute; top: 21px; right: 19px; color: #4576ff; font-size: 16px; opacity: 0; transition: opacity .2s ease; }
        .market-tile:hover .market-visit, .market-tile:focus-visible .market-visit { opacity: 1; }
        .about-process { padding: 100px 0 98px; background: #fff; }
        .process-link { display: inline-flex; align-items: center; gap: 12px; margin-top: 36px; color: #0048ff; font-size: 15px; font-weight: 650; text-decoration: none; }
        .process-link span { transition: transform .2s ease; }
        .process-link:hover span { transform: translateX(4px); }
        @media (max-width: 1023px) {
          .about-hero-grid { grid-template-columns: minmax(0, 1fr) minmax(0, .9fr); gap: 8px; }
          .about-hero-copy h1 { font-size: clamp(40px, 5vw, 58px); }
          .belief-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .market-grid { grid-template-columns: repeat(5, minmax(145px, 1fr)); }
          .market-tile { padding: 20px 15px; }
        }
        @media (max-width: 767px) {
          .about-hero { padding: 44px 0 26px; }
          .about-hero-grid { grid-template-columns: minmax(0, 1fr); gap: 0; min-height: 0; }
          .about-hero-copy { padding: 0; }
          .about-hero-copy h1 { max-width: 600px; margin-top: 17px; font-size: clamp(42px, 10vw, 58px); line-height: 1.02; }
          .about-lead { margin-top: 17px; font-size: 16px; line-height: 1.65; }
          .about-hero-actions { gap: 18px; margin-top: 23px; }
          .about-packages { min-height: 50px; padding: 0 17px; font-size: 14px; }
          .about-whatsapp { font-size: 13px; }
          .about-proof { padding-top: 10px; padding-bottom: 64px; }
          .about-story, .about-beliefs, .about-services, .about-markets, .about-process { padding-top: 72px; padding-bottom: 74px; }
          .story-body { margin-top: 20px; font-size: 16px; line-height: 1.7; }
          .belief-grid { gap: 12px; margin-top: 29px; }
          .belief-card { min-height: 190px; padding: 18px 16px; border-radius: 15px; }
          .belief-card h3 { margin-top: 17px; font-size: 15px; }
          .belief-card p { font-size: 13px; }
          .service-grid { grid-template-columns: 1fr; gap: 13px; margin-top: 28px; }
          .service-card { min-height: auto; padding: 22px 20px; border-radius: 17px; }
          .service-card li a { min-height: 46px; }
          .service-note { font-size: 12px; }
          .market-heading > p:last-child { font-size: 15px; }
          .market-grid {
            display: flex;
            overflow-x: auto;
            gap: 12px;
            margin: 30px -20px 0;
            padding: 0 20px 12px;
            scroll-snap-type: x mandatory;
            scrollbar-width: thin;
            scrollbar-color: #4576ff #102252;
          }
          .market-tile { flex: 0 0 78%; min-height: 205px; scroll-snap-align: start; }
          .about-process { padding-bottom: 72px; }
        }
        @media (max-width: 380px) {
          .about-hero-actions { gap: 12px; }
          .about-whatsapp { font-size: 12px; }
          .belief-card { padding: 15px 12px; }
          .belief-card h3 { font-size: 14px; }
          .belief-card p { font-size: 12px; }
        }
        }
      `}</style>
    </div>
  );
}
