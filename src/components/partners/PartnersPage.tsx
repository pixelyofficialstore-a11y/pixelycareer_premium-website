"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AgencyEnquiryForm from "./AgencyEnquiryForm";
import AgencyFAQ from "./AgencyFAQ";
import PartnersCarousel from "./PartnersCarousel";
import type { AgencySample } from "./types";
import "./partners.css";

const AUDIENCES = [
  {
    label: "Recruitment agencies",
    line: "CVs for every candidate you place, under your name.",
    points: ["Gulf and European formats", "Bulk orders welcome", "Your template, your branding"],
    visual: "stack",
  },
  {
    label: "Overseas employment promoters",
    line: "Documents ready for overseas employers and visa files.",
    points: ["Country specific formats", "Fast turnaround for deployment", "Europass when needed"],
    visual: "destinations",
  },
  {
    label: "Career & interview coaches",
    line: "Give your clients a professional CV with your coaching.",
    points: ["White label delivery", "Interview guides available", "Referral commission option"],
    visual: "guide",
  },
  {
    label: "Employers & HR teams",
    line: "Consistent profiles for your staff and client submissions.",
    points: ["Standard CV format across your team", "Professional bios", "LinkedIn profiles"],
    visual: "lineup",
  },
  {
    label: "Training institutes",
    line: "Job ready CVs for your graduates.",
    points: ["CVs for graduating batches", "LinkedIn profiles", "Your institute's branding"],
    visual: "graduate",
  },
];

const WHY = [
  { title: "Stronger candidate CVs", text: "ATS-ready, recruiter-focused CVs for Gulf and European employers.", icon: "document" },
  { title: "A new income line", text: "You set your own price and keep the difference.", icon: "growth" },
  { title: "No team to hire", text: "We write, design and format everything.", icon: "team" },
];

const MODELS = {
  "White label": {
    title: "Under your agency's name",
    points: ["Your branding and templates", "You keep the candidate relationship", "We stay behind the scenes"],
    best: "Best for agencies that want control and extra margin.",
    flow: ["Candidate", "Your agency", "Pixely Careers", "Your agency", "Employer"],
  },
  Referral: {
    title: "Under the Pixely Careers name",
    points: ["Send interested candidates to us", "We handle everything directly", "You earn a commission on every order"],
    best: "Best for agencies that want zero effort.",
    flow: ["Your agency", "Refers the candidate", "Pixely Careers", "Candidate", "You earn a commission"],
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
          {[
            { name: "Gulf-format CV with navy sidebar", src: "/formats/pk/5.webp" },
            { name: "CV with a navy header", src: "/formats/pk/6.webp" },
            { name: "Clean ATS-friendly CV", src: "/cv/ae/good.webp" },
          ].map((sample, index) => (
            <div className={`agency-cv-card agency-cv-card-${index + 1}`} key={sample.src}>
              <img src={sample.src} alt={sample.name} />
            </div>
          ))}
        </div>
      </div>
      <span className="agency-logo-placeholder">Your agency logo</span>
      <div className="agency-float-chip agency-float-chip-one"><span className="agency-chip-dot" />24-hour first drafts</div>
      <div className="agency-float-chip agency-float-chip-two"><span className="agency-chip-spark" aria-hidden="true" />Your branding or ours</div>
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
  const values = [{ value: 20, suffix: "+", label: "partner agencies" }, { value: 1800, suffix: "+", label: "clients served" }, { value: 3, suffix: "+", label: "years of experience" }];
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

function AudienceVisual({ kind }: { kind: string }) {
  return (
    <div className={`agency-audience-art agency-art-${kind}`} aria-hidden="true">
      {kind === "destinations" ? <>
        <CvMock role="Staff Nurse" mini />
        <div className="agency-destination-list"><span>KSA</span><span>UAE</span><span>Qatar</span><span>Europe</span></div>
      </> : kind === "guide" ? <>
        <CvMock role="Accountant" mini />
        <div className="agency-guide-mini"><span className="agency-guide-icon"><FeatureIcon type="document" /></span><b>Interview guide</b><i /><i /><i /></div>
      </> : kind === "lineup" ? <>
        <CvMock role="Staff Nurse" mini /><CvMock role="Staff Nurse" mini /><CvMock role="Staff Nurse" mini />
      </> : <>
        <div className="agency-art-stack"><CvMock role={kind === "graduate" ? "Graduate profile" : "Staff Nurse"} mini /><CvMock role="Electrical Technician" mini /><CvMock role="Accountant" mini /></div>
        {kind === "stack" && <span className="agency-art-badge">Your agency</span>}
        {kind === "graduate" && <span className="agency-grad-badge"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m2 9 10-5 10 5-10 5L2 9Zm4 2v5c3.4 2.7 8.6 2.7 12 0v-5M22 9v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>}
      </>}
    </div>
  );
}

function WhoItsFor() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let next = active;
    if (event.key === "ArrowRight") next = (active + 1) % AUDIENCES.length;
    else if (event.key === "ArrowLeft") next = (active - 1 + AUDIENCES.length) % AUDIENCES.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = AUDIENCES.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };
  const audience = AUDIENCES[active];
  return (
    <section className="agency-section agency-audience-section" aria-labelledby="agency-audience-title" data-agency-reveal>
      <div className="agency-wrap">
        <p className="agency-kicker">Who it's for</p>
        <h2 className="agency-title" id="agency-audience-title">Built for teams that <em>work with candidates.</em></h2>
        <div className="agency-audience-tabs" role="tablist" aria-label="Partner team types">
          {AUDIENCES.map((item, index) => <button
            key={item.label}
            ref={(element) => { tabRefs.current[index] = element; }}
            className="agency-audience-tab"
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
          <div className="agency-audience-copy">
            <div className="agency-audience-mark"><FeatureIcon type={active === 0 ? "growth" : active === 1 ? "document" : active === 2 ? "team" : "document"} /></div>
            <h3>{audience.line}</h3>
            <ul>{audience.points.map((point) => <li key={point}><span className="agency-check" aria-hidden="true">✓</span>{point}</li>)}</ul>
          </div>
          <AudienceVisual kind={audience.visual} />
        </div>
      </div>
    </section>
  );
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

function ModelFlow({ model }: { model: keyof typeof MODELS }) {
  const isWhiteLabel = model === "White label";
  const steps = isWhiteLabel
    ? ["Candidate", "Your agency", "Pixely Careers", "Your agency", "Employer"]
    : ["Your agency", "Pixely Careers", "Candidate", "You earn a commission"];
  return <div className={`agency-flow agency-flow-${isWhiteLabel ? "white" : "referral"}`} aria-label={`${model} workflow`}>
    {steps.map((step, index) => <div className="agency-flow-step" key={`${step}-${index}`}>
      <div className={`agency-flow-node${isWhiteLabel && index === 2 ? " is-muted" : ""}${!isWhiteLabel && index === 3 ? " is-commission" : ""}`}>
        <span>{step}</span>
        {isWhiteLabel && index === 2 && <small>behind the scenes</small>}
        {!isWhiteLabel && index === 3 && <span className="agency-coin" aria-hidden="true">$</span>}
      </div>
      {index < steps.length - 1 && <div className="agency-flow-connector">
        {!isWhiteLabel && index === 0 && <span className="agency-flow-note">refers the candidate</span>}
        <svg className="agency-flow-arrow" viewBox="0 0 12 24" fill="none" aria-hidden="true"><path d="M6 1v21m0 0 5-5m-5 5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>}
    </div>)}
  </div>;
}

function WaysSection() {
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
          <p className="agency-model-best">{data.best}</p>
        </div>
        <div className="agency-model-flow-panel"><ModelFlow model={model} /></div>
      </div>
    </div>
  </section>;
}

function ProcessVisual({ number }: { number: number }) {
  if (number === 0) return <div className="agency-process-visual agency-chat-visual"><span className="agency-chat-label">NEW REQUEST</span><div className="agency-chat-bubble">New candidate: Staff Nurse, KSA <svg viewBox="0 0 24 24" fill="none" aria-label="attachment"><path d="m8 12 5.8-5.8a3 3 0 014.2 4.2l-7.4 7.4a5 5 0 01-7.1-7.1l7.1-7.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></div><span className="agency-chat-time">10:42 am</span></div>;
  if (number === 1) return <div className="agency-process-visual agency-draft-visual"><div className="agency-draft-paper"><span className="agency-draft-tag">Draft 1 · 24h</span><CvMock role="Staff Nurse" mini /></div></div>;
  if (number === 2) return <div className="agency-process-visual agency-comment-visual"><div className="agency-comment-card"><span className="agency-comment-avatar">PC</span><div><b>Review note</b><p>Add ICU experience</p></div><span className="agency-comment-check">✓</span></div><div className="agency-comment-rule" /></div>;
  return <div className="agency-process-visual agency-files-visual"><span className="agency-file-chip"><b>PDF</b><small>Ready to share</small></span><span className="agency-file-chip"><b>Word</b><small>Editable file</small></span></div>;
}

function AgencyProcess() {
  const steps = [
    ["01", "Send the brief", "Share the candidate and target role."],
    ["02", "We prepare a draft", "Built around their experience."],
    ["03", "Review together", "We make the requested edits."],
    ["04", "Receive final files", "Ready to share with your candidate."],
  ];
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const desktopPathRef = useRef<SVGPathElement>(null);
  const mobilePathRef = useRef<SVGPathElement>(null);
  const desktopMarkerRef = useRef<SVGRectElement>(null);
  const mobileMarkerRef = useRef<SVGRectElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
    const section = sectionRef.current;
    const pinned = stickyRef.current;
    const desktopPath = desktopPathRef.current;
    const mobilePath = mobilePathRef.current;
    const desktopMarker = desktopMarkerRef.current;
    const mobileMarker = mobileMarkerRef.current;
    if (!section || !pinned || !desktopPath || !mobilePath || !desktopMarker || !mobileMarker) return;

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
          ...(mobile ? {} : { pin: pinned, pinSpacing: true, anticipatePin: 1 }),
          start: "top top",
          end: mobile ? "bottom 30%" : "+=120%",
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
    <div className="agency-process-sticky" ref={stickyRef}>
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
    return () => observer.disconnect();
  }, []);
  return <div className="agency-page">
    <section className="agency-hero" aria-labelledby="agency-hero-title">
      <div className="agency-wrap agency-hero-grid">
        <div className="agency-hero-copy" data-agency-reveal>
          <h1 id="agency-hero-title">Your agency&apos;s <em>CV department.</em></h1>
          <p className="agency-hero-sub">A dependable outsourced CV and documentation team for recruitment agencies.</p>
          <div className="agency-hero-actions">
            <a className="btn btn-primary agency-hero-primary" href="#agency-enquiry" data-cta="partners-hero-call">Book a 15-minute call <ArrowIcon /></a>
            <a className="agency-quiet-link agency-outline-link" href="#samples">See sample work <ArrowIcon direction="down" /></a>
          </div>
        </div>
        <HeroStack />
      </div>
    </section>
    <ProofBand />
    <WhoItsFor />
    <WhySection />
    <WaysSection />
    <section className="agency-section agency-samples" id="samples" aria-labelledby="agency-samples-title" data-agency-reveal>
      <div className="agency-wrap">
        <h2 className="agency-title" id="agency-samples-title">Every format your <em>candidates need.</em></h2>
        <PartnersCarousel samples={samples} />
        <div className="agency-template-strip">
          <p>Already have a format? Send us your template and we will work on it.</p>
          <a className="btn btn-primary" href="#agency-enquiry">Book a 15-minute call <ArrowIcon /></a>
        </div>
      </div>
    </section>
    <AgencyProcess />
    <div className="agency-faq-reveal" data-agency-reveal><AgencyFAQ /></div>
    <section className="agency-section agency-final" id="agency-enquiry" aria-labelledby="agency-final-title" data-agency-reveal>
      <div className="agency-wrap agency-final-grid">
        <div className="agency-final-copy">
          <h2 className="agency-title" id="agency-final-title">Let&apos;s talk for <em>15 minutes.</em></h2>
          <p>Tell us about your agency and we&apos;ll get back to you on WhatsApp.</p>
        </div>
        <AgencyEnquiryForm />
      </div>
    </section>
  </div>;
}
