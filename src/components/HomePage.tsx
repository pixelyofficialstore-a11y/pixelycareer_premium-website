import { Suspense } from "react";
import { getHomeFaq, type Market } from "@/config/markets";
import CvStory from "@/components/hero/CvStory";
import Hero from "@/components/hero/Hero";
import Faq from "@/components/sections/Faq";
import FinalCta from "@/components/sections/FinalCta";
import Formats from "@/components/sections/Formats";
import Pricing from "@/components/sections/Pricing";
import Problem, { ProblemNext } from "@/components/sections/Problem";
import Process from "@/components/sections/Process";
import Reviews from "@/components/sections/Reviews";
import Services from "@/components/sections/Services";
import MarketSync from "@/components/ui/MarketSync";
import Reveal from "@/components/ui/Reveal";
import StickyBar from "@/components/ui/StickyBar";
import { getReviews, getSamples } from "@/lib/home-content";
import { JsonLd, breadcrumbJsonLd, faqJsonLd, homeJsonLd } from "@/lib/seo";

/** One template for every market. Each boundary hydrates in its own task, so nothing visibly loads in. */
export default function HomePage({ market }: { market: Market }) {
  const faq = getHomeFaq(market);
  return (
    <>
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd data={homeJsonLd(market)} />
      {market.path !== "/" && <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: market.areaServed, path: market.path }])} />}
      <MarketSync market={market.key} />
      <CvStory>
        <Hero market={market} />
        <Problem market={market} />
      </CvStory>
      <ProblemNext market={market} />
      <Suspense>
        <Services market={market.key} />
      </Suspense>
      <Suspense>
        <Formats market={market.key} samples={getSamples()} />
      </Suspense>
      <Reviews market={market} reviews={getReviews(market.key)} />
      <Suspense>
        <Process market={market.key} pin />
      </Suspense>
      <Suspense>
        <Pricing market={market.key} />
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
