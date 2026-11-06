import Image from "next/image";
import Link from "next/link";
import { localize, localizeTitle, orderHref, type Market } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";
import { WHATSAPP_URL } from "@/lib/site";

export default function FinalCta({ market }: { market: Market }) {
  return (
    <section id="final-cta" aria-labelledby="cta-title" className="on-blue final-cta overflow-hidden bg-vivid text-white">
      <div className="wrap final-grid">
        <div className="final-cv" data-reveal>
          <div style={{ rotate: "4deg" }} className="overflow-hidden rounded-[4px] shadow-[0_30px_60px_-20px_rgb(1_12_40/0.55)]">
            <Image src="/cv/good-cv-ats-single-column.webp" alt="" width={1655} height={2340} sizes="(min-width: 1024px) 260px, 180px" className="block h-auto w-full" />
          </div>
        </div>
        <div className="final-copy" data-reveal>
          <h2 id="cta-title" className="h2">
            Let’s see which package fits <em>your next move.</em>
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
          <Link href="/free-cv-review" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-white/85 underline underline-offset-4 transition-colors hover:text-white" data-cta="cta-free-review">
            {localize(market, "Not ready yet? Get a free CV review")}
            <ArrowRight size={14} />
          </Link>
          <p className="mt-3 text-[13px] text-white/85">{localizeTitle(market, "We Don’t Write CVs. We Build Interview Opportunities.")}</p>
        </div>
      </div>
    </section>
  );
}
