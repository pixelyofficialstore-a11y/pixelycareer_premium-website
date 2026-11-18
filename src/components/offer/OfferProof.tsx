"use client";
/** /offer proof: Facebook review cards in a swipe carousel with dots. Quotes are real Facebook reviews. */
import { useEffect, useRef, useState } from "react";
import { FACEBOOK_REVIEWS_URL } from "@/lib/site";
import "./landing.css";

const REVIEWS = [
  { name: "Hina M", quote: "I would award 10 star rating to Pixely Careers. They did an outstanding job by structuring my CV according to the job market standards... Great job!" },
  { name: "Subhan Khan", quote: "I got several interview calls, and finally I got the job." },
  { name: "Saddam Khan", quote: "They have a deep understanding of today's recruitment systems. My CV now looks professional and ATS friendly, and they optimized my LinkedIn brilliantly." },
  { name: "Husnain Atta Gujjar", quote: "They don't just make a CV, they actually improve your whole profile." },
];

const I = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;

export function OfferProof() {
  const track = useRef<HTMLUListElement>(null);
  const [at, setAt] = useState(0);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const on = () => {
      const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 1;
      setAt(Math.min(REVIEWS.length - 1, Math.round(el.scrollLeft / (w + parseFloat(getComputedStyle(el).columnGap || "14")))));
    };
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, []);
  const go = (i: number) => {
    const el = track.current;
    const li = el?.children[i] as HTMLElement | undefined;
    if (el && li) el.scrollTo({ left: li.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };
  return (
    <section className="ol-proof" aria-labelledby="ol-proof-title">
      <div className="wrap ol-proof-box">
        <h2 id="ol-proof-title" className="h2 ol-title">Proof it <em>works.</em></h2>
        <p className="ol-proof-sub">Real reviews from our Facebook page</p>
        <ul ref={track} className="ol-car" aria-label="Facebook reviews">
          {REVIEWS.map((r) => (
            <li key={r.name} className="ol-car-slide">
              <figure className="ol-fbpost">
                <figcaption><span className="ol-av" aria-hidden="true">{r.name[0]}</span><span><b>{r.name}</b><i aria-hidden="true"> › </i>Pixely Careers PK</span></figcaption>
                <blockquote>{r.quote}</blockquote>
                <div className="ol-fbacts" aria-hidden="true">
                  <I d="M7 10v11H4V10zM7 10l4-7c1.5 0 2.5 1 2.2 2.6L12.6 9H19a2 2 0 0 1 2 2.3l-1.3 7.5A2.5 2.5 0 0 1 17.2 21H7" />
                  <I d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5A8.5 8.5 0 1 1 21 12z" />
                  <I d="M14 5l7 7-7 7v-4c-5 0-8 1.5-11 5 1-5 4-10 11-11z" />
                </div>
              </figure>
            </li>
          ))}
        </ul>
        <div className="ol-dots">
          {REVIEWS.map((r, i) => <button key={r.name} type="button" className={i === at ? "ol-dot-on" : ""} aria-label={`Show review ${i + 1}`} aria-current={i === at} onClick={() => go(i)} />)}
        </div>
        <p className="ol-fb"><a href={FACEBOOK_REVIEWS_URL} target="_blank" rel="noopener noreferrer" data-cta="offer-proof-facebook">See all reviews on Facebook <span aria-hidden="true">→</span></a></p>
      </div>
    </section>
  );
}
