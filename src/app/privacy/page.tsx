import LegalPage from "@/components/LegalPage";
import { PRIVACY } from "@/config/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/privacy",
  "Privacy Policy | Pixely Careers",
  "How Pixely Careers collects, uses and protects your information, including your CV and career documents. We don’t sell your personal data to anyone at all.",
);

export default function Page() {
  return <LegalPage title="Privacy Policy" path="/privacy" summary="How we collect, use and protect your information." sections={PRIVACY} />;
}
