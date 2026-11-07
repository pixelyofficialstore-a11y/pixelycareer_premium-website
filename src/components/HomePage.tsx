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
import Reviews from "@/components/sections/Reviews";
import Services from "@/components/sections/Services";
import HomeServices from "@/components/sections/HomeServices";
import MarketSync from "@/components/ui/MarketSync";
import Reveal from "@/components/ui/Reveal";
import StickyBar from "@/components/ui/StickyBar";
import { getReviews } from "@/lib/home-content";
import { JsonLd, breadcrumbJsonLd, faqJsonLd, homeJsonLd } from "@/lib/seo";

/** One template for every market. Each boundary hydrates in its own task, so nothing visibly loads in. */
export default function HomePage({ market, useHomeProblem = false }: { market: Market; useHomeProblem?: boolean }) {
  const faq = getHomeFaq(market);
  return (
    <>
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd data={homeJsonLd(market)} />
      {market.path !== "/" && <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: market.areaServed, path: market.path }])} />}
      <MarketSync market={market.key} />
      <HeroRise>
        <Hero market={market} centerMobileHeadline={market.path === "/"} />
      </HeroRise>
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
      <Reviews market={market} reviews={getReviews(market.key)} />
      <Suspense>
        <Process market={market.key} />
      </Suspense>
      <Suspense>
        <Pricing market={market.key} compact={market.path === "/"} />
      </Suspense>
      <Suspense>
        <Faq items={faq} />
      </Suspense>
      <FinalCta market={market} />
      <Suspense>
        <StickyBar market={market.key} />
      </Suspense>
      <Reveal />
    </>
  );
}
