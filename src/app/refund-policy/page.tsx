import LegalPage from "@/components/LegalPage";
import { REFUND } from "@/config/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/refund-policy",
  "Refund Policy | Pixely Careers",
  "Our 100% money back guarantee, explained. Not satisfied with your first draft? Ask within 7 days and we refund the full amount you paid.",
);

export default function Page() {
  return <LegalPage title="Refund Policy" path="/refund-policy" summary="Our 100% money back guarantee, explained." sections={REFUND} />;
}
