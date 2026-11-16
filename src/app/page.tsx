import HomePage from "@/components/HomePage";
import { MARKETS } from "@/config/markets";
import { BUNDLE, offerOpen } from "@/config/offers";
import { homeMetadata } from "@/lib/seo";

export const generateMetadata = () => homeMetadata(MARKETS.pk, offerOpen(BUNDLE, "pk"));
export default function Page() {
  return <HomePage market={MARKETS.pk} />;
}
