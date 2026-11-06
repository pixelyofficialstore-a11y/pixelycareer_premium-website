"use client";
import Image from "next/image";
import Link from "next/link";
import { MARKETS, localize, type MarketKey } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";
import { BrowserVisual, ProfileVisual } from "./ServiceVisuals";

const onMove = (e: React.PointerEvent<HTMLElement>) => {
  if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = e.currentTarget.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - 0.5;
  const py = (e.clientY - r.top) / r.height - 0.5;
  const v = e.currentTarget.querySelector<HTMLElement>("[data-tilt]");
  if (v) v.style.transform = `perspective(1000px) rotateX(${-py * 8}deg) rotateY(${px * 8}deg)`; // max 4° each way
};
const onLeave = (e: React.PointerEvent<HTMLElement>) => {
  const v = e.currentTarget.querySelector<HTMLElement>("[data-tilt]");
  if (v) v.style.transform = "";
};

function Copy({ n, title, line, href, link }: { n: string; title: string; line: string; href: string; link: string }) {
  return (
    <div className="bento-copy">
      <span className="p-num" aria-hidden="true">
        {n}
      </span>
      <h3 className="card-title mt-3">
        <Link href={href} className="after:absolute after:inset-0 after:content-['']">
          {title}
        </Link>
      </h3>
      <p className="mt-2 text-base leading-[1.5] text-pretty text-navy/70">{line}</p>
      <span className="link-u font-head mt-1 font-medium text-vivid">
        {link}
        <ArrowRight />
      </span>
    </div>
  );
}

export default function Services({ market }: { market: MarketKey }) {
  const m = MARKETS[market];
  const l = (t: string) => localize(m, t);
  return (
    <section id="services" aria-labelledby="services-title" className="section bg-mist">
      <div className="wrap">
        <div data-reveal>
          <p className="label">What we build</p>
          <h2 id="services-title" className="h2 mt-6">
            Three layers. <em>One brand.</em>
          </h2>
        </div>
        <div className="bento">
          <article onPointerMove={onMove} onPointerLeave={onLeave} className="card lift bento-large" data-reveal>
            <div className="bento-visual">
              <div data-tilt className="bento-tilt">
                <Image
                  src="/cv/good-cv-ats-single-column.webp"
                  alt={l("Single-column ATS CV written by Pixely Careers")}
                  width={1655}
                  height={2340}
                  sizes="(min-width: 1024px) 24vw, 70vw"
                  className="bento-cv"
                />
              </div>
            </div>
            <Copy n="01" title="Career Documents" line={l("ATS CVs, Europass CVs and cover letters.")} href="/services/ats-cv" link={l("Explore CV writing")} />
          </article>
          <article onPointerMove={onMove} onPointerLeave={onLeave} className="card lift bento-small" data-reveal>
            <div className="bento-visual">
              <div data-tilt className="bento-tilt bento-mock">
                <ProfileVisual />
              </div>
            </div>
            <Copy n="02" title="Professional Visibility" line="A LinkedIn profile recruiters can find." href="/services/linkedin" link="Explore LinkedIn optimization" />
          </article>
          <article onPointerMove={onMove} onPointerLeave={onLeave} className="card lift bento-small" data-reveal>
            <div className="bento-visual">
              <div data-tilt className="bento-tilt bento-mock">
                <BrowserVisual />
              </div>
            </div>
            <Copy n="03" title="Digital Presence" line="A portfolio website with your name on it." href="/services/portfolio-website" link="Explore portfolio websites" />
          </article>
        </div>
      </div>
    </section>
  );
}
