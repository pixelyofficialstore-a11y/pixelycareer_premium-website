"use client";

import { useEffect, useRef } from "react";

const steps = [
  { number: "01", title: "Tell us your goal.", text: "Send your current CV and target role on WhatsApp or the order form." },
  { number: "02", title: "We write it.", text: "A real writer builds your CV for your role and country." },
  { number: "03", title: "You review.", text: "Ask for changes. Revisions are included in every package." },
  { number: "04", title: "You apply with confidence.", text: "PDF and Word files, ready to send." },
];

export default function ProcessTimeline() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      line.classList.add("is-drawn");
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        line.classList.add("is-drawn");
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(line);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="process-track">
      <div ref={lineRef} className="process-line" aria-hidden="true" />
      <ol>
        {steps.map((step) => (
          <li key={step.number} data-reveal>
            <span className="step-marker">{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
      <style jsx>{`
        .process-track { position: relative; margin-top: 52px; }
        .process-track ol {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 28px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .process-track li { position: relative; padding-top: 30px; }
        .process-line {
          position: absolute;
          z-index: 0;
          top: 13px;
          left: 13px;
          right: calc(25% - 35px);
          height: 2px;
          background: #dbe5ff;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 1.15s cubic-bezier(.2,.75,.2,1);
        }
        .process-line::before {
          position: absolute;
          inset: 0;
          content: "";
          background: #0048ff;
        }
        .process-line.is-drawn { transform: scaleX(1); }
        .step-marker {
          position: absolute;
          top: 0;
          left: 0;
          display: grid;
          width: 28px;
          height: 28px;
          place-items: center;
          border: 2px solid #0048ff;
          border-radius: 50%;
          background: #fff;
          color: #0048ff;
          font-size: 9px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }
        h3 { margin: 13px 0 8px; color: #010c28; font-size: 18px; line-height: 1.25; font-weight: 700; }
        p { max-width: 245px; margin: 0; color: #526078; font-size: 15px; line-height: 1.65; }
        @media (max-width: 767px) {
          .process-track { margin-top: 38px; }
          .process-track ol { grid-template-columns: 1fr; gap: 0; padding-left: 0; }
          .process-track li { min-height: 130px; padding: 3px 0 25px 52px; }
          .process-line {
            top: 14px;
            left: 13px;
            right: auto;
            width: 2px;
            height: calc(100% - 130px);
            transform: scaleY(0);
            transform-origin: top center;
          }
          .process-line.is-drawn { transform: scaleY(1); }
          .step-marker { left: 0; }
          h3 { margin: 0 0 7px; font-size: 18px; }
          p { max-width: 32ch; font-size: 15px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .process-line { transition: none; }
        }
      `}</style>
    </div>
  );
}
