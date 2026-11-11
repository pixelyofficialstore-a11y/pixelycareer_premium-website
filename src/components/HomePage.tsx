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
import HomeServices from "@/components/sections/HomeServices";
import HomeTrustStrip from "@/components/sections/HomeTrustStrip";
import MarketSync from "@/components/ui/MarketSync";
import Reveal from "@/components/ui/Reveal";
import { getTestimonials } from "@/lib/home-content";
import { FACEBOOK_REVIEWS_URL } from "@/lib/site";
import { JsonLd, breadcrumbJsonLd, faqJsonLd, homeJsonLd } from "@/lib/seo";

/**
 * One homepage template for every market, in one fixed order:
 * Hero, trust strip, Before/After, three layers, formats, how it works, testimonials, pricing, FAQ, final CTA.
 * Only the content changes per market, and it comes from the market config.
 */
export default function HomePage({ market }: { market: Market }) {
  const faq = getHomeFaq(market).map((item) => ({
    q: item.q.replace(/[-–—]/g, " "),
    a: (item.a.includes("[CONFIRM")
      ? "Place your order online. We confirm the details on WhatsApp and share available payment options there."
      : item.a).replace(/[-–—]/g, " "),
  }));
  return (
    <>
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd data={homeJsonLd(market)} />
      {market.path !== "/" && <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: market.areaServed, path: market.path }])} />}
      <MarketSync market={market.key} />
      <HeroRise free>
        <Hero market={market} centerMobileHeadline />
      </HeroRise>
      {/* The Facebook page is the Pakistan page, so its links show on /pk only. */}
      <HomeTrustStrip reviewsUrl={market.key === "pk" ? FACEBOOK_REVIEWS_URL : undefined} />
      <HomeProblem marketKey={market.key} />
      <Suspense>
        <HomeServices marketKey={market.key} />
      </Suspense>
      <Suspense>
        <Formats market={market.key} />
      </Suspense>
      <Suspense>
        <HomeProcess marketKey={market.key} />
      </Suspense>
      {/* A market without approved screenshots of its own shows the shared ones. */}
      <HomeTestimonials facebookLink={market.key === "pk"} items={getTestimonials(market.key).some((t) => t.screenshot) ? getTestimonials(market.key) : getTestimonials("us")} />
      <Suspense>
        <Pricing market={market.key} variant="compact" />
      </Suspense>
      <Suspense>
        <Faq items={faq} homepage />
      </Suspense>
      <FinalCta market={market} />
      <Suspense>
      </Suspense>
      <Reveal />
    </>
  );
}
