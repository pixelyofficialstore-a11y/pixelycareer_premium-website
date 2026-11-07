"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { AgencySample } from "./types";

export default function PartnersCarousel({ samples }: { samples: AgencySample[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const active = samples.length ? activeIndex % samples.length : 0;

  const move = useCallback((direction: number) => {
    setActiveIndex((current) => samples.length ? (current + direction + samples.length) % samples.length : 0);
  }, [samples.length]);

  useEffect(() => {
    if (paused || samples.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => move(1), 4000);
    return () => window.clearInterval(timer);
  }, [samples.length, move, paused]);

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
        aria-label="Sample documents"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerCancel}
      >
        <div className="agency-carousel-track" aria-live="polite">
          {samples.map((sample, index) => {
            const relative = samples.length > 1
              ? (index - active + samples.length) % samples.length
              : 0;
            const position = relative === 0 ? "center" : relative === 1 ? "right" : relative === samples.length - 1 ? "left" : "hidden";
            return (
              <article
                className="agency-sample-card"
                data-position={position}
                aria-hidden={position !== "center"}
                key={`${sample.type}-${sample.profession}-${sample.image}`}
              >
                <div className="agency-sample-paper">
                  {sample.available ? (
                    <img src={sample.image} alt={sample.alt} draggable={false} />
                  ) : (
                    <div className="agency-sample-placeholder" role="img" aria-label={`Image to be added: ${sample.alt}`}>
                      <span className="agency-placeholder-label">Image to be added</span>
                      <span className="agency-placeholder-lines" aria-hidden="true">
                        {Array.from({ length: 11 }, (_, line) => <i key={line} />)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="agency-sample-caption">
                  <strong>{sample.type}</strong>
                </div>
              </article>
            );
          })}
          {!samples.length && (
            <div className="agency-sample-placeholder" role="status">
              <span className="agency-placeholder-label">Sample documents will appear here.</span>
            </div>
          )}
        </div>
      </div>
      {samples.length > 1 && (
        <div className="agency-carousel-controls">
          <button className="agency-carousel-arrow" type="button" aria-label="Previous sample" onClick={() => move(-1)}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button className="agency-carousel-arrow" type="button" aria-label="Next sample" onClick={() => move(1)}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
