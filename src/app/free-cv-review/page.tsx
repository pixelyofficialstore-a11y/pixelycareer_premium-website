import ReviewForm from "@/components/forms/ReviewForm";
import { localize, localizeTitle } from "@/config/markets";
import { requestMarket } from "@/lib/market-server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const market = await requestMarket();
  return pageMetadata(
    "/free-cv-review",
    localizeTitle(market, "Free CV Review | Pixely Careers"),
    localize(market, "Send your CV and find out what’s holding it back. A free review by Pixely Careers, with clear next steps shared with you directly on WhatsApp."),
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ market?: string }> }) {
  const market = await requestMarket((await searchParams).market);
  return (
    <section className="form-page">
      <div className="form-wrap">
        <ReviewForm key={market.key} market={market.key} />
      </div>
    </section>
  );
}
