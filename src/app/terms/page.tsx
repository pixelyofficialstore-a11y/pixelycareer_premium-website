import LegalPage from "@/components/LegalPage";
import { TERMS } from "@/config/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/terms",
  "Terms of Service | Pixely Careers",
  "The terms for Pixely Careers orders, delivery, revisions and ownership. We provide career documentation only, with no job placement or visa services.",
);

export default function Page() {
  return <LegalPage title="Terms of Service" path="/terms" summary="The rules for ordering and using our services." sections={TERMS} />;
}
