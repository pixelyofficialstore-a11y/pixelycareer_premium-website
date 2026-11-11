"use client";

import { useEffect, useRef, useState } from "react";
import HomeTrustStrip from "@/components/sections/HomeTrustStrip";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AgencyEnquiryForm from "./AgencyEnquiryForm";
import AgencyFAQ from "./AgencyFAQ";
import PartnersCarousel from "./PartnersCarousel";
import type { AgencySample } from "./types";
import "./partners.css";

const STATS = [
  { value: 20, suffix: "+", label: "Partner agencies", short: "Partner agencies" },
  { value: 1800, suffix: "+", label: "CVs delivered", short: "CVs delivered" },
  { value: 3, suffix: "+", label: "Years in overseas recruitment", short: "Years in recruitment" },
];
const WHO = [
  { icon: "team", title: "Recruitment agencies", line: "One CV standard for every candidate" },
  { icon: "growth", title: "OEPs", line: "Gulf and Europe ready CVs" },
  { icon: "document", title: "Career coaches", line: "Hand off the writing" },
  { icon: "team", title: "Employers and HR", line: "Uniform CVs for bulk hiring" },
  { icon: "document", title: "Training institutes", line: "CVs for every graduating batch" },
];
const PROCESS = [
  { title: "Send candidate details", line: "An old CV, form or notes on WhatsApp or email." },
  { title: "We write and optimize", line: "An ATS CV for the role and country, within 48 hours." },
  { title: "Review and brand check", line: "Word and PDF files with your agency header." },
  { title: "Deliver and place", line: "Send a polished CV to the employer." },
];
const AUDIENCES = [
  { label: "Recruitment agencies", text: "One consistent CV standard for every candidate you submit." },
  { label: "OEPs", text: "Gulf and Europe ready CVs for Pakistani workers going abroad." },
  { label: "Career and interview coaches", text: "Hand off the writing. Keep the coaching." },
  { label: "Employers and HR", text: "Clean, uniform CVs for internal transfers and bulk hiring." },
  { label: "Training institutes", text: "Job ready CVs for every graduating batch." },
];

const WHY = [
  { title: "No hiring needed.", text: "Scale up or down with your candidate flow.", icon: "team" },
  { title: "48 hour turnaround.", text: "Full batches without delays.", icon: "growth" },
  { title: "Every market covered.", text: "Gulf, UK, Europe and North America formats.", icon: "document" },
];

const MODELS = {
  "White label": {
    title: "Your brand. Our engine.",
    points: ["Your logo, colors and templates", "You own the candidate and the price", "Set your own margin on every order"],
    best: "Best for: full brand control and higher margins",
  },
  Referral: {
    title: "Zero work. Pure commission.",
    points: ["Share your partner link", "We handle writing, revisions and support", "Commission paid on every completed order"],
    best: "Best for: hands off extra income",
  },
} as const;

function ArrowIcon({ direction = "right" }: { direction?: "right" | "down" }) {
  return (
    <svg className="agency-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {direction === "down"
        ? <path d="M10 3v13m0 0 5-5m-5 5-5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M3 10h13m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

function FeatureIcon({ type }: { type: string }) {
  if (type === "growth") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 18V6m0 12h16M7 15l4-4 3 2 5-6M15 7h4v4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  if (type === "team") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1.5a5.5 5.5 0 0111 0V19zm11-13a3 3 0 010 5.8m2 2.2a4.5 4.5 0 014 4.5V19h-3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M7 3.5h7l4 4V20a1 1 0 01-1 1H7a1 1 0 01-1-1V4.5a1 1 0 011-1z" strokeLinejoin="round" /><path d="M14 4v4h4M9 12h6M9 16h6" strokeLinecap="round" /></svg>;
}

function CvMock({ role, mini = false }: { role: string; mini?: boolean }) {
  return (
    <div className={`agency-mock-cv${mini ? " agency-mock-cv-mini" : ""}`}>
      <div className="agency-mock-head"><i /><span><b>{role === "Staff Nurse" ? "Mariam Khan" : role === "Electrical Technician" ? "Adeel Raza" : "Hina Siddiqui"}</b><small>{role}</small></span></div>
      <div className="agency-mock-contact">Lahore, Pakistan&nbsp; · &nbsp;name@email.com</div>
      <strong className="agency-mock-label">PROFILE</strong>
      <i className="agency-mock-line w-full" /><i className="agency-mock-line w-80" /><i className="agency-mock-line w-60" />
      <strong className="agency-mock-label">EXPERIENCE</strong>
      <b className="agency-mock-subline">{role === "Staff Nurse" ? "Clinical Nurse · 2020 to present" : role === "Electrical Technician" ? "Electrical Technician · 2019 to present" : "Accounts Officer · 2021 to present"}</b>
      <i className="agency-mock-line w-full" /><i className="agency-mock-line w-80" />
      <strong className="agency-mock-label">EDUCATION</strong>
      <i className="agency-mock-line w-80" /><i className="agency-mock-line w-60" />
    </div>
  );
}

function HeroStack() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const visualRef = useRef<HTMLDivElement>(null);
  const scrollLayerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!visualRef.current || !scrollLayerRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(min-width: 1024px)").matches) return;
    const context = gsap.context(() => {
      gsap.fromTo(scrollLayerRef.current, { rotateY: -14, scaleX: 0.92 }, {
        rotateY: -6,
        scaleX: 1.06,
        ease: "none",
        transformOrigin: "center center",
        scrollTrigger: { trigger: visualRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, visualRef);
    return () => context.revert();
  }, []);
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(min-width: 1024px)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((event.clientY - rect.top) / rect.height - 0.5) * -8,
      y: ((event.clientX - rect.left) / rect.width - 0.5) * 8,
    });
  };
  return (
    <div ref={visualRef} className="agency-visual-wrap" aria-label="Three examples of Pixely Careers CV formats" onPointerMove={onMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
      <div className="agency-hero-orbit agency-hero-orbit-one" />
      <div className="agency-hero-orbit agency-hero-orbit-two" />
      <div ref={scrollLayerRef} className="agency-cv-scroll-layer">
        <div className="agency-cv-stack" style={{ "--tilt-x": `${tilt.x}deg`, "--tilt-y": `${tilt.y}deg` } as CSSProperties}>
          <div className="agency-cv-card agency-cv-card-1"><img src="/formats/pk/5.webp" alt="Gulf format CV with navy sidebar" /></div>
          <div className="agency-cv-card agency-cv-card-2"><img src="/formats/pk/6.webp" alt="CV with a navy header" /></div>
          <div className="agency-cv-card agency-cv-card-3 agency-candidate-cv" role="img" aria-label="Maria Santos, Staff Nurse ICU, Manila, Philippines, target Qatar. Phone plus 63 917 000 0000. Email maria.santos@email.com.">
            <header>
              <strong>Maria Santos</strong>
              <span>Staff Nurse (ICU)</span>
              <small>Manila, Philippines · Target: Qatar</small>
              <small>+63 917 000 0000 · maria.santos@email.com</small>
            </header>
            <section><b>PROFESSIONAL SUMMARY</b><p>Compassionate registered nurse with intensive care experience and a focus on safe, patient centered care.</p></section>
            <section><b>PROFESSIONAL EXPERIENCE</b><h4>Staff Nurse · Intensive Care Unit</h4><p>Monitored patient condition and supported coordinated care in a fast paced clinical setting.</p><i /><i /><i /></section>
            <section><b>CORE SKILLS</b><p>Critical care · Patient monitoring · Care planning · Clinical documentation</p></section>
            <section><b>EDUCATION</b><h4>Bachelor of Science in Nursing</h4><p>Registered Nurse</p></section>
          </div>
        </div>
      </div>
      <span className="agency-logo-placeholder">Your logo here</span>
      <div className="agency-float-chip agency-float-chip-one"><span className="agency-chip-dot" />Delivered under your brand</div>
      <div className="agency-float-chip agency-float-chip-three"><span className="agency-chip-dot" />Full batches in 48 hours</div>
    </div>
  );
}

function ProofBand() {
  const root = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStarted(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
const values = [{ value: 20, suffix: "+", label: "Partner agencies" }, { value: 1800, suffix: "+", label: "CVs delivered" }, { value: 3, suffix: "+", label: "Years in overseas recruitment" }];
  return (
    <section className="agency-proof" aria-label="Partnership experience" ref={root} data-agency-reveal>
      <div className="agency-wrap agency-proof-grid">
        {values.map((item) => <div className="agency-proof-item" key={item.label}>
          <strong className="agency-proof-number">{started ? <CountUp to={item.value} /> : "0"}{item.suffix}</strong>
          <span className="agency-proof-label">{item.label}</span>
        </div>)}
      </div>
    </section>
  );
}

function CountUp({ to }: { to: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / 1200, 1);
      setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [to]);
  return <>{value.toLocaleString("en-US")}</>;
}

function WhySection() {
  return <section className="agency-section agency-why" aria-labelledby="agency-why-title" data-agency-reveal>
    <div className="agency-wrap">
      <h2 className="agency-title" id="agency-why-title">Why agencies <em>partner with us.</em></h2>
      <div className="agency-why-grid">{WHY.map((item, index) => <article className="agency-why-card" data-agency-reveal key={item.title} style={{ "--reveal-delay": `${index * 80}ms` } as CSSProperties}>
        <span className="agency-line-icon"><FeatureIcon type={item.icon} /></span>
        <h3>{item.title}</h3><p>{item.text}</p>
      </article>)}</div>
    </div>
  </section>;
}

function WhoItsFor() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? AUDIENCES.length - 1
      : (active + (event.key === "ArrowRight" ? 1 : -1) + AUDIENCES.length) % AUDIENCES.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };
  return <section className="agency-section agency-audience-section" aria-labelledby="agency-audience-title" data-agency-reveal>
    <div className="agency-wrap">
      <h2 className="agency-title" id="agency-audience-title">Who it&apos;s <em>for.</em></h2>
      <div className="agency-audience-tabs" role="tablist" aria-label="Who we work with">
        {AUDIENCES.map((item, index) => <button
          key={item.label}
          ref={(element) => { tabRefs.current[index] = element; }}
          id={`audience-tab-${index}`}
          type="button"
          role="tab"
          aria-selected={active === index}
          aria-controls="agency-audience-panel"
          tabIndex={active === index ? 0 : -1}
          onClick={() => setActive(index)}
          onKeyDown={onKeyDown}
        >{item.label}</button>)}
      </div>
      <div className="agency-audience-panel" id="agency-audience-panel" role="tabpanel" aria-labelledby={`audience-tab-${active}`} key={active}>
        <span className="agency-audience-mark"><FeatureIcon type="document" /></span>
        <div><h3>{AUDIENCES[active].label}</h3><p>{AUDIENCES[active].text}</p></div>
      </div>
    </div>
  </section>;
}

function ModelFlow({ model }: { model: keyof typeof MODELS }) {
  const isWhiteLabel = model === "White label";
  const steps: Array<{ title: string; subtitle?: string; badge?: string; kind?: string; connector?: string }> = isWhiteLabel
    ? [
      { title: "Candidate", connector: "sends details" },
      { title: "Your Agency", badge: "YOU", kind: "agency", connector: "forwards" },
      { title: "Pixely", badge: "BEHIND THE SCENES", kind: "behind", connector: "returns CV" },
      { title: "Your Agency", subtitle: "branded CV", kind: "agency" },
    ]
    : [
      { title: "Your Agency", kind: "agency", connector: "shares link" },
      { title: "Pixely Careers", subtitle: "handles CV and client", connector: "completed order" },
      { title: "Earn Commission", subtitle: "per order", kind: "commission" },
    ];
  return <div className={`agency-flow agency-flow-${isWhiteLabel ? "white" : "referral"}`} aria-label={`${model} workflow`}>
    {steps.map((step, index) => <div className="agency-flow-step" key={`${step.title}-${index}`}>
      <div className={`agency-flow-node${step.kind ? ` is-${step.kind}` : ""}`}>
        {step.badge && <b className="agency-flow-badge">{step.badge}</b>}
        <span>{step.title}</span>
        {step.subtitle && <small>{step.subtitle}</small>}
      </div>
      {index < steps.length - 1 && <div className="agency-flow-connector">
        {step.connector && <span className="agency-flow-note">{step.connector}</span>}
        <svg className="agency-flow-arrow" viewBox="0 0 12 24" fill="none" aria-hidden="true"><path d="M6 1v21m0 0 5-5m-5 5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>}
    </div>)}
  </div>;
}

function WaysSection({ onBecomePartner }: { onBecomePartner: (model: keyof typeof MODELS) => void }) {
  const [model, setModel] = useState<keyof typeof MODELS>("White label");
  const modelTabs = useRef<Array<HTMLButtonElement | null>>([]);
  const data = MODELS[model];
  const onModelKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next = event.key === "Home" || event.key === "ArrowLeft" ? "White label" : "Referral";
    setModel(next);
    modelTabs.current[next === "White label" ? 0 : 1]?.focus();
  };
  return <section className="agency-section agency-ways" aria-labelledby="agency-ways-title" data-agency-reveal>
    <div className="agency-wrap">
      <div className="agency-ways-heading">
        <h2 className="agency-title" id="agency-ways-title">Two ways <em>to work.</em></h2>
        <div className="agency-model-switch" role="tablist" aria-label="Choose a partnership model">
          {(Object.keys(MODELS) as Array<keyof typeof MODELS>).map((item, index) => <button id={`model-tab-${index}`} key={item} ref={(element) => { modelTabs.current[index] = element; }} type="button" role="tab" aria-selected={model === item} aria-controls="agency-model-panel" tabIndex={model === item ? 0 : -1} onClick={() => setModel(item)} onKeyDown={onModelKeyDown}>{item}</button>)}
        </div>
      </div>
      <div className="agency-model-panel" id="agency-model-panel" role="tabpanel" aria-labelledby={`model-tab-${model === "White label" ? 0 : 1}`} key={model}>
        <div className="agency-model-copy">
          <h3>{data.title}</h3>
          <ul>{data.points.map((point) => <li key={point}><span className="agency-check" aria-hidden="true">✓</span>{point}</li>)}</ul>
          <p className="agency-model-best"><b>Best for:</b> {data.best.replace(/^Best for: /, "")}</p>
          <a className="btn btn-primary agency-model-cta" href="#agency-enquiry" data-cta={`agency-become-partner-${model === "White label" ? "white-label" : "referral"}`} onClick={() => onBecomePartner(model)}>Book a 15 minute call →<ArrowIcon /></a>
        </div>
        <div className="agency-model-flow-panel"><ModelFlow model={model} /></div>
      </div>
    </div>
  </section>;
}

function ProcessVisual({ number }: { number: number }) {
  if (number === 0) return <div className="agency-process-visual agency-chat-visual"><span className="agency-chat-label">NEW REQUEST</span><div className="agency-chat-bubble">New candidate: Staff Nurse, KSA <svg viewBox="0 0 24 24" fill="none" aria-label="attachment"><path d="m8 12 5.8-5.8a3 3 0 014.2 4.2l-7.4 7.4a5 5 0 01-7.1-7.1l7.1-7.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></div><span className="agency-chat-time">10:42 am</span></div>;
  if (number === 1) return <div className="agency-process-visual agency-draft-visual"><div className="agency-draft-paper"><span className="agency-draft-tag">Draft · 48h</span><CvMock role="Staff Nurse" mini /></div></div>;
  if (number === 2) return <div className="agency-process-visual agency-comment-visual"><div className="agency-comment-card"><span className="agency-comment-avatar">PC</span><div><b>Review note</b><p>Add ICU experience</p></div><span className="agency-comment-check">✓</span></div><div className="agency-comment-rule" /></div>;
  return <div className="agency-process-visual agency-files-visual"><span className="agency-file-chip"><b>PDF</b><small>Ready to share</small></span><span className="agency-file-chip"><b>Word</b><small>Editable file</small></span></div>;
}

function AgencyProcess() {
  const steps = [
    ["01", "Send candidate details", "Share an old CV, form or notes on WhatsApp or email."],
    ["02", "We write and optimize", "An ATS ready CV targeted to the role and country, within 48 hours."],
    ["03", "Review and brand check", "You get Word and PDF files with your agency header."],
    ["04", "Deliver and place", "Send a polished CV to the employer and close placements faster."],
  ];
  const sectionRef = useRef<HTMLElement>(null);
  const desktopPathRef = useRef<SVGPathElement>(null);
  const mobilePathRef = useRef<SVGPathElement>(null);
  const desktopMarkerRef = useRef<SVGRectElement>(null);
  const mobileMarkerRef = useRef<SVGRectElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
    const section = sectionRef.current;
    const desktopPath = desktopPathRef.current;
    const mobilePath = mobilePathRef.current;
    const desktopMarker = desktopMarkerRef.current;
    const mobileMarker = mobileMarkerRef.current;
    if (!section || !desktopPath || !mobilePath || !desktopMarker || !mobileMarker) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setPathFinal = (path: SVGPathElement, marker: SVGRectElement) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: reduced ? 0 : length });
      gsap.set(marker, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: reduced ? 1 : 0, end: reduced ? 1 : 0 } });
    };
    setPathFinal(desktopPath, desktopMarker);
    setPathFinal(mobilePath, mobileMarker);
    if (reduced) return;

    const context = gsap.context(() => {
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const path = mobile ? mobilePath : desktopPath;
      const marker = mobile ? mobileMarker : desktopMarker;
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: mobile ? "top 80%" : "top 75%",
          end: "bottom 25%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      timeline
        .to(path, { strokeDashoffset: 0, ease: "none" }, 0)
        .to(marker, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: false }, ease: "none" }, 0);
    }, section);
    return () => context.revert();
  }, []);

  return <section ref={sectionRef} className="agency-section agency-process" aria-labelledby="agency-process-title">
    <div className="agency-process-sticky">
      <div className="agency-wrap agency-process-inner">
        <div className="agency-process-heading" data-agency-reveal><h2 className="agency-title" id="agency-process-title">A straightforward <em>process.</em></h2></div>
        <div className="agency-process-track">
          <svg className="agency-s-curve" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
            <path className="agency-s-curve-base agency-desktop-path" d="M0 60 C250 60 250 240 500 240 S750 60 1000 60" />
            <path ref={desktopPathRef} className="agency-s-curve-line agency-desktop-path" d="M0 60 C250 60 250 240 500 240 S750 60 1000 60" />
            <rect ref={desktopMarkerRef} className="agency-track-marker agency-desktop-path" x="-6" y="-6" width="12" height="12" rx="2" />
            <path className="agency-s-curve-base agency-mobile-path" d="M500 0 C500 100 500 200 500 300" />
            <path ref={mobilePathRef} className="agency-s-curve-line agency-mobile-path" d="M500 0 C500 100 500 200 500 300" />
            <rect ref={mobileMarkerRef} className="agency-track-marker agency-mobile-path" x="-6" y="-6" width="12" height="12" rx="2" />
          </svg>
          <ol className="agency-process-steps">{steps.map(([number, title, description], index) => <li className={`agency-process-step agency-process-step-${index + 1}`} key={number}>
            <div className="agency-process-copy"><span className="agency-step-number">{number}</span><h3>{title}</h3><p>{description}</p></div><ProcessVisual number={index} />
          </li>)}</ol>
        </div>
      </div>
    </div>
  </section>;
}

export default function PartnersPage({ samples }: { samples: AgencySample[] }) {
  const [preferredModel, setPreferredModel] = useState<{ model: keyof typeof MODELS; request: number } | null>(null);
  const chooseModelForEnquiry = (model: keyof typeof MODELS) => {
    setPreferredModel((current) => ({ model, request: (current?.request ?? 0) + 1 }));
  };
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(".agency-page [data-agency-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
    nodes.forEach((node) => {
      if (node.getBoundingClientRect().top <= window.innerHeight * 0.92) node.classList.add("is-visible");
      else { node.classList.add("agency-reveal-pending"); observer.observe(node); }
    });
    const steps = document.querySelector<HTMLElement>("[data-agency-steps]");
    const stepIo = steps ? new IntersectionObserver(([e]) => { if (e.isIntersecting) { steps.classList.add("play"); stepIo?.disconnect(); } }, { threshold: 0.3 }) : null;
    if (steps && stepIo) stepIo.observe(steps);
    return () => { observer.disconnect(); stepIo?.disconnect(); };
  }, []);
  return <div className="agency-page">
    <section className="agency-hero" aria-labelledby="agency-hero-title">
      <div className="agency-wrap agency-hero-grid">
        <div className="agency-hero-copy" data-agency-reveal>
          <h1 id="agency-hero-title"><span className="ag-line"><span>Your agency&apos;s</span></span> <em className="ag-line"><span>CV department.</span></em></h1>
          <p className="agency-hero-sub">A dependable outsourced CV and documentation team for recruitment agencies.</p>
          <div className="agency-hero-actions">
            <a className="btn btn-primary agency-hero-primary" href="#agency-enquiry" data-cta="agency-hero-call">Book a 15 minute call <ArrowIcon /></a>
            <a className="agency-quiet-link agency-outline-link" href="#samples" data-cta="agency-hero-samples">See sample work <ArrowIcon direction="down" /></a>
          </div>
        </div>
        <HeroStack />
      </div>
    </section>
    <div className="agency-stats"><HomeTrustStrip stats={STATS} /></div>
    <WhySection />
    <section className="agency-section agency-who" aria-labelledby="agency-who-title" data-agency-reveal>
      <div className="agency-wrap">
        <h2 className="agency-title" id="agency-who-title">Who it&apos;s <em>for.</em></h2>
        <div className="agency-tiles">
          {WHO.map((w) => <div key={w.title} className="agency-tile" data-ag-card><span className="ag-icon"><FeatureIcon type={w.icon} /></span><b>{w.title}</b><span>{w.line}</span></div>)}
        </div>
      </div>
    </section>
    <WaysSection onBecomePartner={chooseModelForEnquiry} />
    <section className="agency-section agency-samples" id="samples" aria-labelledby="agency-samples-title" data-agency-reveal>
      <div className="agency-wrap">
        <h2 className="agency-title" id="agency-samples-title">Every format your <em>candidates need.</em></h2>
        
        <PartnersCarousel samples={samples} />
        <p className="agency-sample-line">Want CVs in your agency template? <a href="#agency-enquiry" data-cta="agency-sample-pack" onClick={() => window.dispatchEvent(new Event("agency-sample-pack"))}>Request a sample pack →</a></p>
      </div>
    </section>
    <section className="agency-section agency-steps-section" aria-labelledby="agency-process-title">
      <div className="agency-wrap">
        <h2 className="agency-title" id="agency-process-title">A simple <em>process.</em></h2>
        <ol className="agency-steps" data-agency-steps>
          <span className="agency-steps-line" aria-hidden="true"><i /></span>
          {PROCESS.map((s, i) => <li key={s.title} style={{ "--i": i } as React.CSSProperties}><span className="agency-num">{String(i + 1).padStart(2, "0")}</span><div><b>{s.title}</b><p>{s.line}</p></div></li>)}
        </ol>
      </div>
    </section>
    <div className="agency-faq-reveal" data-agency-reveal><AgencyFAQ /></div>
    <section className="agency-section agency-final" id="agency-enquiry" aria-labelledby="agency-final-title" data-agency-reveal>
      <div className="agency-wrap agency-final-grid">
        <div className="agency-final-copy">
          <h2 className="agency-title" id="agency-final-title">Let&apos;s talk for <em>15 minutes.</em></h2>
          <p>No hard pitch. We&apos;ll send a partner rate card and a free test sample.</p>
        </div>
        <AgencyEnquiryForm preferredModel={preferredModel} />
      </div>
    </section>
  </div>;
}
