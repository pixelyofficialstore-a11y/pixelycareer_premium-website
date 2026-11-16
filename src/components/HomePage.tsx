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
import { PK_FAQ_EXTRA } from "@/components/pk/faq";
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
