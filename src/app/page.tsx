import HomePage from "@/components/HomePage";
import { MARKETS } from "@/config/markets";
import { homeMetadata } from "@/lib/seo";

export const metadata = homeMetadata(MARKETS.us);

export default function Page() {
  return <HomePage market={MARKETS.us} useHomeProblem />;
}
