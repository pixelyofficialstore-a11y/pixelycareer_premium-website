import Link from "next/link";
import CtaCvImage from "@/components/cv/CtaCvImage";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import { localize, orderHref, type Market } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";
import { WHATSAPP_URL } from "@/lib/site";

export default function FinalCta({ market }: { market: Market }) {
  const requestedImage = HERO_PERSONAS[market.key]?.images?.good ?? HERO_PERSONAS.us.images.good;

  return (
    <section id="final-cta" aria-labelledby="cta-title" className="on-blue final-cta bg-vivid text-white">
      <div className="wrap final-grid">
        <div className="final-copy" data-reveal>
          <h2 id="cta-title" className="h2">
            {localize(market, "Recruiters give your CV seconds.")} <em>Make them count.</em>
          </h2>
          <div className="final-actions">
            <Link href={orderHref(market)} className={`btn ${market.path === "/" ? "btn-primary border border-white/50" : "btn-white"} min-h-14 px-8 text-[1.0625rem]`} data-cta={market.path === "/" ? "home-final-order" : "cta-order"}>
              {market.path === "/" ? "Start your order" : "Start Your Order"}
              <ArrowRight />
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="link-u font-head font-medium" data-cta={market.path === "/" ? "home-final-whatsapp" : "cta-whatsapp"}>
              Or chat on WhatsApp
            </a>
          </div>
        </div>
        <div className="final-cv" aria-hidden="true">
          <CtaCvImage key={requestedImage.src} image={requestedImage} fallback={HERO_PERSONAS.us.images.good} />
        </div>
      </div>
    </section>
  );
}
