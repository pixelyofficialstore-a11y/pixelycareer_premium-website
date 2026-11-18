import { OfferBand } from "@/components/offer/Offer";
import { Suspense } from "react";
import { getHomeFaq, type Market } from "@/config/markets";
import Hero from "@/components/hero/Hero";
import HeroRise from "@/components/hero/HeroRise";
import Faq from "@/components/sections/Faq";
import FinalCta from "@/components/sections/FinalCta";
import Formats from "@/components/sections/Formats";
import Pricing from "@/components/sections/Pricing";
import HomeProblem from "@/components/sections/HomeProblem";
import HomeProcess from "@/components/sections/HomeProcess";
import HomeTestimonials from "@/components/sections/HomeTestimonials";
import { PK_REVIEW_SHOTS } from "@/lib/pk-reviews";
import HomeServices from "@/components/sections/HomeServices";
import HomeTrustStrip from "@/components/sections/HomeTrustStrip";
import MarketSync from "@/components/ui/MarketSync";
import Reveal from "@/components/ui/Reveal";
import { PK_FAQ_EXTRA, PK_OFFER_FAQ } from "@/components/pk/faq";
import OfferPricing from "@/components/offer/OfferPricing";
import { OfferGuarantee } from "@/components/offer/OfferSections";
import { FACEBOOK_REVIEWS_URL } from "@/lib/site";
import { getTestimonials } from "@/lib/home-content";
import { JsonLd, breadcrumbJsonLd, faqJsonLd, homeJsonLd } from "@/lib/seo";

/**
 * One homepage template for every market, in one fixed order:
 * Hero, trust strip, Before/After, three layers, formats, how it works, testimonials, pricing, FAQ, final CTA.
 * Only the content changes per market, and it comes from the market config.
 */
/** offer: the /offer landing page. The same sections without the three layers and formats; Before/After moves below the reviews. */
export default function HomePage({ market, offer = false }: { market: Market; offer?: boolean }) {
  const pk = market.key === "pk";
  const faq = [...(pk ? PK_FAQ_EXTRA : []), ...getHomeFaq(market)].map((item) => ({
    q: item.q.replace(/[-–—]/g, " "),
    a: (item.a.includes("[CONFIRM")
      ? "Place your order online. We confirm the details on WhatsApp and share available payment options there."
      : item.a).replace(/[-–—]/g, " "),
  }));
  if (offer) return <OfferLanding market={market} />;
  return (
    <>
      <span data-home hidden />
      {!offer && <JsonLd data={faqJsonLd(faq)} />}
      {!offer && <JsonLd data={homeJsonLd(market)} />}
      {!offer && market.path !== "/" && <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: market.areaServed, path: market.path }])} />}
      <MarketSync market={market.key} />
      <HeroRise free>
        <Hero market={market} centerMobileHeadline copy={offer ? { line1: "Applied everywhere.", line2: "Still no interview calls?", sub: ["Most CVs are rejected by software before anyone reads them.", "We fix that."] } : undefined} />
      </HeroRise>
      {pk && !offer && <OfferBand market={market.key} />}
      {/* The Facebook page is the Pakistan page, so its links show on pk only. */}
      <HomeTrustStrip reviewsUrl={pk ? FACEBOOK_REVIEWS_URL : undefined} />
      {!offer && (
        <>
          <HomeProblem marketKey={market.key} />
          <Suspense><HomeServices marketKey={market.key} /></Suspense>
          <Suspense><Formats market={market.key} /></Suspense>
        </>
      )}
      <Suspense><HomeProcess marketKey={market.key} /></Suspense>
      <Suspense><Pricing market={market.key} variant="compact" plain heading={pk ? <>Invest once. <em className="m-break">Apply with confidence.</em></> : undefined} note={pk ? "100% money back guarantee. Zero risk." : undefined} /></Suspense>
      {/* A market without approved screenshots of its own shows the shared ones. */}
      {pk ? <HomeTestimonials facebookLink ordered items={PK_REVIEW_SHOTS} /> : <HomeTestimonials facebookLink={false} items={getTestimonials(market.key).some((t) => t.screenshot) ? getTestimonials(market.key) : getTestimonials("us")} />}
      {/* /offer: Before/After after the reviews, before the FAQ. */}
      {offer && <HomeProblem marketKey={market.key} />}
      <Suspense><Faq items={faq} homepage /></Suspense>
      <FinalCta market={market} />
      <Reveal />
    </>
  );
}

/**
 * /offer (Meta ads landing page), mobile first, desktop in the same order:
 * Hero, Before/After, Proof, Pricing, What happens after you order, guarantee row, FAQ (top 5), final CTA.
 * Anchors #pricing, #process and #faq stay.
 */
function OfferLanding({ market }: { market: Market }) {
  return (
    <>
      <span data-home hidden />
      <MarketSync market={market.key} />
      <HeroRise free>
        <Hero market={market} centerMobileHeadline offer copy={{ line1: "Applied everywhere.", line2: "Still no interview calls?", sub: ["Most CVs are rejected by ATS software before anyone reads them.", "We fix that."] }} />
      </HeroRise>
      <div className="offer-trust"><HomeTrustStrip fast reviewsUrl={FACEBOOK_REVIEWS_URL} stats={[{ value: 1800, suffix: "+", label: "Professionals helped", short: "helped" }, { value: 100, suffix: "%", label: "Recommended on Facebook", short: "recommended" }, { value: 5, suffix: "x", label: "More interview calls", short: "more calls" }]} /><div className="ol-scroll" aria-hidden="true"><span>Scroll</span><svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 4 4 4-4" /></svg></div></div>
      <HomeProblem marketKey={market.key} />
      <div className="offer-proof"><HomeTestimonials facebookLink ordered items={PK_REVIEW_SHOTS} /></div>
      <OfferPricing />
      <Suspense><HomeProcess marketKey={market.key} sale /></Suspense>
      <OfferGuarantee />
      <Suspense><Faq items={PK_OFFER_FAQ} homepage /></Suspense>
      <div className="offer-cta"><FinalCta market={market} /></div>
      <Reveal />
    </>
  );
}
