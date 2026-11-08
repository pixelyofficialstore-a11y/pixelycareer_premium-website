"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Testimonial } from "@/lib/home-content";
import styles from "./HomeTestimonials.module.css";

function ReviewScreenshot({ item }: { item: Testimonial }) {
  if (item.screenshot) {
    return (
      <a className={styles.media} href={item.screenshot} target="_blank" rel="noopener noreferrer"
        aria-label={`View the complete review screenshot from ${item.name}`} data-cta={`home-testimonials-proof-${item.id}`}>
        <Image src={item.screenshot} alt={item.screenshotAlt || `Original ${item.source === "whatsapp" ? "WhatsApp" : "Facebook"} review from ${item.name}`}
          fill sizes="(max-width: 767px) 88vw, (max-width: 1023px) 46vw, 30vw" />
        <span className={styles.expand} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 4h6v6M20 4l-8 8M10 20H4v-6M4 20l8-8" /></svg>
        </span>
      </a>
    );
  }
  return (
    <div className={`${styles.media} ${styles.placeholder}`} role="img" aria-label={`Review screenshot placeholder for ${item.name}`}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m3 17 5-5 4 4 3-3 6 6" />
      </svg>
      <span>Review screenshot</span>
      <small>4:3</small>
    </div>
  );
}

function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const row = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [perView, setPerView] = useState(3);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const list = row.current;
    if (!list) return;
    const update = () => {
      const count = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
      setPerView(count);
      setActive(0);
      list.scrollTo({ left: 0, behavior: "instant" });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const pageCount = Math.ceil(items.length / perView);
  const select = useCallback((page: number) => {
    const list = row.current;
    if (!list || !pageCount) return;
    const targetIndex = ((page % pageCount + pageCount) % pageCount) * perView;
    const first = list.children[0] as HTMLElement;
    const card = list.children[targetIndex] as HTMLElement;
    if (!first || !card) return;
    list.scrollTo({ left: card.offsetLeft - first.offsetLeft,
      behavior: page >= pageCount || page < 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [pageCount, perView]);

  useEffect(() => {
    const list = row.current;
    if (!list) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(media.matches);
    const syncVisibility = () => setPageVisible(!document.hidden);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.5 });
    observer.observe(list);
    syncMotion();
    syncVisibility();
    media.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  const playing = !paused && !hovered && !focused && !touching && inView && pageVisible && !reducedMotion;
  useEffect(() => {
    if (!playing || pageCount < 2) return;
    const timer = window.setTimeout(() => select(active + 1), 4000);
    return () => window.clearTimeout(timer);
  }, [active, playing, pageCount, select]);

  if (!items.length) return null;
  return (
    <div className={styles.carousel} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <ul className={styles.row} ref={row} tabIndex={0} aria-label="Customer review screenshots"
        data-active-page={active} data-autoplay={playing ? "playing" : "paused"}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
        onTouchStart={() => setTouching(true)} onTouchEnd={() => setTouching(false)} onTouchCancel={() => setTouching(false)}
        onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          select(active + 1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          select(active - 1);
        } else if (event.key === "Home") {
          event.preventDefault();
          select(0);
        } else if (event.key === "End") {
          event.preventDefault();
          select(pageCount - 1);
        }
      }} onScroll={() => {
        const list = row.current;
        if (!list) return;
        const first = list.children[0] as HTMLElement;
        if (!first) return;
        const firstVisible = Array.from(list.children).reduce((best, card, index) =>
          Math.abs((card as HTMLElement).offsetLeft - first.offsetLeft - list.scrollLeft) <
          Math.abs((list.children[best] as HTMLElement).offsetLeft - first.offsetLeft - list.scrollLeft) ? index : best, 0);
        setActive(Math.min(Math.floor(firstVisible / perView), pageCount - 1));
      }}>
        {items.map((item, index) => (
          <li key={item.id} className={styles.reveal} style={{ "--delay": `${index * 70}ms` } as CSSProperties}>
            <ReviewScreenshot item={item} />
          </li>
        ))}
      </ul>
      {items.length > 1 && <nav className={styles.navigation} aria-label="Testimonial navigation">
        <button className={styles.arrow} type="button" aria-label="Previous reviews" onClick={() => select(active - 1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        {!reducedMotion && <button className={styles.arrow} type="button" aria-label={paused ? "Play review carousel" : "Pause review carousel"} aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {paused ? <path d="m8 5 11 7-11 7V5Z" /> : <path d="M7 5h3v14H7zm7 0h3v14h-3z" />}
          </svg>
        </button>}
        <button className={styles.arrow} type="button" aria-label="Next reviews" onClick={() => select(active + 1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </nav>}
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
          <h2 id="testimonials-title">Real Feedback. <em>Real Experiences.</em></h2>
        </header>
        <TestimonialCarousel items={testimonials} />
      </div>
    </section>
  );
}
