"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 1800, suffix: "+", label: "Clients served" },
  { value: 3, suffix: "+", label: "Years of experience" },
  { value: 5, suffix: "", label: "Markets covered" },
  { value: 20, suffix: "+", label: "Partner agencies" },
];

export default function ProofStrip() {
  const [count, setCount] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = stripRef.current;
    if (!element) return;
    let frame = 0;
    let started = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const run = () => {
      if (started) return;
      started = true;
      if (reduced) {
        setCount(1);
        return;
      }
      const begin = performance.now();
      const duration = 1150;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - begin) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(eased);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        run();
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={stripRef} className="proof-strip">
      {stats.map((stat, index) => (
        <div className="proof-stat" key={stat.label}>
          <strong aria-label={`${stat.value}${stat.suffix}`}>{Math.round(stat.value * count).toLocaleString("en-US")}{stat.suffix}</strong>
          <span>{stat.label}</span>
          {index < stats.length - 1 && <i aria-hidden="true" />}
        </div>
      ))}
      <style jsx>{`
        .proof-strip {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          overflow: hidden;
          border: 1px solid #e3eaf6;
          border-radius: 24px;
          background: #f6f8fc;
        }
        .proof-stat {
          position: relative;
          display: flex;
          min-height: 124px;
          flex-direction: column;
          justify-content: center;
          padding: 18px 26px;
        }
        .proof-stat strong {
          color: #010c28;
          font-size: clamp(27px, 3vw, 38px);
          line-height: 1;
          letter-spacing: -.055em;
          font-weight: 750;
          font-variant-numeric: tabular-nums;
        }
        .proof-stat span {
          margin-top: 11px;
          color: #59677d;
          font-size: 13px;
          white-space: nowrap;
        }
        .proof-stat i {
          position: absolute;
          top: 26px;
          right: 0;
          bottom: 26px;
          width: 1px;
          background: #dce4f0;
        }
        @media (max-width: 767px) {
          .proof-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); border-radius: 20px; }
          .proof-stat { min-height: 105px; padding: 17px 18px; }
          .proof-stat:nth-child(odd) { border-right: 1px solid #dce4f0; }
          .proof-stat:nth-child(-n+2) { border-bottom: 1px solid #dce4f0; }
          .proof-stat i { display: none; }
          .proof-stat span { font-size: 11px; }
        }
        @media (max-width: 360px) {
          .proof-stat { padding: 14px 11px; }
          .proof-stat span { font-size: 10px; letter-spacing: -.02em; }
        }
      `}</style>
    </div>
  );
}
