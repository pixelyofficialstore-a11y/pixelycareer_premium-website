"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { AgencySample } from "./types";

function sampleKey(sample: AgencySample) {
  return `${sample.type}-${sample.profession}-${sample.image}`;
}

export default function PartnersCarousel({ samples }: { samples: AgencySample[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const pointerStart = useRef<number | null>(null);
  const filteredSamples = useMemo(() => samples.filter((sample) => sample.available && !failed.has(sampleKey(sample))), [samples, failed]);
  const active = filteredSamples.length ? activeIndex % filteredSamples.length : 0;

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
      <div
        className="agency-carousel-window"
        id="agency-carousel-panel"
        role="region"
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
        <button className="agency-carousel-arrow" type="button" aria-label="Next sample" onClick={() => move(1)}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>}
    </div>
  );
}
