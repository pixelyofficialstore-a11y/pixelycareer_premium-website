"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { FACEBOOK_REVIEWS_URL } from "@/lib/site";
import base from "./HomeTestimonials.module.css";
import styles from "./PkReviews.module.css";

type Shot = { src: string; w: number; h: number; alt: string };

/** The nine approved screenshots in public/reviews/pk, in the agreed order. */
const SHOTS: Shot[] = [
  { src: "/reviews/pk/01.png", w: 1152, h: 885, alt: "Client review: interview call from Huawei" },
  { src: "/reviews/pk/02.png", w: 1154, h: 865, alt: "Client review: selected as Assistant Director Admin" },
  { src: "/reviews/pk/03.png", w: 1200, h: 866, alt: "Client review: new job in 15 days" },
  { src: "/reviews/pk/04.png", w: 1158, h: 675, alt: "Client review from Muhammad Asif on Facebook" },
  { src: "/reviews/pk/05.png", w: 1144, h: 807, alt: "Client review from Hina M on Facebook" },
  { src: "/reviews/pk/06.png", w: 1102, h: 654, alt: "Client review from Maria Khan on Facebook" },
  { src: "/reviews/pk/07.png", w: 1158, h: 512, alt: "Client review from Rajpoot Zada on Facebook" },
  { src: "/reviews/pk/08.png", w: 1158, h: 461, alt: "Client review from M Honey on Facebook" },
  { src: "/reviews/pk/09.png", w: 1159, h: 459, alt: "Client review from Heather Bates on Facebook" },
];

/** pk homepage: masonry of real screenshots (3 columns on desktop, swipe carousel on mobile) with a lightbox. */
export default function PkReviews() {
  const viewer = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Shot | null>(null);
  const show = (s: Shot) => {
    setOpen(s);
    if (!viewer.current?.open) viewer.current?.showModal();
  };
  // Round robin into 3 columns so the first row reads 01, 02, 03. On mobile the columns dissolve and `order` restores 01 to 09.
  const cols = [0, 1, 2].map((c) => SHOTS.map((s, i) => ({ s, i })).filter(({ i }) => i % 3 === c));

  return (
    <section id="testimonials" className={base.section} aria-labelledby="testimonials-title">
      <div className={`wrap ${base.inner}`}>
        <header className={base.heading} data-reveal>
          <h2 id="testimonials-title" className={`h2 ${base.title}`}>Proof it <em>works.</em></h2>
          <p className={styles.sub}>Real messages and reviews from our clients.</p>
        </header>
        <ul className={styles.grid} aria-label="Client reviews">
          {cols.map((col, c) => (
            <li key={c} className={styles.col}>
              <ul className={styles.colList}>
                {col.map(({ s, i }) => (
                  <li key={s.src} className={styles.item} style={{ order: i }}>
                    <button type="button" className={styles.card} onClick={() => show(s)} aria-label={`${s.alt}. Open full screenshot`} data-cta={`pk-reviews-open-${i + 1}`}>
                      <Image src={s.src} alt={s.alt} width={s.w} height={s.h} sizes="(max-width: 767px) 84vw, (max-width: 1023px) 45vw, 380px" loading="lazy" />
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className={base.allReviews}>
          <a href={FACEBOOK_REVIEWS_URL} target="_blank" rel="noopener noreferrer" data-cta="home-testimonials-facebook">See all reviews on Facebook <span aria-hidden="true">→</span></a>
        </p>
      </div>
      <dialog ref={viewer} className={base.viewer} aria-label="Full review screenshot" onClose={() => setOpen(null)}
        onClick={(e) => { if (e.target === viewer.current) viewer.current?.close(); }}>
        {open && <>
          <button className={base.close} type="button" aria-label="Close review screenshot" onClick={() => viewer.current?.close()}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
          <Image src={open.src} alt={open.alt} width={open.w} height={open.h} sizes="94vw" />
        </>}
      </dialog>
    </section>
  );
}
