"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HomeTrustStrip.module.css";

const stats = [
  { value: 1800, suffix: "+", label: "Clients served" },
  { value: 100, suffix: "%", label: "Recommended on Facebook" },
  { value: 5, suffix: "+", label: "Countries served" },
] as const;

export default function HomeTrustStrip({ reviewsUrl }: { reviewsUrl?: string }) {
  const strip = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(1);
  const [phase, setPhase] = useState<"idle" | "pending" | "running" | "done">("idle");

  useEffect(() => {
    const element = strip.current;
    if (!element) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let started = false;
    let observer: IntersectionObserver | undefined;

    const finish = () => {
      started = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      setProgress(1);
      setPhase("done");
    };
    const run = () => {
      if (started) return;
      started = true;
      observer?.disconnect();
      setPhase("running");
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = Math.min((now - start) / 1200, 1);
        setProgress(1 - Math.pow(1 - elapsed, 3));
        if (elapsed < 1) frame = requestAnimationFrame(tick);
        else setPhase("done");
      };
      frame = requestAnimationFrame(tick);
    };
    const onMotionChange = () => {
      if (media.matches) finish();
    };

    if (media.matches) finish();
    else {
      setProgress(0);
      setPhase("pending");
      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) run();
        }, { threshold: 0.25 });
        observer.observe(element);
      } else run();
    }
    media.addEventListener("change", onMotionChange);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      media.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <section ref={strip} className={styles.strip} data-phase={phase} aria-label="Pixely Careers at a glance">
      {stats.map((stat, index) => {
        const content = (
          <>
            <strong className={styles.number} aria-label={`${stat.value.toLocaleString("en-US")}${stat.suffix}`}>
              <span aria-hidden="true">{Math.round(stat.value * progress).toLocaleString("en-US")}{stat.suffix}</span>
            </strong>
            <span className={styles.label}>{stat.label}</span>
            {index === 1 && (
              <span className={styles.reviews}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.64.77-1.64 1.56V12h2.79l-.45 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
                </svg>
                80 reviews
                <svg className={styles.external} width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M4 12 12 4M4 4h8v8" />
                </svg>
              </span>
            )}
          </>
        );
        return index === 1 && reviewsUrl ? (
          <a key={stat.label} className={styles.item} href={reviewsUrl} target="_blank" rel="noopener noreferrer">
            {content}
          </a>
        ) : <div key={stat.label} className={styles.item}>{content}</div>;
      })}
    </section>
  );
}
