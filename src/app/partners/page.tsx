import fs from "node:fs";
import path from "node:path";
import PartnersPage from "@/components/partners/PartnersPage";
import type { AgencySample } from "@/components/partners/types";
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

const faqs = [
  { q: "What are your partner rates?", a: "They depend on document types and monthly volume. We agree exact rates on a 15-minute call." },
  { q: "Is there a minimum volume?", a: "No. Start with one candidate." },
  { q: "Can you use our CV template?", a: "Yes. Send it and we'll work in your format." },
  { q: "How fast is delivery?", a: "First drafts within 24 hours for standard documents. We confirm timelines for bulk orders." },
  { q: "Will you contact our candidates?", a: "Not in the white label model. You keep the relationship and we stay behind the scenes." },
  { q: "Do you offer jobs or visas?", a: "No. We provide career documentation only." },
];

export default function Page() {
  const sampleDirectory = path.join(process.cwd(), "public", "partners", "samples");
  const samples: AgencySample[] = sampleDefinitions.map((sample) => ({
    ...sample,
    image: `/partners/samples/${sample.image}`,
    available: fs.existsSync(path.join(sampleDirectory, sample.image)),
  }));
  const proposalAvailable = fs.existsSync(
    path.join(process.cwd(), "public", "partners", "Pixely-Partnership-Proposal.pdf"),
  );

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
      <PartnersPage samples={samples} proposalAvailable={proposalAvailable} />
    </>
  );
}
