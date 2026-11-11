"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { FORMATS, FORMAT_LABELS } from "@/config/formats";
import type { MarketKey } from "@/config/markets";
import styles from "./Formats.module.css";
import heroStyles from "@/components/hero/Hero.module.css";

const Chevron = ({ back = false }: { back?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d={back ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
  </svg>
);

function offsetFor(index: number, active: number, count: number) {
  let offset = index - active;
  if (offset > count / 2) offset -= count;
  if (offset < -count / 2) offset += count;
  return offset;
}

export default function Formats({ market }: { market: MarketKey }) {
  const items = FORMATS[market];
  const labels = FORMAT_LABELS[market];
  const resumeWord = market === "us" ? "Resume" : "CV";
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [touching, setTouching] = useState(false);
  const [stopped, setStopped] = useState(false);
  const resume = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const swiped = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion || stopped || hovered || touching || items.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % items.length);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [hovered, items.length, reducedMotion, stopped, touching]);

  // A pick pauses the loop; it picks up again 2s later, so it never stays stuck.
  const select = (index: number) => {
    setStopped(true);
    setActive(index);
    window.clearTimeout(resume.current);
    resume.current = window.setTimeout(() => setStopped(false), 2000);
  };
  useEffect(() => () => window.clearTimeout(resume.current), []);

  const step = (direction: number) => {
    select((active + direction + items.length) % items.length);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      select(0);
    } else if (event.key === "End") {
      event.preventDefault();
      select(items.length - 1);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swiped.current = false;
    pointerStart.current = event.clientX;
    if (event.pointerType === "touch") setTouching(true);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    setTouching(false);
    if (start === null || Math.abs(event.clientX - start) < 42) return;
    swiped.current = true;
    step(event.clientX < start ? 1 : -1);
  };

  const cancelPointer = () => {
    pointerStart.current = null;
    setTouching(false);
  };

  return (
    <section
      id="formats"
      aria-labelledby="formats-title"
      className={styles.section}
      data-reduced={reducedMotion}
    >
      <div className={`wrap ${styles.container}`}>
        <header className={styles.heading} data-reveal>
          <h2 id="formats-title" className={`h1 ${heroStyles.centerMobileHeadline} ${styles.title}`}>
            Built for where <em>you&apos;re applying.</em>
          </h2>
        </header>

        <div
          className={styles.carousel}
          onMouseEnter={() => { if (!window.matchMedia("(hover: hover)").matches) return; window.clearTimeout(resume.current); setHovered(true); }}
          onMouseLeave={() => { window.clearTimeout(resume.current); resume.current = window.setTimeout(() => { setHovered(false); setStopped(false); }, 2000); }}
        >
          <div
            className={styles.stage}
            role="region"
            aria-label={`${resumeWord} format samples`}
            aria-roledescription="carousel"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={cancelPointer}
            onClickCapture={(event) => {
              if (!swiped.current) return;
              event.preventDefault();
              event.stopPropagation();
              swiped.current = false;
            }}
          >
            {items.map((format, index) => {
              const offset = offsetFor(index, active, items.length);
              const label = labels[index];
              const position = offset === 0 ? "center" : offset === -1 ? "left" : offset === 1 ? "right" : "hidden";
              return (
                <button
                  type="button"
                  key={format.src}
                  className={styles.slide}
                  data-position={position}
                  aria-label={`${label.name}, ${label.chip}`}
                  aria-pressed={offset === 0}
                  tabIndex={Math.abs(offset) <= 1 ? 0 : -1}
                  onClick={() => select(index)}
                >
                  <Image
                    src={format.src}
                    alt={format.label ? `${label.name} sample resume` : `${label.name} ${resumeWord} sample`}
                    width={format.width}
                    height={format.height}
                    sizes={format.sizes ?? "(max-width: 767px) 78vw, 368px"}
                    quality={format.quality}
                    {...(format.label ? { loading: "lazy" as const } : { priority: index === active })}
                  />
                </button>
              );
            })}
            <button type="button" className={`${styles.arrow} ${styles.previous}`} aria-label="Previous format" onClick={() => step(-1)}>
              <Chevron back />
            </button>
            <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="Next format" onClick={() => step(1)}>
              <Chevron />
            </button>
          </div>

          <div className={styles.dots} aria-label="Choose a format">
            {items.map((item, index) => (
              <button
                key={item.src}
                type="button"
                className={styles.dot}
                data-active={index === active}
                aria-label={`Show format ${index + 1}: ${labels[index].name}`}
                aria-current={index === active ? "true" : undefined}
                onClick={() => select(index)}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
