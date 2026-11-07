import { Suspense } from "react";
import { getHomeFaq, type Market } from "@/config/markets";
import Hero from "@/components/hero/Hero";
import HeroRise from "@/components/hero/HeroRise";
import Faq from "@/components/sections/Faq";
import FinalCta from "@/components/sections/FinalCta";
import Formats from "@/components/sections/Formats";
import MarketFormats from "@/components/sections/MarketFormats";
import Pricing from "@/components/sections/Pricing";
import Problem, { ProblemNext } from "@/components/sections/Problem";
import HomeProblem from "@/components/sections/HomeProblem";
import Process from "@/components/sections/Process";
import HomeProcess from "@/components/sections/HomeProcess";
import HomeTestimonials from "@/components/sections/HomeTestimonials";
import HomeWhatsApp from "@/components/ui/HomeWhatsApp";
import Reviews from "@/components/sections/Reviews";
import Services from "@/components/sections/Services";
import HomeServices from "@/components/sections/HomeServices";
import HomeTrustStrip from "@/components/sections/HomeTrustStrip";
import MarketSync from "@/components/ui/MarketSync";
import Reveal from "@/components/ui/Reveal";
import StickyBar from "@/components/ui/StickyBar";
import { getReviews, getTestimonials } from "@/lib/home-content";
import { FACEBOOK_REVIEWS_URL } from "@/lib/site";
import { JsonLd, breadcrumbJsonLd, faqJsonLd, homeJsonLd } from "@/lib/seo";

/** One template for every market. Each boundary hydrates in its own task, so nothing visibly loads in. */
export default function HomePage({ market, useHomeProblem = false }: { market: Market; useHomeProblem?: boolean }) {
  const faq = getHomeFaq(market).map((item) => market.path === "/" ? {
    q: item.q.replace(/[-–—]/g, " "),
    a: (item.a.includes("[CONFIRM")
      ? "Place your order online. We confirm the details on WhatsApp and share available payment options there."
      : item.a).replace(/[-–—]/g, " "),
  } : item);
  return (
    <>
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd data={homeJsonLd(market)} />
      {market.path !== "/" && <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: market.areaServed, path: market.path }])} />}
      <MarketSync market={market.key} />
      <HeroRise>
        <Hero market={market} centerMobileHeadline={market.path === "/"} />
      </HeroRise>
      {market.path === "/" && <HomeTrustStrip reviewsUrl={FACEBOOK_REVIEWS_URL} />}
      {useHomeProblem ? <HomeProblem /> : (
        <>
          <Problem market={market} />
          <ProblemNext market={market} />
        </>
      )}
      <Suspense>
        {market.path === "/" ? <HomeServices marketKey={market.key} /> : <Services market={market.key} />}
      </Suspense>
      <Suspense>
        {market.path === "/" ? <Formats market={market.key} /> : <MarketFormats market={market.key} />}
      </Suspense>
      {market.path !== "/" && <Reviews market={market} reviews={getReviews(market.key)} />}
      <Suspense>
        {market.path === "/" ? <HomeProcess /> : <Process market={market.key} />}
      </Suspense>
      {market.path === "/" && <HomeTestimonials items={getTestimonials(market.key)} />}
      <Suspense>
        <Pricing market={market.key} variant={market.path === "/" ? "compact" : "default"} />
      </Suspense>
      <Suspense>
        <Faq items={faq} homepage={market.path === "/"} />
      </Suspense>
      <FinalCta market={market} />
      <Suspense>
        {market.path === "/" ? <HomeWhatsApp /> : <StickyBar market={market.key} />}
      </Suspense>
      <Reveal />
    </>
  );
}
