"use client";

import { useRef, useState } from "react";
import { MARKETS, formatPrice } from "@/config/markets";
import styles from "./HomeProcess.module.css";

const steps = [
  { title: "Choose", line: "Pick your package." },
  { title: "Order", line: "Fill a short form and send your CV." },
  { title: "Draft", line: "Your first draft in 2 days." },
  { title: "Refine", line: "Request changes, then get your files." },
];

export default function HomeProcess() {
  const row = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const visuals = [
    <div key="choose" className="mini mini-pack"><span>ATS Career</span><b>{formatPrice(MARKETS.us, MARKETS.us.prices["ats-career"])}</b></div>,
    <div key="order" className={styles.formPreview}>
      <span>Name</span><i /><span>WhatsApp</span><i />
      <span className={styles.formButton}>Place order</span>
    </div>,
    <div key="draft" className="mini mini-draft"><em>Draft 1</em><i /><i /><i /><i /></div>,
    <div key="refine" className="mini mini-done"><b>✓</b><span>PDF + Word</span></div>,
  ];
  const select = (index: number) => {
    const list = row.current;
    const card = list?.children[index] as HTMLElement | undefined;
    if (!list || !card) return;
    list.scrollTo({ left: card.offsetLeft - (list.children[0] as HTMLElement).offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  return (
    <section id="process" className={styles.section} aria-labelledby="process-title">
      <div className={`wrap ${styles.inner}`}>
        <h2 id="process-title" className={styles.title}>Four steps. <em>Zero guesswork.</em></h2>
        <ol ref={row} className={styles.cards} onScroll={() => {
          const list = row.current;
          if (!list) return;
          const first = list.children[0] as HTMLElement;
          const nearest = Array.from(list.children).reduce((best, card, index) =>
            Math.abs((card as HTMLElement).offsetLeft - first.offsetLeft - list.scrollLeft) <
            Math.abs((list.children[best] as HTMLElement).offsetLeft - first.offsetLeft - list.scrollLeft) ? index : best, 0);
          setActive(nearest);
        }}>
          {steps.map((step, index) => (
            <li key={step.title} className={styles.card}>
              <div className={`step-visual ${styles.visual}`} aria-hidden="true">{visuals[index]}</div>
              <span className={styles.number} aria-hidden="true">0{index + 1}</span>
              <h3>{step.title}</h3><p>{step.line}</p>
            </li>
          ))}
        </ol>
        <div className={styles.dots} aria-label="Choose a step">
          {steps.map((step, index) => <button key={step.title} type="button" aria-label={`Show step ${index + 1}: ${step.title}`} aria-pressed={active === index} onClick={() => select(index)}><span /></button>)}
        </div>
      </div>
    </section>
  );
}
