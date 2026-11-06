import type { Market } from "@/config/markets";
import { ArrowDown, ArrowRight } from "@/components/ui/Icons";
import { WHATSAPP_URL } from "@/lib/site";
import CvPaper from "./CvPaper";

const CV_SIZES = "(min-width: 1024px) 34vw, 62vw";

/** data-cv / data-tilt are what the scroll story in CvStory moves. The good CV is one element, start to finish. */
function CvStack() {
  return (
    <div className="cv-comp" aria-hidden="true">
      <div className="cv-move cv-move-b" data-cv="b">
        <div className="cv-tilt" data-tilt>
          <div className="cv-load">
            <CvPaper cv="b" sizes={CV_SIZES} eager />
          </div>
        </div>
      </div>
      <div className="cv-move cv-move-a" data-cv="a">
        <div className="cv-tilt" data-tilt>
          <div className="cv-load">
            <CvPaper cv="a" sizes={CV_SIZES} eager highlights="story" />
          </div>
        </div>
      </div>
      <div className="cv-move cv-move-good" data-cv="good">
        <div className="cv-tilt" data-tilt>
          <div className="cv-load">
            <CvPaper cv="good" sizes={CV_SIZES} eager highlights="story" />
          </div>
        </div>
      </div>
    </div>
  );
}

const word = (text: string, i: number) => (
  <span className="word">
    <span style={{ "--i": i } as React.CSSProperties}>{text}</span>
  </span>
);

export default function Hero({ market }: { market: Market }) {
  return (
    <section id="top" className="hero">
      <div className="wrap hero-inner">
        <div className="grid12 hero-grid">
          <div className="hero-copy col-span-12 lg:col-span-6" data-hero-copy>
            <p className="hero-eyebrow">{market.hero.eyebrow}</p>
            {/* Line breaks are fixed, so the fallback font can never change the line count and shift the page. */}
            <h1 className="h1 mt-5 lg:mt-6">
              <span className="block">
                {word("Stand", 0)} {word("out", 1)}
              </span>{" "}
              <span className="block">
                <em>
                  {word("from", 2)} {word("the", 3)} <span className="h1-last">{word("stack.", 4)}</span>
                </em>
              </span>
            </h1>
            <p className="mt-5 max-w-[460px] text-[clamp(18px,1.45vw,21px)] leading-[1.5] text-pretty text-navy/75 lg:mt-6">
              {market.hero.line}
            </p>
            <div className="mt-7 flex flex-col items-stretch gap-x-7 gap-y-2 sm:flex-row sm:items-center lg:mt-8">
              <a href="#pricing" className="btn btn-primary min-h-14 px-8 text-[1.0625rem]" data-cta="hero-see-packages">
                See Packages
                <ArrowRight />
              </a>
              <a href="#process" className="link-u font-head self-start font-medium sm:self-auto" data-cta="hero-how-it-works">
                How it works
                <ArrowDown />
              </a>
            </div>
            <div className="hero-late mt-5 text-sm lg:mt-7">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-navy/60">
                {market.hero.proof.map((p, i) => (
                  <span key={p} className="flex items-center gap-x-3">
                    {i > 0 && <span aria-hidden="true" className="h-3 w-px bg-navy/30" />}
                    {p}
                  </span>
                ))}
              </p>
              <p className="mt-2 text-navy/60">
                Prefer to chat?{" "}
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="-my-3 inline-block py-3 font-medium text-vivid underline decoration-vivid underline-offset-4 hover:text-royal" data-cta="hero-whatsapp">
                  WhatsApp us
                </a>
              </p>
            </div>
          </div>
          <div className="hero-visual col-span-12 lg:col-span-6">
            <CvStack />
          </div>
        </div>
      </div>
    </section>
  );
}
