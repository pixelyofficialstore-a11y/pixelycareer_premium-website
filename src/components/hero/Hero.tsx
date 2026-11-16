import { Fragment } from "react";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import { orderHref, type Market } from "@/config/markets";
import { ArrowDown, ArrowRight } from "@/components/ui/Icons";
import HeroStack from "./HeroStack";

import styles from "./Hero.module.css";

/** copy: replaces the market's headline and subtext (the /offer page). */
export default function Hero({ market, centerMobileHeadline = false, copy }: { market: Market; centerMobileHeadline?: boolean; copy?: { line1: string; line2: string; sub: [string, string] } }) {
  const persona = HERO_PERSONAS[market.key];
  const { line1, line2, sub } = copy ?? persona.heroCopy;
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
    <section id="top" className={`hero${centerMobileHeadline ? ` ${styles.mainMobileHero}` : ""}`}>
      <div className="wrap hero-inner">
        <div className="grid12 hero-grid">
          <div className="hero-copy col-span-12 lg:col-span-6">
            {/* Line breaks are fixed on large screens, so the fallback font can never change the line count and shift the page. */}
            <h1 className={`h1${centerMobileHeadline ? ` ${styles.centerMobileHeadline}` : ""}${copy ? ` ${styles.twoLine} h1-two` : ""}`}>
              <span className="block">{words(line1)}</span>{" "}
              <span className="block">
                <em>{words(line2)}</em>
              </span>
            </h1>
            <p className="hero-sub">
              {copy ? sub.filter(Boolean).join(" ") : <><span className="lg:block">{sub[0]}</span> <span className="lg:block">{sub[1]}</span></>}
            </p>
            <div className="hero-actions">
              <a href={market.key === "pk" ? "#plans" : orderHref(market)} className="btn btn-primary min-h-14 px-8 text-[1.0625rem]" data-cta={true ? "home-hero-order" : "hero-see-packages"}>
                {true ? "Start your order" : "See Packages"}
                <ArrowRight />
              </a>
              {market.key === "pk" ? <a href="#plans" className={styles.reviewLink} data-cta="home-hero-packages">See plans <ArrowRight /></a> : true ? <a href="/free-cv-review" className={styles.reviewLink} data-cta="home-hero-review">{market.key === "us" ? "Free resume review" : "Free CV review"} <ArrowRight /></a> : <a href="#process" className="btn btn-outline min-h-14 px-8 text-[1.0625rem]" data-cta="hero-how-it-works">
                How it works
                <ArrowDown />
              </a>}
              {market.path !== "/" && <span aria-hidden="true" className="hero-cue">
                Scroll ↓
              </span>}
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
