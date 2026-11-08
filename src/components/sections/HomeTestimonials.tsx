"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Testimonial } from "@/lib/home-content";
import styles from "./HomeTestimonials.module.css";

function ReviewScreenshot({ item, onOpen, clone = false }: { item: Testimonial; onOpen: (item: Testimonial) => void; clone?: boolean }) {
  if (item.screenshot) {
    return (
      <button className={styles.media} type="button" onClick={() => onOpen(item)}
        aria-label="Open full review screenshot" tabIndex={clone ? -1 : 0} data-cta={clone ? undefined : `home-testimonials-proof-${item.id}`}>
        <Image src={item.screenshot} alt={item.screenshotAlt || `Original ${item.source === "whatsapp" ? "WhatsApp" : "Facebook"} review from ${item.name}`}
          fill sizes="(max-width: 767px) 88vw, (max-width: 1023px) 46vw, 30vw" draggable={false} />
        <span className={styles.expand} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 4h6v6M20 4l-8 8M10 20H4v-6M4 20l8-8" /></svg>
        </span>
      </button>
    );
  }
  return (
    <div className={`${styles.media} ${styles.placeholder}`} role="img" aria-label="Review screenshot placeholder">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m3 17 5-5 4 4 3-3 6 6" />
      </svg>
      <span>Review screenshot</span>
      <small>4:3</small>
    </div>
  );
}

function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const track = useRef<HTMLDivElement>(null);
  const group = useRef<HTMLUListElement>(null);
  const viewer = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const [duration, setDuration] = useState(30);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const content = group.current;
    if (!content) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(media.matches);
    const syncVisibility = () => setPageVisible(!document.hidden);
    const inViewObserver = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    inViewObserver.observe(content);
    const resizeObserver = new ResizeObserver(([entry]) => {
      setDuration(Math.max(10, entry.contentRect.width / 45));
    });
    resizeObserver.observe(content);
    syncMotion();
    syncVisibility();
    media.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      inViewObserver.disconnect();
      resizeObserver.disconnect();
      media.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  const playing = !paused && !hovered && !focused && !touching && inView && pageVisible && !reducedMotion;

  const openScreenshot = (item: Testimonial) => {
    setSelected(item);
    if (!viewer.current?.open) viewer.current?.showModal();
  };

  const move = useCallback((direction: -1 | 1) => {
    const element = track.current;
    const firstGroup = group.current;
    const animation = element?.getAnimations()[0];
    if (!element || !firstGroup || !animation || !items.length) return;
    const cycleDuration = Number(animation.effect?.getTiming().duration);
    if (!Number.isFinite(cycleDuration) || cycleDuration <= 0) return;
    const cardStep = firstGroup.offsetWidth / items.length;
    const delta = cycleDuration * cardStep / firstGroup.offsetWidth * direction;
    const currentTime = typeof animation.currentTime === "number" ? animation.currentTime : 0;
    animation.currentTime = ((currentTime + delta) % cycleDuration + cycleDuration) % cycleDuration;
  }, [items.length]);

  if (!items.length) return null;
  return (
    <div className={styles.carousel} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className={styles.viewport} onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
        onTouchStart={() => setTouching(true)} onTouchEnd={() => setTouching(false)} onTouchCancel={() => setTouching(false)}>
        <div ref={track} className={styles.track} style={{
          "--review-duration": `${duration}s`,
          "--review-play-state": playing ? "running" : "paused",
        } as CSSProperties}>
          <ul ref={group} className={styles.group} aria-label="Customer review screenshots">
            {items.map((item) => (
              <li key={item.id} className={styles.slide}><ReviewScreenshot item={item} onOpen={openScreenshot} /></li>
            ))}
          </ul>
          <ul className={styles.group} aria-hidden="true" inert>
            {items.map((item) => (
              <li key={`copy-${item.id}`} className={styles.slide}><ReviewScreenshot item={item} onOpen={openScreenshot} clone /></li>
            ))}
          </ul>
        </div>
      </div>
      {items.length > 1 && <nav className={styles.navigation} aria-label="Review carousel controls">
        <button className={`${styles.arrow} ${styles.previous}`} type="button" aria-label="Move carousel backward" onClick={() => move(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        {!reducedMotion && <button className={styles.arrow} type="button" aria-label={paused ? "Play review carousel" : "Pause review carousel"} aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {paused ? <path d="m8 5 11 7-11 7V5Z" /> : <path d="M7 5h3v14H7zm7 0h3v14h-3z" />}
          </svg>
        </button>}
        <button className={`${styles.arrow} ${styles.next}`} type="button" aria-label="Move carousel forward" onClick={() => move(1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </nav>}
      <dialog ref={viewer} className={styles.viewer} aria-label="Full review screenshot"
        onClose={() => setSelected(null)}
        onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); viewer.current?.close(); } }}
        onClick={(event) => { if (event.target === viewer.current) viewer.current?.close(); }}>
        {selected?.screenshot && <>
          <button className={styles.close} type="button" aria-label="Close review screenshot" onClick={() => viewer.current?.close()}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
          <Image src={selected.screenshot} alt={selected.screenshotAlt || "Full customer review screenshot"}
            width={1200} height={900} sizes="94vw" priority />
        </>}
      </dialog>
    </div>
  );
}

export default function HomeTestimonials({ items }: { items: Testimonial[] }) {
  const root = useRef<HTMLElement>(null);
  const [motion, setMotion] = useState<"idle" | "pending" | "entered">("idle");
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const enter = () => { setMotion("entered"); observer?.disconnect(); };
    const onChange = () => { if (media.matches) enter(); };
    if (media.matches || !("IntersectionObserver" in window)) enter();
    else {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) enter();
      }, { threshold: 0.1 });
      observer.observe(element);
      setMotion("pending");
    }
    media.addEventListener("change", onChange);
    return () => { observer?.disconnect(); media.removeEventListener("change", onChange); };
  }, [items.length]);
  if (!items.length) return null;
  const testimonials = items.slice(0, 6);
  return (
    <section ref={root} id="testimonials" className={styles.section} data-motion={motion} aria-labelledby="testimonials-title">
      <div className={`wrap ${styles.inner}`}>
        <header className={styles.heading}>
          <h2 id="testimonials-title" className={`h1 ${styles.title}`}>Real Feedback. <em>Real Experiences.</em></h2>
        </header>
        <TestimonialCarousel items={testimonials} />
      </div>
    </section>
  );
}
