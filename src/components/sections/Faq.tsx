import Accordion from "@/components/ui/Accordion";
import { ArrowRight } from "@/components/ui/Icons";
import { WHATSAPP_URL } from "@/lib/site";

export default function Faq({ items, homepage = false }: { items: { q: string; a: string }[]; homepage?: boolean }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="section bg-white">
      <div className="wrap grid12 gap-y-14">
        <div className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-32" data-reveal>
            {!homepage && <p className="label">FAQ</p>}
            <h2 id="faq-title" className={`h2 ${homepage ? "" : "mt-6"}`}>
              {homepage ? <>Still <em>wondering?</em></> : <>Fair <em>questions.</em></>}
            </h2>
            {!homepage && <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="link-u font-head mt-6 font-medium" data-cta={homepage ? "home-faq-whatsapp" : "faq-whatsapp"}>
              {homepage ? "Still unsure? Ask on WhatsApp" : "Still unsure? Ask us on WhatsApp"}
              <ArrowRight />
            </a>}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <Accordion items={items} />
        </div>
      </div>
    </section>
  );
}
