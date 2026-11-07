import fs from "node:fs";
import path from "node:path";
import PartnersPage from "@/components/partners/PartnersPage";
import type { AgencySample } from "@/components/partners/types";
import { QUESTIONS } from "@/components/partners/faq-data";
import { JsonLd, SITE, breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import sampleDefinitions from "../../../public/partners/samples/samples.json";

const title = "CV Writing Partner for Recruitment Agencies | Pixely Careers";
const description = "White label CVs, cover letters and job profiles for recruitment agencies and overseas employment promoters. First drafts in 24 hours. No minimum volume.";
const baseMetadata = pageMetadata("/partners", title, description, "/partners/opengraph-image");

export const metadata = {
  ...baseMetadata,
  alternates: { canonical: "https://pixelycareers.com/partners" },
  openGraph: {
    ...baseMetadata.openGraph,
    title: "Your agency's CV department | Pixely Careers",
  },
};

const faqs = QUESTIONS.map(([q, a]) => ({ q, a }));

export default function Page() {
  const publicDirectory = path.join(process.cwd(), "public");
  const samples: AgencySample[] = sampleDefinitions.map((sample) => {
    const image = sample.image.startsWith("/") ? sample.image : `/partners/samples/${sample.image}`;
    return {
      ...sample,
      image,
      available: fs.existsSync(path.join(publicDirectory, image.replace(/^\/+/, ""))),
    };
  });

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Agency Partnership", path: "/partners" }])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "CV Writing for Recruitment Agencies",
        description,
        url: `${SITE}/partners`,
        provider: { "@type": "Organization", "@id": `${SITE}/#org`, name: "Pixely Careers" },
        audience: { "@type": "BusinessAudience", audienceType: "Recruitment agencies and overseas employment promoters" },
        areaServed: { "@type": "Country", name: "Pakistan" },
      }} />
      <JsonLd data={faqJsonLd(faqs)} />
      <PartnersPage samples={samples} />
    </>
  );
}
