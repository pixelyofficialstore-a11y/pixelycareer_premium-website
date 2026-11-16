import { MARKETS, orderHref, pricingPath, formatPricingPrice, getPackages, getPricingFaq, isMarketKey } from "@/config/markets";
import FinalCta from "@/components/sections/FinalCta";
import Pricing from "@/components/sections/Pricing";
import Reveal from "@/components/ui/Reveal";
import { JsonLd, SITE, breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ m?: string; market?: string }> }) {
  const q = await searchParams;
  void q;
  const k = "pk" as const;
  const m = MARKETS[k];
  const lowest = Math.min(...getPackages(m).map((p) => p.price));
  return pageMetadata(
    "/pricing",
    "Pricing | ATS CV and LinkedIn Packages | Pixely Careers",
    "Clear, one time prices for ATS CVs, cover letters and LinkedIn profiles. First draft in 2 days, revisions included, PDF and Word files.",
    { label: "Pricing", title: `Packages from ${formatPricingPrice(m, lowest)}`, locale: m.hreflang.replace("-", "_") },
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ m?: string; market?: string }> }) {
  const query = await searchParams;
  void query;
  const market = MARKETS.pk;
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
      url: `${SITE}${orderHref(market, item.id)}`,
    })),
  };
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Pricing", path: pricingPath(market.key) }])} />
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd data={offerCatalog} />
      <Pricing key={market.key} market={market.key} standalone plain faqItems={faq} heading={<>Invest once. <em className="m-break">Apply with confidence.</em></>} note="100% money back guarantee. Zero risk." />
      <FinalCta market={market} />
      <Reveal />
    </>
  );
}
