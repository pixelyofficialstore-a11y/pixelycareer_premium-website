"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { AgencySample } from "./types";

const TABS = ["All", "Gulf CVs", "Europass", "Cover letters", "Designed CVs"];

export default function PartnersCarousel({ samples }: { samples: AgencySample[] }) {
  const [activeTab, setActiveTab] = useState("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const filtered = useMemo(
    () => activeTab === "All" ? samples : samples.filter((sample) => sample.tab === activeTab),
    [activeTab, samples],
  );
  const active = filtered.length ? activeIndex % filtered.length : 0;

  const move = useCallback((direction: number) => {
    setActiveIndex((current) => filtered.length ? (current + direction + filtered.length) % filtered.length : 0);
  }, [filtered.length]);

  useEffect(() => {
    if (paused || filtered.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => move(1), 4000);
    return () => window.clearInterval(timer);
  }, [filtered.length, move, paused]);

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
      <div className="agency-tabs" role="tablist" aria-label="Filter samples">
        {TABS.map((tab) => (
          <button
            className="agency-tab"
            key={tab}
            type="button"
            role="tab"
            id={`agency-tab-${tab.replaceAll(" ", "-").toLowerCase()}`}
            aria-controls="agency-samples-panel"
            tabIndex={activeTab === tab ? 0 : -1}
            aria-selected={activeTab === tab}
            onKeyDown={(event) => {
              const index = TABS.indexOf(activeTab);
              const next = event.key === "ArrowRight" ? (index + 1) % TABS.length
                : event.key === "ArrowLeft" ? (index + TABS.length - 1) % TABS.length
                : event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : -1;
              if (next < 0) return;
              event.preventDefault();
              setActiveTab(TABS[next]);
              setActiveIndex(0);
              event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
            }}
            onClick={() => {
              setActiveTab(tab);
              setActiveIndex(0);
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div
        className="agency-carousel-window"
        id="agency-samples-panel"
        role="tabpanel"
        aria-labelledby={`agency-tab-${activeTab.replaceAll(" ", "-").toLowerCase()}`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerCancel}
      >
        <div className="agency-carousel-track" aria-live="polite">
          {filtered.map((sample, index) => {
            const relative = filtered.length > 1
              ? (index - active + filtered.length) % filtered.length
              : 0;
            const position = relative === 0 ? "center" : relative === 1 ? "right" : relative === filtered.length - 1 ? "left" : "hidden";
            return (
              <article
                className="agency-sample-card"
                data-position={position}
                aria-hidden={position !== "center"}
                key={`${sample.type}-${sample.profession}-${sample.tab}`}
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
                  <span>{sample.profession}</span>
                </div>
              </article>
            );
          })}
          {!filtered.length && (
            <div className="agency-sample-placeholder" role="status">
              <span className="agency-placeholder-label">No samples in this format yet</span>
            </div>
          )}
        </div>
      </div>
      {filtered.length > 1 && (
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
