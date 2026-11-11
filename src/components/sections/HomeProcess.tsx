"use client";

import { useRef, useEffect } from "react";
import { MARKETS, formatPrice, type MarketKey } from "@/config/markets";
import { useGsapSection } from "@/lib/motion";
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
    { title: "Choose", line: "Pick your package." },
    { title: "Order and pay", line: "Fill your details and pay by JazzCash, Easypaisa or bank." },
    { title: "Confirm", line: "We verify your payment and message you." },
    { title: "Draft", line: "First draft in 2 days. Revisions until you’re satisfied." },
  ],
};

/* One S curve per step, drawn in a 200 by 1000 box that stretches to the list's height. */
const CURVE = "M100 0 C 170 125, 30 125, 100 250 S 170 375, 100 500 S 30 625, 100 750 S 170 875, 100 1000";

/** A line draws down the page as you scroll; each step slides in from its side when the line reaches it. */
export default function HomeProcess({ marketKey = "us" }: { marketKey?: MarketKey }) {
  const m = MARKETS[marketKey];
  const root = useRef<HTMLElement>(null);
  const pk = marketKey === "pk";
  const steps = pk ? STEPS.pk : STEPS.link;
  const choose = <div key="choose" className="mini mini-pack"><span>ATS Career</span><b>{formatPrice(m, m.prices["ats-career"])}</b></div>;
  const draft = <div key="draft" className="mini mini-draft"><em>Draft 1</em><i /><i /><i /><i /></div>;
  const visuals = pk ? [
    choose,
    <div key="order" className={styles.formPreview}>
      <span>Name</span><i />
      <span className={styles.payChips}><b>JazzCash</b><b>Easypaisa</b><b>Bank</b></span>
      <span className={styles.upload}>Upload screenshot</span>
    </div>,
    <div key="confirm" className="mini mini-done"><b className={styles.verified}>✓</b><span>Payment verified</span></div>,
    draft,
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
      // One full sine wave from dot 01 to dot 04 (A = 48px), sampled at 80 points and joined with Catmull-Rom curves.
      // Each dot sits on the wave at its own height, so the line runs through the dot centres.
      const y0 = ys[0], H = end - y0, A = 48;
      const wave = (y: number) => A * Math.sin((2 * Math.PI * (y - y0)) / H);
      const pts = Array.from({ length: 80 }, (_, n) => { const y = y0 + (H * n) / 79; return [100 + wave(y), y]; });
      let d = `M${pts[0][0]} ${pts[0][1]}`;
      for (let n = 0; n < pts.length - 1; n++) {
        const p0 = pts[Math.max(n - 1, 0)], p1 = pts[n], p2 = pts[n + 1], p3 = pts[Math.min(n + 2, pts.length - 1)];
        d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
      }
      const wide = window.innerWidth >= 1024;
      el.querySelectorAll<HTMLElement>("[data-dot]").forEach((dot, n) => { dot.style.marginLeft = wide ? `${wave(ys[n])}px` : ""; });
      const curve = el.querySelector<SVGSVGElement>("[data-curve]");
      const rail = el.querySelector<SVGSVGElement>("[data-rail]");
      if (curve) { curve.style.height = `${end}px`; curve.setAttribute("viewBox", `0 0 200 ${end}`); curve.querySelectorAll("path").forEach((p) => p.setAttribute("d", d)); }
      if (rail) rail.style.height = `${end}px`;
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
          scrollTrigger: { trigger: step.querySelector("[data-dot]"), start: "center 70%", toggleActions: "play none none reverse",
            onEnter: () => step.setAttribute("data-reached", ""), onLeaveBack: () => step.removeAttribute("data-reached") } });
    });
    let frame = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => ScrollTrigger.refresh()); });
    ro.observe(document.body);
    return () => { ro.disconnect(); cancelAnimationFrame(frame); delete el.dataset.motion; el.querySelectorAll("li").forEach((li) => li.removeAttribute("data-reached")); };
  });

  return (
    <section ref={root} id="process" className={styles.section} aria-labelledby="process-title">
      <div className={`wrap ${styles.inner}`}>
        <h2 id="process-title" className={styles.title}>From order to interview. <em>Four steps.</em></h2>
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
  );
}
