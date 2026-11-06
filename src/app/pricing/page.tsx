import { getPricingFaq } from "@/config/markets";
import Faq from "@/components/sections/Faq";
import Pricing from "@/components/sections/Pricing";
import Reveal from "@/components/ui/Reveal";
import { requestMarket } from "@/lib/market-server";
import { JsonLd, breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/pricing",
  "Pricing | Pixely Careers",
  "Clear prices and first delivery in 2–3 days. Compare the ATS Career, International Career Pro and Executive Career Branding packages side by side here.",
);

export default async function Page({ searchParams }: { searchParams: Promise<{ market?: string }> }) {
  const market = await requestMarket((await searchParams).market);
  const faq = getPricingFaq(market);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }])} />
      <JsonLd data={faqJsonLd(faq)} />
      <section className="page-top wrap pb-12 text-center">
        <h1 className="page-h1">Pricing.</h1>
        <p className="page-sub mx-auto">Clear prices. First delivery in 2–3 days.</p>
      </section>
      <Pricing key={market.key} market={market.key} standalone />
      <Faq items={faq} />
      <Reveal />
    </>
  );
}
