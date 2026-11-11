"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HomeTrustStrip.module.css";

const DEFAULT_STATS = [
  { value: 1800, suffix: "+", label: "Professionals helped", short: "Professionals helped" },
  { value: 100, suffix: "%", label: "Recommended on Facebook", short: "Recommended" },
  { value: 5, suffix: "x", label: "More interview calls", short: "More interview calls" },
] as { value: number; suffix: string; label: string; short: string }[];

export default function HomeTrustStrip({ reviewsUrl, stats = DEFAULT_STATS }: { reviewsUrl?: string; stats?: { value: number; suffix: string; label: string; short: string }[] }) {
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
    let fallback = 0;

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
      let start = 0;
      const tick = (now: number) => {
        if (!start) start = now;
        const elapsed = Math.min((now - start) / 1600, 1);
        setProgress(1 - Math.pow(1 - elapsed, 3));
        if (elapsed < 1) frame = requestAnimationFrame(tick);
        else setPhase("done");
      };
      frame = requestAnimationFrame(tick);
      // Background tabs pause animation frames; never leave the count short of the final number.
      window.setTimeout(() => { cancelAnimationFrame(frame); setProgress(1); setPhase("done"); }, 2400);
    };
    const onMotionChange = () => {
      if (media.matches) finish();
    };

    if (media.matches) finish();
    else {
      setProgress(0);
      setPhase("pending");
      if ("IntersectionObserver" in window) {
        // Threshold 0, and scrolling straight past it counts too, so a fast scroll never leaves it at zero.
        observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) run();
          else if (entry.boundingClientRect.top < 0) finish();
        }, { threshold: 0.25 });
        observer.observe(element);
      } else run();
    }
    const onVisible = () => { if (!document.hidden && started) finish(); };
    const onScroll = () => {
      if (started) return;
      const r = element.getBoundingClientRect();
      if (r.bottom < 0) finish();
      else if (r.top < window.innerHeight * 0.9) run();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisible);
    media.addEventListener("change", onMotionChange);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("scroll", onScroll);
      media.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <section ref={strip} className={styles.strip} style={{ "--n": stats.length } as React.CSSProperties} data-phase={phase} aria-label="Pixely Careers at a glance">
      {stats.map((stat, index) => {
        const content = (
          <>
            <strong className={styles.number} aria-label={`${stat.value.toLocaleString("en-US")}${stat.suffix}`}>
              <span aria-hidden="true">{Math.round(stat.value * progress).toLocaleString("en-US")}<span className={styles.suffix}>{stat.suffix}</span></span>
            </strong>
            <span className={styles.label}><span className={styles.full}>{stat.label}</span><span className={styles.short}>{stat.short}</span>
            {index === 1 && reviewsUrl && (
              <a className={styles.reviews} href={reviewsUrl} target="_blank" rel="noopener noreferrer" aria-label="See reviews on Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.64.77-1.64 1.56V12h2.79l-.45 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
                </svg>
              </a>
            )}
            </span>
          </>
        );
        return <div key={stat.label} className={styles.item}>{content}</div>;
      })}
    </section>
  );
}
