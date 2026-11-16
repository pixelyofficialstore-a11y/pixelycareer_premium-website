import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import { MARKETS } from "@/config/markets";
import { pageMetadata } from "@/lib/seo";

// Meta ads landing page: the homepage sections, fewer of them. Not indexed and not in the sitemap.
export const metadata: Metadata = {
  ...pageMetadata("/offer", "11.11 Sale: ATS CVs from Rs 1,600 | Pixely Careers", "ATS friendly CVs that get you shortlisted. Flat 20% off all plans."),
  robots: { index: false, follow: false },
};

export default function Page() {
  return <HomePage market={MARKETS.pk} offer />;
}
