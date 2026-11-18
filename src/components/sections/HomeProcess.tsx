"use client";

import { useRef, useEffect } from "react";
import { MARKETS, formatPrice, type MarketKey } from "@/config/markets";
import { useGsapSection } from "@/lib/motion";
import { onlineOpen, onlinePrice } from "@/config/offers";
import styles from "./HomeProcess.module.css";

/** Four steps. Pakistan pays by JazzCash, Easypaisa or bank and gets a manual check; the other markets get a payment link. */
const STEPS = {
  link: [
    { title: "Choose", line: "Pick your package." },
    { title: "Order", line: "Share your details and any extras." },
    { title: "Pay", line: "Get a secure payment link on WhatsApp or email." },
    { title: "Draft", line: "First draft in 2 days. Revisions until you’re satisfied." },
  ],
  pk: [
    { title: "Choose your package", line: "Pay on our website, or order on WhatsApp." },
    { title: "Meet your CV expert", line: "A professional CV writer is assigned to you on WhatsApp. Share your details and target job." },
    { title: "We write your documents", line: "Your expert builds your CV and documents around your goals and sends the first draft." },
    { title: "Review and receive", line: "Ask for any changes. Once you’re happy, you get the final files in PDF and Word." },
  ],
};

/* One S curve per step, drawn in a 200 by 1000 box that stretches to the list's height. */
const CURVE = "M100 0 C 170 125, 30 125, 100 250 S 170 375, 100 500 S 30 625, 100 750 S 170 875, 100 1000";

/** A line draws down the page as you scroll; each step slides in from its side when the line reaches it. */
export default function HomeProcess({ marketKey = "us", sale = false }: { sale?: boolean; marketKey?: MarketKey }) {
  const m = MARKETS[marketKey];
  const root = useRef<HTMLElement>(null);
  const pk = marketKey === "pk";
  const steps = pk ? STEPS.pk : STEPS.link;
  const choose = <div key="choose" className="mini mini-pack"><span>ATS Career</span><b>{pk ? `Rs ${(sale && onlineOpen() ? onlinePrice(m.prices["ats-career"]) : m.prices["ats-career"]).toLocaleString("en-US")}` : formatPrice(m, m.prices["ats-career"])}</b></div>;
  const draft = <div key="draft" className="mini mini-draft"><em>Draft 1</em><i /><i /><i /><i /></div>;
  const visuals = pk ? [
    choose,
    <div key="expert" className={styles.chat}>
      <div className={styles.chatHead}>
        <span className={styles.avatar}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="4.2" /><path d="M3.8 21c.6-4.4 4-7 8.2-7s7.6 2.6 8.2 7z" /></svg></span>
        <span><b>CV expert</b><small>online</small></span>
      </div>
      <p className={styles.inMsg}>Hi! Which job are you applying for?</p>
      <p className={styles.outMsg}>Marketing manager</p>
    </div>,
    draft,
    <div key="done" className="mini mini-done"><b className={styles.verified}>✓</b><span>Word + PDF</span></div>,
  ] : [
    choose,
    <div key="order" className={styles.formPreview}>
      <span>Name</span><i /><span>WhatsApp</span><i />
      <span className={styles.formButton}>Place order</span>
    </div>,
    <div key="pay" className={styles.payBubble}>
      <span>Your payment link</span>
      <span className={styles.payButton}>Pay now</span>
    </div>,
    draft,
  ];

  // The S curve is drawn through the centre of every step dot, from just under the H2 to step 04, whatever the card heights.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fit = () => {
      const track = el.querySelector<HTMLElement>("[data-track]");
      if (!track) return;
      const top = track.getBoundingClientRect().top;
      const ys = [...el.querySelectorAll<HTMLElement>("[data-dot]")].map((d) => { const r = d.getBoundingClientRect(); return Math.round(r.top + r.height / 2 - top); });
      const end = ys[ys.length - 1];
      if (!end) return;
      // One gentle wave from dot 01 to dot 04 (A = 40px) that bends toward the card side of every step:
      // left at 01, right at 02, left at 03, right at 04. Sampled at 80 points and joined with Catmull-Rom curves.
      // Each dot sits on the wave at its own height, so the line runs through the dot centres and 04 sits beside its card.
      const y0 = ys[0], H = end - y0, A = 40, turns = ys.length - 1;
      const wave = (y: number) => -A * Math.cos((turns * Math.PI * (y - y0)) / H);
      const pts = Array.from({ length: 80 }, (_, n) => { const y = y0 + (H * n) / 79; return [100 + wave(y), y]; });
      let d = `M${pts[0][0]} ${pts[0][1]}`;
      for (let n = 0; n < pts.length - 1; n++) {
        const p0 = pts[Math.max(n - 1, 0)], p1 = pts[n], p2 = pts[n + 1], p3 = pts[Math.min(n + 2, pts.length - 1)];
        d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
      }
      const wide = window.innerWidth >= 1024;
      // On desktop the cards are taller than their rows, so card 04 hangs below the list: keep that room inside the
      // section, so the navy padding shows in full under the last card. Layout values only (the cards slide in with transforms).
      const steps = el.querySelectorAll<HTMLElement>("li");
      const last = steps[steps.length - 1];
      const lastCard = last?.querySelector<HTMLElement>("[data-card]");
      const hang = wide && last && lastCard ? Math.max(0, lastCard.offsetTop + lastCard.offsetHeight - last.offsetHeight) : 0;
      track.style.marginBottom = hang ? `${Math.ceil(hang)}px` : "";
      el.querySelectorAll<HTMLElement>("[data-dot]").forEach((dot, n) => { dot.style.marginLeft = wide ? `${wave(ys[n])}px` : ""; });
      const curve = el.querySelector<SVGSVGElement>("[data-curve]");
      const rail = el.querySelector<SVGSVGElement>("[data-rail]");
      if (curve) { curve.style.height = `${end}px`; curve.setAttribute("viewBox", `0 0 200 ${end}`); curve.querySelectorAll("path").forEach((p) => p.setAttribute("d", d)); }
      // Mobile rail starts at the first dot, so nothing sticks out above circle 01.
      if (rail) { rail.style.top = `${ys[0]}px`; rail.style.height = `${Math.max(0, end - ys[0])}px`; }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [marketKey]);

  useGsapSection(root, ({ reduced }, { gsap, ScrollTrigger }) => {
    const el = root.current;
    if (!el || reduced) return;
    el.dataset.motion = "on";
    // The line follows the scroll directly; its tip sits on the 65% line of the screen.
    const paths = el.querySelectorAll<SVGPathElement>("[data-draw]");
    paths.forEach((p) => { p.setAttribute("pathLength", "1000"); gsap.set(p, { strokeDasharray: 1000, strokeDashoffset: 1000 }); });
    const list = el.querySelector("ol");
    gsap.to(paths, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: list, start: "top 65%", end: "bottom 65%", scrub: true, invalidateOnRefresh: true } });
    // Each card has its own timed tween: it glides in from its side as the line arrives at its dot, and glides back out on the way up.
    el.querySelectorAll<HTMLElement>("li").forEach((step, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const wide = window.innerWidth >= 1024;
      gsap.fromTo(step.querySelector("[data-card]"),
        { autoAlpha: 0, x: wide ? side * 60 : 0, y: wide ? 0 : 32, rotate: wide ? side * 6 : 0 },
        { autoAlpha: 1, x: 0, y: 0, rotate: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: step.querySelector("[data-dot]"), start: "center 82%", toggleActions: "play none none reverse",
            onEnter: () => step.setAttribute("data-reached", ""), onLeaveBack: () => step.removeAttribute("data-reached") } });
    });
    let frame = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => ScrollTrigger.refresh()); });
    ro.observe(document.body);
    return () => { ro.disconnect(); cancelAnimationFrame(frame); delete el.dataset.motion; el.querySelectorAll("li").forEach((li) => li.removeAttribute("data-reached")); };
  });

  return (
    <div id="how-it-works">
    <section ref={root} id="process" className={styles.section} aria-labelledby="process-title">
      <div className={`wrap ${styles.inner}`}>
        <h2 id="process-title" className={styles.title} data-anchor>From order to interview. <em>Four steps.</em></h2>
        <div className={styles.track} data-track>
          <svg className={styles.curve} data-curve viewBox="0 0 200 1000" preserveAspectRatio="none" aria-hidden="true">
            <path d={CURVE} className={styles.curveBase} />
            <path d={CURVE} className={styles.curveGlow} data-draw />
            <path d={CURVE} className={styles.curveLine} data-draw />
          </svg>
          <svg className={styles.rail} data-rail viewBox="0 0 2 1000" preserveAspectRatio="none" aria-hidden="true">
            <path d="M1 0 V1000" className={styles.curveBase} />
            <path d="M1 0 V1000" className={styles.curveLine} data-draw />
          </svg>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.dot} data-dot aria-hidden="true">0{index + 1}</span>
                <div className={styles.card} data-card>
                  <div className={`step-visual ${styles.visual}`} aria-hidden="true">{visuals[index]}</div>
                  <div>
                    <span className={styles.number} aria-hidden="true">0{index + 1}</span>
                    <h3>{step.title}</h3><p>{step.line}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
    </div>
  );
}
