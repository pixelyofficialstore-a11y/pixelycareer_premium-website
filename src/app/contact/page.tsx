import ContactForm from "@/components/forms/ContactForm";
import Reveal from "@/components/ui/Reveal";
import { requestMarket } from "@/lib/market-server";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL, WHATSAPP_URL } from "@/lib/site";

export const metadata = pageMetadata(
  "/contact",
  "Contact | Pixely Careers",
  "Talk to Pixely Careers. The fastest way is WhatsApp on +92 370 6404900, or send a short message using this form and continue the conversation there.",
);

export default async function Page() {
  const market = await requestMarket();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <section className="page-top wrap">
        <h1 className="page-h1">Talk to us.</h1>
        <p className="page-sub">The fastest way is WhatsApp.</p>
      </section>

      <section aria-label="Contact options" className="wrap mt-14 grid gap-6 md:grid-cols-2 lg:mt-20">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="card lift block p-8" data-cta="contact-whatsapp" data-reveal>
          <h2 className="card-title">WhatsApp</h2>
          <p className="mt-4 text-lg font-medium text-vivid">0370-6404900</p>
          <p className="mt-1 text-navy/70">+92 370 6404900</p>
        </a>
        <div className="card p-8" data-reveal>
          <h2 className="card-title">Email</h2>
          <p className="mt-4">
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-lg font-medium text-vivid">{CONTACT_EMAIL}</a>
          </p>
        </div>
      </section>

      <section aria-label="Send a message" className="section">
        <div className="form-wrap">
          <ContactForm market={market.key} />
          <ul className="mt-10 text-navy/70">
            <li>
              <a href="https://www.instagram.com/pixelycareers.pk" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-vivid">
                Instagram @pixelycareers.pk
              </a>
            </li>
            <li className="flex min-h-11 items-center">Facebook: Pixely Careers PK</li>
          </ul>
        </div>
      </section>
      <Reveal />
    </>
  );
}
