"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/Icons";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import type { MarketKey } from "@/config/markets";
import styles from "./HomeProblem.module.css";

const markers = [
  { id: "before1", side: "before", number: 1, x: 24, y: 45, text: "Two columns ATS can't read" },
  { id: "before2", side: "before", number: 2, x: 46, y: 89, text: "Duties, not results" },
  { id: "before3", side: "before", number: 3, x: 18, y: 79, text: "Missing job keywords" },
  { id: "after1", side: "after", number: 1, x: 66, y: 32, text: "Single column, ATS ready" },
  { id: "after2", side: "after", number: 2, x: 66, y: 94, text: "Results with numbers" },
  { id: "after3", side: "after", number: 3, x: 82, y: 55, text: "Keywords for the role" },
] as const;


type Drag = { pointerId: number; x: number; y: number; position: number; horizontal: boolean };

/** Root homepage only. Both images keep the same scale under the reveal mask. */
export default function HomeProblem({ marketKey = "us" }: { marketKey?: MarketKey }) {
  // TODO market image: markets without their own pair show the US pair.
  const before = HERO_PERSONAS[marketKey]?.images?.bad ?? HERO_PERSONAS.us.images.bad;
  const after = HERO_PERSONAS[marketKey]?.images?.good ?? HERO_PERSONAS.us.images.good;
  const [position, setPosition] = useState(50);
  const [width, setWidth] = useState(880);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [pinnedMarker, setPinnedMarker] = useState<string | null>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const frameRef = useRef<number | null>(null);
  const interactedRef = useRef(false);
  const hintSeenRef = useRef(false);
  const descriptionId = useId();
  // List rows point at the matching area of the Before CV, on hover or tap only. No dots, nothing plays on scroll.
  const interactive = true;
  const areas = HERO_PERSONAS[marketKey]?.areas ?? HERO_PERSONAS.us.areas;
  const changes = HERO_PERSONAS[marketKey]?.changes ?? HERO_PERSONAS.us.changes;
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const tweenRef = useRef<number | null>(null);
  const positionRef = useRef(50);
  positionRef.current = position;

  // Moves the slider to a point over 400ms with an ease.
  const slideTo = useCallback((target: number) => {
    if (tweenRef.current !== null) cancelAnimationFrame(tweenRef.current);
    const from = positionRef.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setPosition(target); return; }
    let start: number | null = null;
    const step = (time: number) => {
      if (start === null) start = time;
      const t = Math.min((time - start) / 400, 1);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setPosition(from + (target - from) * ease);
      tweenRef.current = t < 1 ? requestAnimationFrame(step) : null;
    };
    tweenRef.current = requestAnimationFrame(step);
  }, []);

  const showRow = (index: number | null) => {
    cancelHint();
    setActiveRow(index);
    slideTo(index === null ? 50 : 80);
  };

  const cancelHint = useCallback(() => {
    interactedRef.current = true;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const interactiveRef = useRef(interactive);
  useEffect(() => () => { if (tweenRef.current !== null) cancelAnimationFrame(tweenRef.current); }, []);
  const changesRef = useRef<HTMLDivElement>(null);
  // Tapping anywhere outside the list clears the highlight and returns the slider to the middle.
  useEffect(() => {
    if (!interactive || activeRow === null) return;
    const outside = (event: globalThis.PointerEvent) => {
      if (changesRef.current?.contains(event.target as Node)) return;
      setActiveRow(null);
      // A drag on the comparison itself keeps the slider where the visitor puts it.
      if (!comparisonRef.current?.contains(event.target as Node)) slideTo(50);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [interactive, activeRow, slideTo]);

  useEffect(() => {
    const element = comparisonRef.current;
    if (!element) return;
    const resize = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    resize.observe(element);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stopForReducedMotion = () => {
      if (reducedMotion.matches) {
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
        if (!interactedRef.current) setPosition(50);
      }
    };
    reducedMotion.addEventListener("change", stopForReducedMotion);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || hintSeenRef.current) return;
      hintSeenRef.current = true;
      observer.disconnect();
      if (reducedMotion.matches || interactedRef.current) return;
      let start: number | null = null;
      const animate = (time: number) => {
        if (interactedRef.current || reducedMotion.matches) return;
        if (start === null) start = time;
        const progress = Math.min((time - start) / 1600, 1);
        const segment = Math.min(Math.floor(progress * 3), 2);
        const local = progress * 3 - segment;
        const ease = (1 - Math.cos(Math.PI * local)) / 2;
        const points = [50, 30, 70, 50];
        setPosition(points[segment] + (points[segment + 1] - points[segment]) * ease);
        frameRef.current = progress < 1 ? requestAnimationFrame(animate) : null;
      };
      frameRef.current = requestAnimationFrame(animate);
    }, { threshold: .35 });
    observer.observe(element);
    return () => {
      resize.disconnect();
      observer.disconnect();
      reducedMotion.removeEventListener("change", stopForReducedMotion);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    cancelHint();
    if (tweenRef.current !== null) { cancelAnimationFrame(tweenRef.current); tweenRef.current = null; }
    // Marker buttons stay independent of the dragging surface.
    if ((event.target as Element).closest("[data-marker]")) return;
    setPinnedMarker(null);
    setHoveredMarker(null);
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, position, horizontal: false };
    // No focus() here: focusing on a mouse or touch drag drew the keyboard ring.
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = Math.abs(event.clientX - drag.x);
    const dy = Math.abs(event.clientY - drag.y);
    if (!drag.horizontal) {
      if (dy > 6 && dy >= dx) {
        dragRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        return;
      }
      if (dx <= 6 || dx <= dy) return;
      drag.horizontal = true;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    setPosition(Math.max(0, Math.min(100, drag.position + (event.clientX - drag.x) / bounds.width * 100)));
  };

  const pointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let delta = 0;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") delta = -5;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") delta = 5;
    else if (event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    cancelHint();
    setPinnedMarker(null);
    setHoveredMarker(null);
    setPosition((value) => event.key === "Home" ? 0 : event.key === "End" ? 100 : Math.max(0, Math.min(100, value + delta)));
  };

  return (
    <section id="problem" aria-labelledby="home-problem-title" className={styles.section}>
      <div className={styles.inner}>
        <h2 id="home-problem-title" className={styles.title}>
          Same experience. <span>A sharper story.</span>
        </h2>
        <p id={descriptionId} className={styles.subtitle}>Drag the line to see the difference.</p>

        <div
          ref={comparisonRef}
          className={styles.comparison}
          style={{ "--position": `${position}%` } as CSSProperties}
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerEnd}
          onPointerCancel={pointerEnd}
          onLostPointerCapture={() => { dragRef.current = null; }}
        >
          <div className={styles.images} aria-hidden="true">
            <Image src={after.src} width={after.width} height={after.height} alt={after.alt ?? ""} className={styles.resumeImage} draggable={false} {...(after.hd ? { quality: after.quality, sizes: after.sizes } : { unoptimized: true })} />
            <div className={styles.beforeLayer}>
              <Image src={before.src} width={before.width} height={before.height} alt={before.alt ?? ""} className={styles.resumeImage} draggable={false} {...(before.hd ? { quality: before.quality, sizes: before.sizes } : { unoptimized: true })} />
            </div>
          </div>

          {interactive && (
            <div className={styles.areas} aria-hidden="true">
              {areas.map((a, i) => (
                <span key={i} className={styles.area} data-on={activeRow === i} style={{ left: `${a.left}%`, top: `${a.top}%`, width: `${a.width}%`, height: `${a.height}%` }} />
              ))}
            </div>
          )}

          <span className={`${styles.chip} ${styles.beforeChip}`} style={{ opacity: Math.max(0, Math.min(1, (position * width / 100 - 14) / 80)) }} aria-hidden="true">✕ Before</span>
          <span className={`${styles.chip} ${styles.afterChip}`} style={{ opacity: Math.max(0, Math.min(1, ((100 - position) * width / 100 - 14) / 80)) }} aria-hidden="true">✓ After</span>

          {!interactive && <div className={styles.markers}>
            {markers.map((marker) => {
              const clearance = 12 / width * 100;
              const visible = marker.side === "before" ? position >= marker.x + clearance : position <= marker.x - clearance;
              const open = visible && (hoveredMarker === marker.id || pinnedMarker === marker.id);
              if (!visible) return null;
              return (
                <div key={marker.id} className={styles.markerGroup} style={{ "--x": `${marker.x}%`, "--crop-y": `${marker.y}%`, "--full-y": `${marker.y * 0.53}%` } as CSSProperties}>
                  <button
                    type="button"
                    data-marker={marker.id}
                    className={`${styles.marker} ${marker.side === "before" ? styles.badMarker : styles.goodMarker}`}
                    aria-label={`${marker.side === "before" ? "Before" : "After"} ${marker.number}: ${marker.text}`}
                    aria-expanded={open}
                    aria-controls={`${descriptionId}-${marker.id}`}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") {
                        cancelHint();
                        setHoveredMarker(marker.id);
                      }
                    }}
                    onPointerLeave={() => setHoveredMarker(null)}
                    onFocus={(event) => {
                      cancelHint();
                      if (event.currentTarget.matches(":focus-visible")) setHoveredMarker(marker.id);
                    }}
                    onBlur={() => { setHoveredMarker(null); setPinnedMarker(null); }}
                    onClick={() => {
                      cancelHint();
                      setHoveredMarker(null);
                      setPinnedMarker((value) => value === marker.id ? null : marker.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setHoveredMarker(null);
                        setPinnedMarker(null);
                      }
                    }}
                  >
                    {marker.number}
                  </button>
                  <span id={`${descriptionId}-${marker.id}`} className={styles.tag} data-open={open} role="tooltip" hidden={!open}>
                    {marker.text}
                  </span>
                </div>
              );
            })}
          </div>}

          <div className={styles.divider} aria-hidden="true" />
          <div
            ref={sliderRef}
            className={styles.handle}
            role="slider"
            tabIndex={0}
            aria-label="Compare original and improved resume"
            aria-describedby={descriptionId}
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(position)}
            aria-valuetext={`${Math.round(position)}% original resume visible`}
            onKeyDown={keyDown}
            onFocus={cancelHint}
          >
            <svg width="26" height="20" viewBox="0 0 26 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M10 10H2m0 0 4-4m-4 4 4 4m10-4h8m0 0-4-4m4 4-4 4" />
            </svg>
          </div>
        </div>

        <div ref={changesRef} className={styles.changes} role="table" aria-label="What changes" onMouseLeave={interactive ? () => { if (activeRow !== null) showRow(null); } : undefined}>
          <div className={styles.changesHead} role="row">
            <span role="columnheader" className={styles.badText}>Before</span>
            <span role="columnheader" className={styles.goodText}>After</span>
          </div>
          {changes.map((c, i) => (
            <div
              key={c.from}
              className={styles.change}
              role="row"
              data-active={interactive ? activeRow === i : undefined}
              tabIndex={interactive ? 0 : undefined}
              onPointerEnter={interactive ? (e) => { if (e.pointerType === "mouse") showRow(i); } : undefined}
              onClick={interactive ? () => showRow(activeRow === i ? null : i) : undefined}
              onFocus={interactive ? (e) => { if (e.currentTarget.matches(":focus-visible")) showRow(i); } : undefined}
              onBlur={interactive ? () => showRow(null) : undefined}
            >
              <span className={styles.changeN} aria-hidden="true">0{i + 1}</span>
              <span role="cell" className={styles.changeFrom}>
                <span aria-hidden="true">✕</span>
                {c.from}
              </span>
              <span role="cell" className={styles.changeTo}>
                <span aria-hidden="true">✓</span>
                {c.to}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
