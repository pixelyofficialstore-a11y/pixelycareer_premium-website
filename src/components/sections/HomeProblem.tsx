"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/Icons";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import styles from "./HomeProblem.module.css";

const before = HERO_PERSONAS.us.images.bad;
const after = HERO_PERSONAS.us.images.good;
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
export default function HomeProblem() {
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

  const cancelHint = useCallback(() => {
    interactedRef.current = true;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

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
    // Marker buttons stay independent of the dragging surface.
    if ((event.target as Element).closest("[data-marker]")) return;
    setPinnedMarker(null);
    setHoveredMarker(null);
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, position, horizontal: false };
    sliderRef.current?.focus({ preventScroll: true });
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
          Same experience. <span>A stronger first read.</span>
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
            <Image src={after.src} width={after.width} height={after.height} alt="" className={styles.resumeImage} draggable={false} unoptimized />
            <div className={styles.beforeLayer}>
              <Image src={before.src} width={before.width} height={before.height} alt="" className={styles.resumeImage} draggable={false} unoptimized />
            </div>
          </div>

          <span className={`${styles.chip} ${styles.beforeChip}`} style={{ opacity: Math.max(0, Math.min(1, (position * width / 100 - 14) / 80)) }} aria-hidden="true">✕ Before</span>
          <span className={`${styles.chip} ${styles.afterChip}`} style={{ opacity: Math.max(0, Math.min(1, ((100 - position) * width / 100 - 14) / 80)) }} aria-hidden="true">✓ After</span>

          <div className={styles.markers}>
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
          </div>

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

        <div className={styles.mobileSummary}>
          <div>
            <h3 className={styles.badText}>✕ Before</h3>
            <p>Two columns</p>
            <p>Duties, not results</p>
            <p>Missing keywords</p>
          </div>
          <div>
            <h3 className={styles.goodText}>✓ After</h3>
            <p>Single column</p>
            <p>Results with numbers</p>
            <p>Role keywords</p>
          </div>
        </div>

        <Link href="/free-cv-review" className={styles.review} data-cta="home-problem-review">
          Free CV review <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
