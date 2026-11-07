import Link from "next/link";
import CvSheet from "@/components/cv/CvSheet";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import { localize, orderHref, type Market } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";
import { WHATSAPP_URL } from "@/lib/site";

export default function FinalCta({ market }: { market: Market }) {
  return (
    <section id="final-cta" aria-labelledby="cta-title" className="on-blue final-cta bg-vivid text-white">
      <div className="wrap final-grid">
        <div className="final-copy" data-reveal>
          <h2 id="cta-title" className="h2">
            {localize(market, "Recruiters give your CV seconds.")} <em>Make them count.</em>
          </h2>
          <div className="final-actions">
            <Link href={orderHref(market)} className="btn btn-white min-h-14 px-8 text-[1.0625rem]" data-cta="cta-order">
              Start Your Order
              <ArrowRight />
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="link-u font-head font-medium" data-cta="cta-whatsapp">
              Or chat on WhatsApp
            </a>
          </div>
        </div>
        <div className="final-cv" aria-hidden="true">
          <CvSheet image={HERO_PERSONAS[market.key].images.good} />
        </div>
      </div>
    </section>
  );
}
