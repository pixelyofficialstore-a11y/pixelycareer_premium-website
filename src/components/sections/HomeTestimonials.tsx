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
        aria-label={`View the full review screenshot from ${item.name}`} data-cta={`home-testimonials-proof-${item.id}`}>
        <Image src={item.screenshot} alt={item.screenshotAlt || `Original ${item.source === "whatsapp" ? "WhatsApp" : "Facebook"} review from ${item.name}`}
          fill sizes="(max-width: 767px) 85vw, (max-width: 1279px) 30vw, 380px" />
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

function TestimonialRow({ items, kind, delay }: { items: Testimonial[]; kind: "result" | "review"; delay: number }) {
  const row = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  if (!items.length) return null;
  const select = (index: number) => {
    const list = row.current;
    if (!list) return;
    const first = list.children[0] as HTMLElement;
    const card = list.children[index] as HTMLElement;
    list.scrollTo({ left: card.offsetLeft - first.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return (
    <div className={styles.rowGroup} data-testimonial-row={kind}>
      <ul className={styles.row} ref={row} aria-label={kind === "result" ? "Client results" : "Client reviews"} onScroll={() => {
        const list = row.current;
        if (!list) return;
        const first = list.children[0] as HTMLElement;
        setActive(Array.from(list.children).reduce((best, card, index) =>
          Math.abs((card as HTMLElement).offsetLeft - first.offsetLeft - list.scrollLeft) <
          Math.abs((list.children[best] as HTMLElement).offsetLeft - first.offsetLeft - list.scrollLeft) ? index : best, 0));
      }}>
        {items.map((item, index) => (
          <li key={item.id} className={styles.reveal} style={{ "--delay": `${(delay + index) * 80}ms` } as CSSProperties}>
            <article className={`${styles.card} ${kind === "result" ? styles.result : styles.review}`}>
              <ReviewScreenshot item={item} />
              <div className={styles.body}>
              {kind === "result" ? <span className={styles.tag}>{item.tag}</span> : (
                <span className={styles.stars} role="img" aria-label="5 stars">
                  {Array.from({ length: 5 }, (_, star) => <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.5 2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5Z" /></svg>)}
                </span>
              )}
              <blockquote className={styles.quote}>{kind === "result" && <span className={styles.quoteMark} aria-hidden="true">“</span>}{item.quote}{kind === "result" && <span className={styles.quoteMark} aria-hidden="true">”</span>}</blockquote>
              <div className={styles.byline}>
                <div><span className={styles.name}>{item.name}</span>{kind === "result" && item.location && <span className={styles.location}>{item.location}</span>}</div>
                {kind === "result" ? <span className={styles.source}>via WhatsApp</span> : <span className={styles.facebook} role="img" aria-label="Facebook"><FacebookIcon /></span>}
              </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
      {items.length > 1 && <div className={styles.dots} aria-label={kind === "result" ? "Choose a result" : "Choose a review"}>
        {items.map((item, index) => <button key={item.id} type="button" aria-label={`Show ${kind} ${index + 1}`} aria-pressed={active === index} onClick={() => select(index)}><span /></button>)}
      </div>}
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
  const results = items.filter((item) => item.type === "result").slice(0, 3);
  const reviews = items.filter((item) => item.type === "review").slice(0, 3);
  return (
    <section ref={root} id="testimonials" className={styles.section} data-motion={motion} aria-labelledby="testimonials-title">
      <div className={`wrap ${styles.inner}`}>
        <header className={styles.heading}>
          <h2 id="testimonials-title">Real people. <em>Real results.</em></h2>
          <p>What our clients told us after applying.</p>
        </header>
        <div className={styles.rows}>
          <TestimonialRow items={results} kind="result" delay={0} />
          <TestimonialRow items={reviews} kind="review" delay={results.length} />
        </div>
        <div className={styles.summary}>
          <span><span className={styles.summaryStar} aria-hidden="true">★</span> 100% recommended on Facebook <span aria-hidden="true">·</span> 78 reviews</span>
          <a href={FACEBOOK_REVIEWS_URL} target="_blank" rel="noopener noreferrer" data-cta="home-testimonials-facebook">Read all reviews <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  );
}
