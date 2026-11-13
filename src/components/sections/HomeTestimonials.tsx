"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Testimonial } from "@/lib/home-content";
import { FACEBOOK_REVIEWS_URL } from "@/lib/site";
import styles from "./HomeTestimonials.module.css";

type FacebookCard = { kind: "facebook"; id: string; quote: string; name: string };
type Card = { kind: "screenshot"; id: string; item: Testimonial } | FacebookCard;

const FACEBOOK_REVIEWS: FacebookCard[] = [
  { kind: "facebook", id: "fb-subhan", quote: "I got several interview calls, and finally I got the job.", name: "Subhan Khan" },
  { kind: "facebook", id: "fb-saddam", quote: "They have a deep understanding of today's recruitment systems. My CV now looks professional and ATS friendly, and they optimized my LinkedIn brilliantly.", name: "Saddam Khan" },
  { kind: "facebook", id: "fb-husnain", quote: "They don't just make a CV, they actually improve your whole profile.", name: "Husnain Atta Gujjar" },
];

const FacebookIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.64.77-1.64 1.56V12h2.79l-.45 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
  </svg>
);

/** WhatsApp screenshots and Facebook cards, taking turns. */
function mix(items: Testimonial[]): Card[] {
  const shots: Card[] = items.filter((i) => i.source === "whatsapp" && i.screenshot).map((item) => ({ kind: "screenshot", id: item.id, item }));
  const fb: Card[] = items.filter((i) => i.source === "facebook" && i.screenshot).map((item) => ({ kind: "screenshot", id: item.id, item }));
  const out: Card[] = [];
  while (shots.length || fb.length) {
    if (shots.length) out.push(shots.shift()!);
    if (fb.length) out.push(fb.shift()!);
  }
  return out;
}

function CardView({ card, onOpen, clone }: { card: Card; onOpen: (item: Testimonial) => void; clone?: boolean }) {
  if (card.kind === "facebook") {
    return (
      <figure className={styles.fbCard}>
        <span className={styles.stars} aria-label="5 out of 5 stars">★★★★★</span>
        <blockquote>{card.quote}</blockquote>
        <figcaption><span>{card.name}</span><span className={styles.fbMark}><FacebookIcon /></span></figcaption>
      </figure>
    );
  }
  const { item } = card;
  return (
    <button className={styles.media} type="button" onClick={() => onOpen(item)} aria-label="Open full review screenshot"
      tabIndex={clone ? -1 : 0} data-cta={clone ? undefined : `home-testimonials-proof-${item.id}`}>
      <Image src={item.screenshot!} alt={item.screenshotAlt || `Original WhatsApp review from ${item.name}`} fill sizes="(max-width: 767px) 320px, 440px" draggable={false} />
    </button>
  );
}

/** ordered: keep the given order instead of alternating sources. */
export default function HomeTestimonials({ items, facebookLink = false, ordered = false }: { items: Testimonial[]; facebookLink?: boolean; ordered?: boolean }) {
  const group = useRef<HTMLUListElement>(null);
  const viewer = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const [duration, setDuration] = useState(60);
  const [held, setHeld] = useState(false);
  const cards: Card[] = ordered ? items.filter((i) => i.screenshot).map((item) => ({ kind: "screenshot", id: item.id, item })) : mix(items);

  useEffect(() => {
    const content = group.current;
    if (!content) return;
    // About 40px a second, whatever the width.
    const ro = new ResizeObserver(([entry]) => setDuration(Math.max(20, entry.contentRect.width / 40)));
    ro.observe(content);
    return () => ro.disconnect();
  }, []);

  const open = (item: Testimonial) => {
    setSelected(item);
    if (!viewer.current?.open) viewer.current?.showModal();
  };

  if (!cards.length) return null;
  return (
    <section id="testimonials" className={styles.section} aria-labelledby="testimonials-title">
      <div className={`wrap ${styles.inner}`}>
        <header className={styles.heading} data-reveal>
          <h2 id="testimonials-title" className={`h2 ${styles.title}`}>Proof it <em>works.</em></h2>
        </header>
      </div>
      <div className={styles.viewport} onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)}
        onTouchStart={() => setHeld(true)} onTouchEnd={() => setHeld(false)} onTouchCancel={() => setHeld(false)}>
        <div className={styles.track} style={{ "--review-duration": `${duration}s`, "--review-play-state": held ? "paused" : "running" } as CSSProperties}>
          <ul ref={group} className={styles.group} aria-label="Customer reviews">
            {cards.map((card) => <li key={card.id} className={styles.slide}><CardView card={card} onOpen={open} /></li>)}
          </ul>
          <ul className={styles.group} aria-hidden="true" inert>
            {cards.map((card) => <li key={`copy-${card.id}`} className={styles.slide}><CardView card={card} onOpen={open} clone /></li>)}
          </ul>
        </div>
      </div>
      {facebookLink && <p className={styles.allReviews}>
        <a href={FACEBOOK_REVIEWS_URL} target="_blank" rel="noopener noreferrer" data-cta="home-testimonials-facebook">See all reviews on Facebook <span aria-hidden="true">→</span></a>
      </p>}
      <dialog ref={viewer} className={styles.viewer} aria-label="Full review screenshot" onClose={() => setSelected(null)}
        onClick={(event) => { if (event.target === viewer.current) viewer.current?.close(); }}>
        {selected?.screenshot && <>
          <button className={styles.close} type="button" aria-label="Close review screenshot" onClick={() => viewer.current?.close()}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
          <Image src={selected.screenshot} alt={selected.screenshotAlt || "Full customer review screenshot"} width={1200} height={900} sizes="94vw" priority />
        </>}
      </dialog>
    </section>
  );
}
