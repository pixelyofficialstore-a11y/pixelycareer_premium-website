import type { Metadata } from "next";
import Link from "next/link";
import FinalCta from "@/components/sections/FinalCta";
import HomeTrustStrip from "@/components/sections/HomeTrustStrip";
import BrandOrbit from "@/components/about/BrandOrbit";
import AboutMotion from "@/components/about/AboutMotion";
import { requestMarket } from "@/lib/market-server";
import { JsonLd, breadcrumbJsonLd, SITE } from "@/lib/seo";
import { orderHref } from "@/config/markets";
import { FACEBOOK_REVIEWS_URL } from "@/lib/site";
import { getReviews } from "@/lib/home-content";

const TITLE = "About Pixely Careers | Career Branding Agency";
const DESCRIPTION = "Pixely Careers writes ATS CVs, LinkedIn profiles and portfolio websites for professionals in the US, UK, UAE, Saudi Arabia and Pakistan.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: `${SITE}/about`,
    siteName: "Pixely Careers",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    images: [{ url: "/about/opengraph-image", width: 1200, height: 630, alt: "About Pixely Careers" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/about/opengraph-image"] },
};

const STATS = [
  { value: 1800, suffix: "+", label: "Professionals helped", short: "Professionals helped" },
  { value: 100, suffix: "%", label: "Recommended on Facebook", short: "Recommended" },
  { value: 20, suffix: "+", label: "Partner agencies", short: "Partner agencies" },
];

const STEPS = [
  { title: "We review your profile.", text: "Your CV, experience and career level." },
  { title: "We research your role.", text: "Keywords and requirements recruiters look for." },
  { title: "We write your documents.", text: "An ATS CV and cover letter for your role and country." },
  { title: "We optimize your LinkedIn.", text: "A profile that matches your CV and gets found." },
  { title: "We build your website.", text: "A portfolio that brings it all together.", optional: true },
];

const LEAD = "Skilled people weren’t getting interviews. Not because of their experience, but because their CV couldn’t get past the software or a recruiter’s first six seconds.";

export default async function Page() {
  const market = await requestMarket();
  const proof = getReviews(market.key).filter((r) => r.type === "text" && r.quote).slice(0, 3);
  return (
    <div className="ab">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "AboutPage", name: "About Pixely Careers", url: `${SITE}/about`, mainEntity: { "@id": `${SITE}/#org` } }} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />

      <section className="ab-hero">
        <div className="wrap ab-hero-grid">
          <div className="ab-hero-copy">
            <h1 className="display">Anyone can write a CV. <em>We build your brand.</em></h1>
            <p className="ab-lead">CVs, LinkedIn profiles and portfolio websites, written by people who know how recruiters read.</p>
            <div className="ab-actions">
              <Link href={orderHref(market)} className="btn btn-primary min-h-14 px-8" data-cta="about-hero-order">Start your order →</Link>
              <Link href={`/pricing?m=${market.key}`} className="ab-textlink" data-cta="about-hero-packages">See packages</Link>
            </div>
          </div>
          <BrandOrbit />
        </div>
      </section>

      <div className="ab-proof"><HomeTrustStrip stats={STATS} reviewsUrl={market.key === "pk" ? FACEBOOK_REVIEWS_URL : undefined} /></div>

      <section className="ab-story" aria-labelledby="ab-story-title">
        <div className="ab-story-grid">
          <h2 id="ab-story-title" className="display ab-h2">Why we <em>started.</em></h2>
          <div className="ab-story-text">
            <p className="ab-storylead" data-ab-words aria-label={LEAD}>
              {LEAD.split(" ").map((w, i) => <span key={i} aria-hidden="true" style={{ "--w": i } as React.CSSProperties}>{w} </span>)}
            </p>
            <p className="ab-storybody" data-ab-rise>So we started writing CVs the way recruiters read them. Clear, built on results, and written for the country you&apos;re applying to. Today, every CV is still written by a real person, and you talk to them directly on WhatsApp.</p>
          </div>
        </div>
      </section>

      <section className="ab-work" aria-labelledby="ab-work-title">
        <div className="wrap">
          <h2 id="ab-work-title" className="display ab-h2 ab-center">How we <em>work.</em></h2>
          <ol className="ab-steps" data-ab-steps>
            <span className="ab-steps-line" aria-hidden="true"><i /></span>
            {STEPS.map((s, i) => (
              <li key={s.title} className="ab-step" style={{ "--i": i } as React.CSSProperties}>
                <span className="ab-num" aria-hidden="true">{i + 1}</span>
                <div className="ab-steptext">
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  {s.optional && <small>Optional</small>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {proof.length > 0 && (
        <section className="ab-proofit" aria-labelledby="ab-proof-title">
          <div className="wrap">
            <h2 id="ab-proof-title" className="display ab-h2 ab-center">Proof it <em>works.</em></h2>
            <div className="ab-cards">
              {proof.map((r) => (
                <figure key={r.name} className="ab-card ab-quote" data-ab-rise>
                  <blockquote>{r.quote}</blockquote>
                  <figcaption><b>{r.name}</b><span>{r.role} · {r.country}</span></figcaption>
                </figure>
              ))}
            </div>
            {market.key === "pk" && <p className="ab-note"><a href={FACEBOOK_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="ab-textlink">See all reviews on Facebook →</a></p>}
          </div>
        </section>
      )}

      <FinalCta market={market} />
      <AboutMotion />

      <style>{`
        .ab-hero { padding: calc(80px + var(--bar-h, 0px) + 72px) 0 48px; background: #fff; }
        .ab-hero-grid { display: grid; grid-template-columns: 58fr 42fr; gap: 40px; align-items: center; }
        .ab-hero h1 { margin: 0; max-width: none; font-size: clamp(40px, 4.4vw, 60px); letter-spacing: -0.035em; line-height: 1.05; }
        .ab-hero h1 em, .ab-h2 em { display: block; font-style: normal; color: #0048ff; }
        .ab-lead { max-width: 480px; margin: 20px 0 0; color: #6b7280; font-size: 17px; line-height: 1.6; }
        .ab-actions { display: flex; align-items: center; gap: 24px; margin-top: 32px; }
        .ab-textlink { color: #0048ff; font-weight: 500; text-decoration: none; }
        .ab-textlink:hover { text-decoration: underline; }
        .ab-proof { padding: 0 0 48px; }
        .ab-proof > section { padding-top: 48px; padding-bottom: 0; }
        .ab-h2 { margin: 0; font-size: clamp(32px, 4vw, 52px); }
        .ab-center { text-align: center; }
        .ab-center em, .ab-story .ab-h2 em { display: inline; }

        .ab-story { padding: 96px 20px; background: #f6f8fc; }
        .ab-story-grid { display: grid; grid-template-columns: 40fr 60fr; gap: 48px; align-items: start; max-width: 1080px; margin: 0 auto; }
        .ab-story .ab-h2 { white-space: nowrap; }
        .ab-storylead { margin: 0; color: #010c28; font-size: 22px; font-weight: 500; line-height: 1.5; }
        .ab-storylead span { transition: opacity 400ms ease; transition-delay: calc(var(--w) * 20ms); }
        .ab-js .ab-storylead:not(.is-in) span { opacity: 0.08; }
        .ab-storybody { margin: 20px 0 0; color: #6b7280; font-size: 17px; line-height: 1.7; transition-delay: 500ms !important; }

        .ab-work { padding: 96px 0; background: #fff; }
        .ab-steps { position: relative; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; max-width: 1120px; margin: 56px auto 0; padding: 0; list-style: none; }
        .ab-steps-line { position: absolute; top: 21px; left: 10%; right: 10%; height: 2px; background: #e6ecf5; }
        .ab-steps-line i { display: block; width: 100%; height: 100%; background: #0048ff; transform: scaleX(0); transform-origin: left; transition: transform 1200ms linear; }
        .ab-step { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .ab-num { position: relative; z-index: 1; display: grid; width: 44px; height: 44px; flex: none; place-items: center; border: 1.5px solid #0048ff; border-radius: 50%; background: #fff; color: #0048ff; font-weight: 600; transition: background 200ms ease, color 200ms ease, transform 200ms ease; transition-delay: calc(var(--i) * 300ms); }
        .ab-steptext { transition: opacity 400ms ease, transform 400ms ease; transition-delay: calc(var(--i) * 300ms); }
        .ab-step h3 { margin: 16px 0 0; color: #010c28; font-size: 16px; font-weight: 600; }
        .ab-step p { margin: 6px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5; }
        .ab-step small { display: inline-block; margin-top: 8px; padding: 2px 8px; border-radius: 999px; background: #f1f4f9; color: #6b7280; font-size: 12px; }
        .ab-js .ab-steps:not(.play) .ab-num { transform: scale(0.8); }
        .ab-js .ab-steps:not(.play) .ab-steptext { opacity: 0; transform: translateY(12px); }
        .ab-steps.play .ab-steps-line i { transform: none; }
        .ab-steps.play .ab-num { background: #0048ff; color: #fff; transform: none; }

        .ab-proofit { padding: 96px 0; background: #f6f8fc; }
        .ab-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; max-width: 1040px; margin: 56px auto 0; }
        .ab-card { padding: 28px; border: 1px solid #e6ecf5; border-radius: 20px; background: #fff; }
        .ab-quote { margin: 0; }
        .ab-quote blockquote { margin: 0; color: #3a465b; font-size: 16px; line-height: 1.6; }
        .ab-quote figcaption { display: grid; gap: 2px; margin-top: 18px; }
        .ab-quote figcaption span { color: #6b7280; font-size: 13px; }
        .ab-note { margin: 32px 0 0; color: #6b7280; font-size: 14px; text-align: center; }

        [data-ab-rise] { transition: opacity 600ms cubic-bezier(.16,1,.3,1), transform 600ms cubic-bezier(.16,1,.3,1); }
        .ab-js [data-ab-rise]:not(.is-in) { opacity: 0; transform: translateY(16px); }

        @media (max-width: 1023px) {
          .ab-hero-grid { grid-template-columns: 1fr; text-align: center; }
          .ab-lead { margin-inline: auto; }
          .ab-actions { justify-content: center; }
          .ab-cards { grid-template-columns: 1fr; max-width: 560px; }
        }
        @media (max-width: 767px) {
          .ab-hero { padding: calc(72px + var(--bar-h, 0px) + 40px) 0 32px; }
          .ab-hero h1 { font-size: clamp(34px, 9vw, 40px); }
          .ab-actions { flex-direction: column; gap: 16px; }
          .ab-proof { padding-bottom: 32px; }
          .ab-proof > section { padding-top: 32px; }
          .ab-story, .ab-work, .ab-proofit { padding-block: 64px; }
          .ab-story-grid { grid-template-columns: 1fr; gap: 16px; }
          .ab-story .ab-h2 { font-size: clamp(28px, 8vw, 34px); }
          .ab-storylead { font-size: 19px; }
          .ab-steps { grid-template-columns: 1fr; gap: 28px; max-width: 480px; margin-top: 36px; }
          .ab-steps-line { top: 22px; bottom: 22px; left: 21px; right: auto; width: 2px; height: auto; }
          .ab-steps-line i { transform: scaleY(0); transform-origin: top; }
          .ab-step { flex-direction: row; align-items: flex-start; gap: 16px; text-align: left; }
          .ab-step h3 { margin-top: 10px; }
          .ab-cards { margin-top: 36px; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-ab-rise], .ab-num, .ab-steptext, .ab-steps-line i, .ab-storylead span { transition: none !important; }
          .ab-js [data-ab-rise]:not(.is-in), .ab-js .ab-steps:not(.play) .ab-steptext { opacity: 1; transform: none; }
          .ab-js .ab-storylead:not(.is-in) span { opacity: 1; }
          .ab-steps .ab-steps-line i { transform: none; }
          .ab-steps .ab-num { background: #0048ff; color: #fff; transform: none; }
        }
      `}</style>
    </div>
  );
}
