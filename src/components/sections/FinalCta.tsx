import Link from "next/link";
import CtaCvImage from "@/components/cv/CtaCvImage";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import { localize, orderHref, type Market } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";
import { WHATSAPP_URL } from "@/lib/site";

export default function FinalCta({ market, variant }: { market: Market; variant?: "blog" }) {
  const images = HERO_PERSONAS[market.key]?.images ?? HERO_PERSONAS.us.images;
  // The homepage uses the market's main sample; other pages keep their earlier CV.
  const blog = variant === "blog";
  const requestedImage = images.good;

  return (
    <section id="final-cta" data-blog={blog || undefined} aria-labelledby="cta-title" className="on-blue final-cta bg-vivid text-white">
      <div className="wrap final-grid">
        <div className="final-copy" data-reveal>
          <h2 id="cta-title" className="h2">
            <>Stop getting rejected. <em>{localize(market, "Fix your CV today.")}</em></>
          </h2>
          <p className="final-sub">First draft in 2 days. <span>100% money back guarantee.</span></p>
          <div className="final-actions">
            <Link href={orderHref(market)} className="btn btn-white min-h-14 px-8 text-[1.0625rem]" data-cta="home-final-order">
              Start your order
              <ArrowRight />
            </Link>
            {blog ? (
              <Link href={`/pricing?m=${market.key}`} className="btn final-wa min-h-14 px-7 text-[1.0625rem]" data-cta="blog-final-packages">
                See packages
              </Link>
            ) : (
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn final-wa min-h-14 px-7 text-[1.0625rem]" data-cta="home-final-whatsapp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z"/></svg>
                Ask on WhatsApp
              </a>
            )}
          </div>
        </div>
        <div className="final-cv" aria-hidden="true">
          <CtaCvImage key={requestedImage.src} image={requestedImage} fallback={HERO_PERSONAS.us.images.pageGood ?? HERO_PERSONAS.us.images.good} />
        </div>
      </div>
    </section>
  );
}
