import Link from "next/link";
import CvSheet from "@/components/cv/CvSheet";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import { MARKETS, localize, type MarketKey } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";
import { BrowserVisual, ProfileVisual } from "./ServiceVisuals";

export default function Services({ market }: { market: MarketKey }) {
  const m = MARKETS[market];
  const l = (t: string) => localize(m, t);
  const LAYERS = [
    { n: "01", title: "Career Documents", line: l("ATS CVs, Europass CVs and cover letters."), href: "/services/ats-cv", link: l("Explore CV writing"), visual: <div className="layer-cv"><CvSheet image={HERO_PERSONAS[market].images.good} /></div> },
    { n: "02", title: "Professional Visibility", line: "A LinkedIn profile recruiters can find.", href: "/services/linkedin", link: "Explore LinkedIn optimization", visual: <div className="layer-mock"><ProfileVisual /></div> },
    { n: "03", title: "Digital Presence", line: "A portfolio website with your name on it.", href: "/services/portfolio-website", link: "Explore portfolio websites", visual: <div className="layer-mock"><BrowserVisual /></div> },
  ];
  return (
    <section id="services" aria-labelledby="services-title" className="section bg-mist">
      <div className="wrap">
        <div data-reveal>
          <p className="label">What we build</p>
          <h2 id="services-title" className="h2 mt-6">
            Three layers. <em>One brand.</em>
          </h2>
        </div>
        <ul className="layers">
          {LAYERS.map((x) => (
            <li key={x.n} className="layer" data-reveal>
              <div className="layer-visual" aria-hidden="true">
                {x.visual}
              </div>
              <div className="layer-copy">
                <span className="layer-n" aria-hidden="true">
                  {x.n}
                </span>
                <h3 className="card-title">
                  <Link href={x.href} className="after:absolute after:inset-0 after:content-['']">
                    {x.title}
                  </Link>
                </h3>
                <p className="mt-2 text-base leading-[1.5] text-pretty text-navy/70">{x.line}</p>
                <span className="link-u font-head mt-3 font-medium text-vivid">
                  {x.link}
                  <ArrowRight />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
