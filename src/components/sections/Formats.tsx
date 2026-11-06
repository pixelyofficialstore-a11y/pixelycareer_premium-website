"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { MARKETS, localize, localizeTitle, type MarketKey, type SampleTab } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";
import type { Sample } from "@/lib/home-content";

const TABS: { id: SampleTab; label: string; notes: [string, string, string] }[] = [
  { id: "pakistan", label: "Pakistan", notes: ["Single-column ATS", "Local and overseas roles", "PDF + Word"] },
  { id: "gulf", label: "Gulf", notes: ["Visa status and availability", "Photo optional", "About 2 pages"] },
  { id: "uk", label: "UK", notes: ["UK spelling", "Usually no photo", "About 2 pages"] },
  { id: "europe", label: "Europe", notes: ["Europass available", "CEFR language levels", "EU applications"] },
  { id: "usa", label: "USA", notes: ["“Resume” format", "Usually no photo", "1–2 pages"] },
];

export default function Formats({ market, samples }: { market: MarketKey; samples: Record<SampleTab, Sample[]> }) {
  const m = MARKETS[market];
  const l = (t: string) => localize(m, t);
  const [active, setActive] = useState<SampleTab>(m.defaultTab);
  const list = useRef<HTMLDivElement>(null);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
    setActive(next.id);
    list.current?.querySelector<HTMLElement>(`#tab-${next.id}`)?.focus();
  };

  return (
    <section id="formats" aria-labelledby="formats-title" className="section bg-white">
      <div className="wrap">
        <div data-reveal>
          <p className="label">Our work</p>
          <h2 id="formats-title" className="h2 mt-6">
            {localizeTitle(m, "CV")} formats for <em>every market.</em>
          </h2>
          <p className="mt-5 max-w-[620px] text-lg leading-[1.5] text-navy/70">
            {m.formatsIntro} Real formats we build, with personal details removed.
          </p>
        </div>

        <div ref={list} role="tablist" aria-label="Formats by market" className="mt-10 flex flex-wrap gap-2" data-reveal>
          {TABS.map((t, i) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={active === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={active === t.id ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className="chip chip-btn aria-selected:border-vivid aria-selected:bg-vivid aria-selected:text-white"
            >
              {t.label}
            </button>
          ))}
        </div>

        {TABS.map((t) => (
          <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={active !== t.id} className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {t.notes.map((n) => (
                <li key={n} className="chip">
                  {n}
                </li>
              ))}
            </ul>
            {samples[t.id].length > 0 ? (
              <ul className="mt-8 grid max-w-[900px] gap-8 sm:grid-cols-2">
                {samples[t.id].slice(0, 2).map((s) => (
                  <li key={s.image} className="max-w-[440px]">
                    <div className="overflow-hidden rounded-[4px] border border-[#e1e4ea] shadow-[0_24px_48px_-24px_rgb(1_12_40/0.3)]">
                      <Image src={s.image} alt={`Sample ${l("CV")}: ${l(s.caption)}`} width={1655} height={2340} sizes="(min-width: 640px) 440px, 90vw" className="block h-auto w-full" />
                    </div>
                    <p className="mt-3 text-[15px] text-navy/70">{l(s.caption)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-8 flex h-64 max-w-[440px] items-center justify-center rounded-[20px] border border-dashed border-navy/25 text-navy/70">Samples coming soon</div>
            )}
            {t.id === "gulf" && (
              <p className="mt-8 flex flex-col items-start gap-1">
                <Link href="/blog/cv-for-uae-jobs" className="link-u font-head font-medium">
                  {`Read: How to write a ${l("CV")} for UAE jobs`}
                  <ArrowRight />
                </Link>
                <Link href="/blog/cv-for-saudi-arabia-jobs" className="link-u font-head font-medium">
                  {`Read: How to write a ${l("CV")} for Saudi Arabia jobs`}
                  <ArrowRight />
                </Link>
              </p>
            )}
          </div>
        ))}

        <nav aria-label="Services" className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-1">
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
        </nav>
      </div>
    </section>
  );
}
