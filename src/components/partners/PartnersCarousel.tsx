"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import type { AgencySample } from "./types";

const FILTERS = ["All", "Gulf CVs", "Europass", "Cover letters", "Designed CVs"];

function categoryFor(sample: AgencySample) {
  const value = `${sample.tab} ${sample.type} ${sample.profession}`.toLowerCase();
  if (value.includes("europass")) return "Europass";
  if (value.includes("cover letter") || value.includes("cover-letter")) return "Cover letters";
  if (value.includes("designed") || value.includes("design")) return "Designed CVs";
  if (value.includes("gulf") || value.includes("ats") || value.includes("cv") || value.includes("resume")) return "Gulf CVs";
  return sample.tab;
}

function sampleKey(sample: AgencySample) {
  return `${sample.type}-${sample.profession}-${sample.image}`;
}

export default function PartnersCarousel({ samples }: { samples: AgencySample[] }) {
  const [filter, setFilter] = useState("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const pointerStart = useRef<number | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const visibleSamples = useMemo(() => samples.filter((sample) => sample.available && !failed.has(sampleKey(sample))), [samples, failed]);
  const filteredSamples = useMemo(
    () => filter === "All" ? visibleSamples : visibleSamples.filter((sample) => categoryFor(sample) === filter),
    [visibleSamples, filter],
  );
  const active = filteredSamples.length ? activeIndex % filteredSamples.length : 0;

  useEffect(() => { setActiveIndex(0); }, [filter]);

  const move = useCallback((direction: number) => {
    setActiveIndex((current) => filteredSamples.length ? (current + direction + filteredSamples.length) % filteredSamples.length : 0);
  }, [filteredSamples.length]);

  useEffect(() => {
    if (paused || filteredSamples.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => move(1), 4000);
    return () => window.clearInterval(timer);
  }, [filteredSamples.length, move, paused]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStart.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1);
    pointerStart.current = null;
  };
  const onPointerCancel = () => { pointerStart.current = null; };
  const hideFailed = (key: string) => setFailed((current) => new Set(current).add(key));
  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let next = FILTERS.indexOf(filter);
    if (event.key === "ArrowRight") next = (next + 1) % FILTERS.length;
    else if (event.key === "ArrowLeft") next = (next - 1 + FILTERS.length) % FILTERS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = FILTERS.length - 1;
    else return;
    event.preventDefault();
    setFilter(FILTERS[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      className="agency-carousel"
      aria-label="Sample work carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="agency-sample-tabs" role="tablist" aria-label="Filter sample work">
        {FILTERS.map((item, index) => <button
          key={item}
          ref={(element) => { tabRefs.current[index] = element; }}
          type="button"
          role="tab"
          id={`sample-tab-${index}`}
          aria-selected={filter === item}
          aria-controls="agency-carousel-panel"
          tabIndex={filter === item ? 0 : -1}
          onClick={() => setFilter(item)}
          onKeyDown={onTabKeyDown}
        >{item}</button>)}
      </div>
      <div
        className="agency-carousel-window"
        id="agency-carousel-panel"
        role="tabpanel"
        aria-labelledby={`sample-tab-${FILTERS.indexOf(filter)}`}
        aria-label="Sample documents"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerCancel}
      >
        {filteredSamples.length ? <div className="agency-carousel-track" aria-live="polite">
          {filteredSamples.map((sample, index) => {
            const relative = filteredSamples.length > 1 ? (index - active + filteredSamples.length) % filteredSamples.length : 0;
            const position = relative === 0 ? "center" : relative === 1 ? "right" : relative === filteredSamples.length - 1 ? "left" : "hidden";
            return <article
              className="agency-sample-card"
              data-position={position}
              aria-hidden={position !== "center"}
              key={sampleKey(sample)}
            >
              <div className="agency-sample-paper">
                <img src={sample.image} alt={sample.alt} draggable={false} onError={() => hideFailed(sampleKey(sample))} />
              </div>
              <div className="agency-sample-caption"><strong>{sample.type}</strong><span>{sample.profession}</span></div>
            </article>;
          })}
        </div> : <div className="agency-samples-empty" role="status"><span className="agency-empty-mark" aria-hidden="true" /><p>Samples coming soon.</p></div>}
      </div>
      {filteredSamples.length > 1 && <div className="agency-carousel-controls">
        <button className="agency-carousel-arrow" type="button" aria-label="Previous sample" onClick={() => move(-1)}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span className="agency-carousel-count">{String(active + 1).padStart(2, "0")} <i /> {String(filteredSamples.length).padStart(2, "0")}</span>
        <button className="agency-carousel-arrow" type="button" aria-label="Next sample" onClick={() => move(1)}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>}
    </div>
  );
}
