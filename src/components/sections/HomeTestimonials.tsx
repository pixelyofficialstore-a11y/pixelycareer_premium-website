"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Testimonial } from "@/lib/home-content";
import { FACEBOOK_REVIEWS_URL } from "@/lib/site";
import styles from "./HomeTestimonials.module.css";

function FacebookIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.64.77-1.64 1.56V12h2.79l-.45 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" /></svg>;
}

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
  if (!items.length) return null;
  const select = (page: number) => {
    const list = row.current;
    if (!list || !items.length) return;
    const targetIndex = Math.max(0, Math.min(page, pageCount - 1)) * perView;
    const first = list.children[0] as HTMLElement;
    const card = list.children[targetIndex] as HTMLElement;
    if (!first || !card) return;
    list.scrollTo({ left: card.offsetLeft - first.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return (
    <div className={styles.carousel}>
      <ul className={styles.row} ref={row} tabIndex={0} aria-label="Customer testimonials" onKeyDown={(event) => {
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
            <article className={styles.card}>
              <ReviewScreenshot item={item} />
              <div className={styles.body}>
              {item.tag && <span className={styles.tag}>{item.tag}</span>}
              <blockquote className={styles.quote}>{item.quote}</blockquote>
              <div className={styles.byline}>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.source} aria-label={`Shared via ${item.source === "whatsapp" ? "WhatsApp" : "Facebook"}`}>
                  {item.source === "whatsapp" ? "WhatsApp" : <><FacebookIcon /><span>Facebook</span></>}
                </span>
              </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
      {items.length > 1 && <nav className={styles.navigation} aria-label="Testimonial navigation">
        <button className={styles.arrow} type="button" aria-label="Previous reviews" onClick={() => select(active - 1)} disabled={active === 0}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <div className={styles.dots} role="group" aria-label="Choose a review page">
          {Array.from({ length: pageCount }, (_, index) => <button key={index} type="button" aria-label={`Show review page ${index + 1}`} aria-pressed={active === index} onClick={() => select(index)}><span /></button>)}
        </div>
        <span className={styles.position} aria-live="polite">Page {active + 1} of {pageCount}</span>
        <button className={styles.arrow} type="button" aria-label="Next reviews" onClick={() => select(active + 1)} disabled={active === pageCount - 1}>
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
          <p>See what customers say about their experience with Pixely Careers.</p>
        </header>
        <TestimonialCarousel items={testimonials} />
        <div className={styles.summary}>
          <span><span className={styles.summaryMark} aria-hidden="true">↗</span> 78 Facebook reviews</span>
          <a href={FACEBOOK_REVIEWS_URL} target="_blank" rel="noopener noreferrer" data-cta="home-testimonials-facebook">Read all reviews <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  );
}
