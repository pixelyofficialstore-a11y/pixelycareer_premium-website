import { MARKETS, getPackages, getPricingFaq, isMarketKey } from "@/config/markets";
import FinalCta from "@/components/sections/FinalCta";
import Pricing from "@/components/sections/Pricing";
import Reveal from "@/components/ui/Reveal";
import { JsonLd, SITE, breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import { requestMarket } from "@/lib/market-server";

export const metadata = pageMetadata(
  "/pricing",
  "Pricing | ATS CV and LinkedIn Packages | Pixely Careers",
  "Clear, one time prices for ATS CVs, cover letters and LinkedIn profiles. First draft in 2 days, revisions included, PDF and Word files.",
);

export default async function Page({ searchParams }: { searchParams: Promise<{ m?: string; market?: string }> }) {
  const query = await searchParams;
  const market = await requestMarket(isMarketKey(query.m) ? query.m : query.market);
  const faq = getPricingFaq(market);
  const packages = getPackages(market);
  const offerCatalog = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Pixely Careers pricing packages",
    itemListElement: packages.map((item) => ({
      "@type": "Offer",
      name: item.name,
      price: String(item.price),
      priceCurrency: market.currency,
      url: `${SITE}/order?package=${item.id}&market=${market.key}`,
    })),
  };
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }])} />
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd data={offerCatalog} />
      <Pricing key={market.key} market={market.key} standalone faqItems={faq} />
      <FinalCta market={market} />
      <Reveal />
    </>
  );
}
