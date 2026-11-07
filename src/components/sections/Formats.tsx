"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FORMATS } from "@/config/formats";
import { MARKETS, localize, localizeTitle, type MarketKey } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";

const Chevron = ({ back }: { back?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d={back ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);

/** One straight row of formats, with small arrows at its ends. */
export default function Formats({ market }: { market: MarketKey }) {
  const m = MARKETS[market];
  const l = (t: string) => localize(m, t);
  const items = FORMATS[market];
  const track = useRef<HTMLUListElement>(null);
  const [ends, setEnds] = useState({ start: true, end: false });

  const sync = () => {
    const t = track.current;
    if (t) setEnds({ start: t.scrollLeft < 8, end: t.scrollLeft + t.clientWidth > t.scrollWidth - 8 });
  };
  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
  const move = (dir: number) => {
    const t = track.current;
    const card = t?.querySelector("li");
    if (t && card) t.scrollBy({ left: dir * (card.clientWidth + 20), behavior: "smooth" });
  };

  return (
    <section id="formats" aria-labelledby="formats-title" className="section bg-white">
      <div className="wrap">
        <div data-reveal>
          <p className="label">Our work</p>
          <h2 id="formats-title" className="h2 mt-6">
            {localizeTitle(m, "CV")} formats for <em>every market.</em>
          </h2>
          <p className="mt-5 max-w-[620px] text-lg leading-[1.5] text-navy/70">{m.formatsIntro}</p>
        </div>

        <div className="fm" data-reveal>
          <button type="button" className="fm-arrow" aria-label="Previous formats" disabled={ends.start} onClick={() => move(-1)}>
            <Chevron back />
          </button>
          <ul ref={track} className="fm-track" onScroll={sync} tabIndex={0} aria-label={`${l("CV")} formats`}>
            {items.map((f, i) => (
              <li key={f.src} className="fm-card">
                <Image src={f.src} alt={`Sample ${l("CV")} format ${i + 1}`} width={f.width} height={f.height} sizes="(min-width: 1024px) 300px, 70vw" className="block h-auto w-full" />
              </li>
            ))}
          </ul>
          <button type="button" className="fm-arrow" aria-label="Next formats" disabled={ends.end} onClick={() => move(1)}>
            <Chevron />
          </button>
        </div>

        <nav aria-label="Related" className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-1">
          <Link href="/services/ats-cv" className="link-u font-head font-medium">
            {l("ATS CV writing")}
            <ArrowRight />
          </Link>
          <Link href="/services/cover-letter" className="link-u font-head font-medium">
            Cover letters
            <ArrowRight />
          </Link>
          <Link href="/services/linkedin" className="link-u font-head font-medium">
            LinkedIn optimization
            <ArrowRight />
          </Link>
          {(market === "pk" || market === "ae" || market === "sa") && (
            <>
              <Link href="/blog/cv-for-uae-jobs" className="link-u font-head font-medium">
                CVs for UAE jobs
                <ArrowRight />
              </Link>
              <Link href="/blog/cv-for-saudi-arabia-jobs" className="link-u font-head font-medium">
                CVs for Saudi Arabia jobs
                <ArrowRight />
              </Link>
            </>
          )}
        </nav>
      </div>
    </section>
  );
}
