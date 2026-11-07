import { Fragment } from "react";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import type { Market } from "@/config/markets";
import { ArrowDown, ArrowRight } from "@/components/ui/Icons";
import HeroStack from "./HeroStack";

export default function Hero({ market }: { market: Market }) {
  const persona = HERO_PERSONAS[market.key];
  const { line1, line2, sub } = persona.heroCopy;
  let i = 0;
  const words = (line: string) =>
    line.split(" ").map((text) => (
      <Fragment key={text}>
        <span className="word">
          <span style={{ "--i": i++ } as React.CSSProperties}>{text}</span>
        </span>{" "}
      </Fragment>
    ));
  return (
    <section id="top" className="hero">
      <div className="wrap hero-inner">
        <div className="grid12 hero-grid">
          <div className="hero-copy col-span-12 lg:col-span-6">
            {/* Line breaks are fixed on large screens, so the fallback font can never change the line count and shift the page. */}
            <h1 className="h1">
              <span className="block">{words(line1)}</span>{" "}
              <span className="block">
                <em>{words(line2)}</em>
              </span>
            </h1>
            <p className="hero-sub">
              <span className="lg:block">{sub[0]}</span> <span className="lg:block">{sub[1]}</span>
            </p>
            <div className="hero-actions">
              <a href="#pricing" className="btn btn-primary min-h-14 px-8 text-[1.0625rem]" data-cta="hero-see-packages">
                See Packages
                <ArrowRight />
              </a>
              <a href="#process" className="btn btn-outline min-h-14 px-8 text-[1.0625rem]" data-cta="hero-how-it-works">
                How it works
                <ArrowDown />
              </a>
              <span aria-hidden="true" className="hero-cue">
                Scroll ↓
              </span>
            </div>
          </div>
          <div className="hero-visual col-span-12 lg:col-span-6">
            <HeroStack persona={persona} />
          </div>
        </div>
      </div>
    </section>
  );
}
