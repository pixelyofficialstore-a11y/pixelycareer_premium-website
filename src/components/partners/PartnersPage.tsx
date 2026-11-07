"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { whatsappMessage } from "@/lib/site";
import AgencyEnquiryForm from "./AgencyEnquiryForm";
import AgencyFAQ from "./AgencyFAQ";
import PartnersCarousel from "./PartnersCarousel";
import type { AgencySample } from "./types";
import "./partners.css";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const CALL_LINK = whatsappMessage("Hi, I'm from [agency name]. I'd like to discuss a CV partnership.");
const TRIAL_LINK = whatsappMessage("Hi, I'd like to start a paid trial with one candidate.");
const PROPOSAL_PATH = "/partners/Pixely-Partnership-Proposal.pdf";
const WHY = [
  { title: "More candidates shortlisted:", text: "ATS-ready CVs for Gulf and European employers.", icon: "document" },
  { title: "A new income line:", text: "Charge your own price. Pay us a fixed partner rate.", icon: "growth" },
  { title: "No team to hire:", text: "We write, design and format every document.", icon: "team" },
];
const SERVICE_CHIPS = [
  "ATS CVs", "Europass CVs", "Cover letters", "LinkedIn, Indeed & Naukrigulf profiles",
  "SOPs & LORs", "Bio statements", "Portfolio websites", "Interview guides",
];

function FeatureIcon({ type }: { type: string }) {
  if (type === "growth") return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 18V6m0 12h16M7 15l4-4 3 2 5-6M15 7h4v4" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
  if (type === "team") return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1.5a5.5 5.5 0 0111 0V19zm11-13a3 3 0 010 5.8m2 2.2a4.5 4.5 0 014 4.5V19h-3" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M7 3.5h7l4 4V20a1 1 0 01-1 1H7a1 1 0 01-1-1V4.5a1 1 0 011-1z" strokeLinejoin="round" /><path d="M14 4v4h4M9 12h6M9 16h6" strokeLinecap="round" /></svg>
  );
}

function HeroStack() {
  const stackRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stack = stackRef.current;
    const wrapper = wrapperRef.current;
    if (!stack || !wrapper) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(stack, { "--agency-stack-spread": 1 });
        gsap.set(stack.querySelectorAll(".agency-cv-card"), { "--agency-load": 1 });
        return;
      }
      gsap.fromTo(stack.querySelectorAll(".agency-cv-card"), { "--agency-load": 0 }, {
        "--agency-load": 1,
        duration: 0.84,
        ease: "power3.out",
        delay: 0.1,
        stagger: 0.12,
      });
      gsap.fromTo(wrapper.querySelectorAll(".agency-hero-chip"), { opacity: 0, y: 8 }, {
        opacity: 1,
        y: 0,
        duration: 0.32,
        delay: 1.12,
        stagger: 0.1,
        ease: "back.out(1.3)",
      });
      if (desktop) {
        gsap.to(stack, {
          "--agency-stack-spread": 1.12,
          ease: "none",
          scrollTrigger: { trigger: wrapper.closest(".agency-hero"), start: "top top", end: "bottom top", scrub: 0.7 },
        });
        gsap.fromTo(wrapper, { "--agency-base-y": "-14deg" }, {
          "--agency-base-y": "-6deg",
          ease: "none",
          scrollTrigger: { trigger: wrapper.closest(".agency-hero"), start: "top top", end: "bottom top", scrub: 0.7 },
        });
      }
    }, wrapper);
    const onMove = (event: globalThis.PointerEvent) => {
      if (reduced || !window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches) return;
      const bounds = wrapper.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      wrapper.style.setProperty("--agency-tilt-x", `${x * 8}deg`);
      wrapper.style.setProperty("--agency-tilt-y", `${y * -8}deg`);
    };
    const onLeave = () => {
      wrapper.style.setProperty("--agency-tilt-x", "0deg");
      wrapper.style.setProperty("--agency-tilt-y", "0deg");
    };
    wrapper.addEventListener("pointermove", onMove);
    wrapper.addEventListener("pointerleave", onLeave);
    return () => {
      wrapper.removeEventListener("pointermove", onMove);
      wrapper.removeEventListener("pointerleave", onLeave);
      ctx.revert();
    };
  }, []);

  return (
    <div className="agency-visual-wrap" ref={wrapperRef} aria-label="A four-document CV delivery stack with room for your agency branding">
      <div className="agency-cv-stack" ref={stackRef} aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="agency-cv-card" key={index}>
            <div className="agency-cv-top">
              <span className="agency-cv-monogram" />
              {index === 3 && <span className="agency-logo-placeholder">Your agency logo</span>}
            </div>
            <div className="agency-cv-name" />
            <div className="agency-cv-role" />
            <div className="agency-cv-rule" />
            <div className="agency-cv-section" />
            {Array.from({ length: 4 }, (_, line) => <div className="agency-cv-line" key={line} />)}
            <div className="agency-cv-section" />
            {Array.from({ length: 5 }, (_, line) => <div className="agency-cv-line" key={`b-${line}`} />)}
          </div>
        ))}
      </div>
      <span className="agency-hero-chip agency-hero-chip-one">24-hour first drafts</span>
      <span className="agency-hero-chip agency-hero-chip-two">Your branding or ours</span>
    </div>
  );
}

function ProofBand() {
  const bandRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const numbers = Array.from(band.querySelectorAll<HTMLElement>("[data-count]"));
    if (reduced) {
      numbers.forEach((node) => { node.textContent = node.dataset.final ?? ""; });
      return;
    }
    const ctx = gsap.context(() => {
      numbers.forEach((node) => {
        const goal = Number(node.dataset.count);
        const state = { value: 0 };
        gsap.to(state, {
          value: goal,
          duration: 1.35,
          ease: "power2.out",
          scrollTrigger: { trigger: band, start: "top 82%", once: true },
          onUpdate: () => {
            node.textContent = Math.round(state.value).toLocaleString("en-US") + (node.dataset.suffix ?? "");
          },
          onComplete: () => { node.textContent = node.dataset.final ?? ""; },
        });
      });
    }, band);
    return () => ctx.revert();
  }, []);

  return (
    <section className="agency-proof" aria-label="Partnership experience" ref={bandRef}>
      <div className="agency-wrap agency-proof-grid">
        <div className="agency-proof-item"><strong className="agency-proof-number" data-count="20" data-suffix="+" data-final="20+">20+</strong><span className="agency-proof-label">agencies already partner with us</span></div>
        <div className="agency-proof-item"><strong className="agency-proof-number" data-count="1800" data-suffix="+" data-final="1,800+">1,800+</strong><span className="agency-proof-label">clients served</span></div>
        <div className="agency-proof-item"><strong className="agency-proof-number" data-count="3" data-suffix="+" data-final="3+ years">3+ years</strong><span className="agency-proof-label">of experience</span></div>
        <div className="agency-proof-item"><strong className="agency-proof-number" data-count="762499" data-final="762,499">762,499</strong><span className="agency-proof-label">Pakistanis registered for overseas jobs in 2025</span><span className="agency-proof-source">Source: Bureau of Emigration &amp; Overseas Employment</span></div>
      </div>
    </section>
  );
}

function AgencyProcess() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const path = pathRef.current;
    const marker = markerRef.current;
    if (!section || !path || !marker) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    path.setAttribute("d", desktop
      ? "M120 74 C255 74 310 135 435 135 S665 215 565 230 C475 245 728 265 875 238"
      : "M500 0 L500 310");
    const ctx = gsap.context(() => {
      const pathLength = path.getTotalLength();
      gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: reduced ? 0 : pathLength });
      if (reduced) {
        gsap.set(marker, { opacity: 0 });
        return;
      }
      if (desktop) {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=120%",
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        });
        timeline.to(path, { strokeDashoffset: 0, ease: "none" }, 0);
        timeline.to(marker, { opacity: 1, duration: 0.03 }, 0);
        timeline.to(marker, {
          motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: false },
          ease: "none",
        }, 0);
        timeline.fromTo(section.querySelectorAll(".agency-process-step"), { y: 14, opacity: 0.52 }, { y: 0, opacity: 1, stagger: 0.16, ease: "none" }, 0.08);
      } else {
        gsap.to(path, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: section, start: "top 75%", end: "bottom 60%", scrub: 0.6 } });
        gsap.set(marker, { opacity: 0 });
        gsap.fromTo(section.querySelectorAll(".agency-process-step"), { opacity: 0.35, y: 8 }, {
          opacity: 1, y: 0, stagger: 0.12,
          scrollTrigger: { trigger: section, start: "top 72%", end: "bottom 55%", scrub: 0.6 },
        });
      }
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section className="agency-section agency-dark agency-process" aria-labelledby="agency-process-title" ref={sectionRef}>
      <div className="agency-wrap agency-process-inner">
        <p className="agency-kicker">Process</p>
        <h2 className="agency-title" id="agency-process-title">From candidate to <em>final files.</em></h2>
        <div className="agency-process-layout">
          <svg className="agency-process-path" viewBox="0 0 1000 310" preserveAspectRatio="none" aria-hidden="true">
            <path ref={pathRef} d="M120 74 C255 74 310 135 435 135 S665 215 565 230 C475 245 728 265 875 238" />
            <rect className="agency-path-marker" ref={markerRef} width="11" height="11" rx="1" x="0" y="0" opacity="0" />
          </svg>
          <article className="agency-process-step">
            <div className="agency-process-copy"><span className="agency-step-number">01</span><h3>You send the details</h3><p>Current CV, target role and country.</p></div>
            <div className="agency-process-visual"><div className="agency-chat-bubble"><span>New candidate: Nurse, KSA</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-label="Attached file"><path d="M21 11.5l-8.5 8.5a5.5 5.5 0 01-8-8l9-9a3.7 3.7 0 015.2 5.2l-9 9a1.8 1.8 0 01-2.6-2.6l8.3-8.3" strokeLinecap="round" /></svg></div></div>
          </article>
          <article className="agency-process-step">
            <div className="agency-process-copy"><span className="agency-step-number">02</span><h3>We prepare the first draft</h3><p>Within 24 hours.</p></div>
            <div className="agency-process-visual"><div className="agency-mini-cv"><b>Draft 1</b><i /><i /><i /><i /></div></div>
          </article>
          <article className="agency-process-step">
            <div className="agency-process-copy"><span className="agency-step-number">03</span><h3>You review, we revise</h3><p>Corrections until you approve.</p></div>
            <div className="agency-process-visual"><div className="agency-comment">Please add ICU experience<strong><span aria-hidden="true">✓</span> Added to draft</strong></div></div>
          </article>
          <article className="agency-process-step">
            <div className="agency-process-copy"><span className="agency-step-number">04</span><h3>Final files delivered</h3><p>Ready to send to employers.</p></div>
            <div className="agency-process-visual"><div className="agency-file-chips"><span>PDF</span><span>Word</span></div></div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default function PartnersPage({ samples, proposalAvailable }: { samples: AgencySample[]; proposalAvailable: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>(".agency-why-grid, .agency-way-grid").forEach((group) => {
        gsap.fromTo(group.querySelectorAll("[data-agency-reveal]"), { y: 22, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: group, start: "top 88%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const tiltCard = (event: PointerEvent<HTMLElement>) => {
    if (!window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--agency-card-tilt-y", `${x * 6}deg`);
    event.currentTarget.style.setProperty("--agency-card-tilt-x", `${y * -6}deg`);
  };
  const resetCardTilt = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--agency-card-tilt-y", "0deg");
    event.currentTarget.style.setProperty("--agency-card-tilt-x", "0deg");
  };

  return (
    <div className="agency-page" ref={rootRef}>
      <section className="agency-hero" aria-labelledby="agency-hero-title">
        <div className="agency-wrap agency-hero-grid">
          <div className="agency-hero-copy">
            <nav className="agency-breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a><span aria-hidden="true">›</span><span aria-current="page">Agency Partnership</span>
            </nav>
            <p className="agency-kicker">Agency Partnership</p>
            <h1 id="agency-hero-title">Your agency&apos;s <em>CV department.</em></h1>
            <p className="agency-hero-sub">We prepare CVs, cover letters and job profiles for your candidates.<br />Under your agency&apos;s name or ours.</p>
            <div className="agency-hero-actions">
              <a className="btn btn-primary" href={CALL_LINK} target="_blank" rel="noopener noreferrer" data-cta="partners-hero-call">Book a 15-minute call →</a>
              <a className="btn btn-outline" href="#samples">See sample work ↓</a>
            </div>
          </div>
          <HeroStack />
        </div>
      </section>

      <ProofBand />

      <section className="agency-section agency-why" aria-labelledby="agency-why-title">
        <div className="agency-wrap">
          <p className="agency-kicker">Why us</p>
          <h2 className="agency-title" id="agency-why-title">Built for agencies that <em>place candidates abroad.</em></h2>
          <div className="agency-why-grid">
            {WHY.map((item) => (
              <article className="agency-why-card" key={item.title} data-agency-reveal>
                <span className="agency-line-icon"><FeatureIcon type={item.icon} /></span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="agency-section agency-ways" aria-labelledby="agency-ways-title">
        <div className="agency-wrap">
          <p className="agency-kicker">Partnership models</p>
          <h2 className="agency-title" id="agency-ways-title">Two ways to <em>work together.</em></h2>
          <div className="agency-way-grid">
            <article className="agency-way-card agency-way-primary" data-agency-reveal onPointerMove={tiltCard} onPointerLeave={resetCardTilt}>
              <span className="agency-way-kicker">WHITE LABEL</span>
              <h3>Under your agency&apos;s name</h3>
              <ul><li>Your branding and templates</li><li>You keep the candidate relationship</li><li>We stay behind the scenes</li></ul>
              <p className="agency-way-note">Best for agencies that want control and extra margin.</p>
            </article>
            <article className="agency-way-card" data-agency-reveal onPointerMove={tiltCard} onPointerLeave={resetCardTilt}>
              <span className="agency-way-kicker">REFERRAL</span>
              <h3>Under the Pixely Careers name</h3>
              <ul><li>Send interested candidates to us</li><li>We handle everything directly</li><li>You earn a commission on every order</li></ul>
              <p className="agency-way-note">Best for agencies that want zero effort.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="agency-section" id="samples" aria-labelledby="agency-samples-title">
        <div className="agency-wrap">
          <div className="agency-samples-head">
            <div><p className="agency-kicker">Sample work</p><h2 className="agency-title" id="agency-samples-title">Every format your <em>candidates need.</em></h2></div>
          </div>
          <PartnersCarousel samples={samples} />
          <p className="agency-sample-note">We work across all professions. Full portfolio on request.</p>
          <div className="agency-chip-row" aria-label="What we prepare">
            {SERVICE_CHIPS.map((chip) => <span className="agency-service-chip" key={chip}>{chip}</span>)}
          </div>
          <div className="agency-template-strip">
            <div><strong>Already have a format?</strong><p>Send us your template and we&apos;ll work in it.</p></div>
            <div className="agency-template-perks"><span>24-hour first drafts</span><span>Corrections until approval</span></div>
          </div>
        </div>
      </section>

      <AgencyProcess />

      <section className="agency-section agency-trial" aria-labelledby="agency-trial-title">
        <div className="agency-wrap">
          <div className="agency-trial-card">
            <div><h2 id="agency-trial-title">Start with <em>one candidate.</em></h2><p>A paid trial order, so you can judge the quality before deciding anything.</p></div>
            <a className="btn btn-primary" href={TRIAL_LINK} target="_blank" rel="noopener noreferrer" data-cta="partners-trial">Send your first candidate →</a>
          </div>
        </div>
      </section>

      <AgencyFAQ />

      <section className="agency-section agency-final" aria-labelledby="agency-final-title">
        <div className="agency-wrap agency-final-grid">
          <div className="agency-final-copy">
            <p className="agency-kicker">Agency Partnership</p>
            <h2 className="agency-title" id="agency-final-title">Let&apos;s talk for <em>15 minutes.</em></h2>
            <p>We&apos;ll learn what your candidates need, agree a model and rates, and start with one paid trial order.</p>
            <div className="agency-final-actions">
              <a className="btn btn-white" href={CALL_LINK} target="_blank" rel="noopener noreferrer" data-cta="partners-final-call">Book a call on WhatsApp →</a>
              <a
                className="agency-proposal"
                href={PROPOSAL_PATH}
                data-cta="partners-proposal-download"
                aria-disabled={!proposalAvailable}
                title={proposalAvailable ? "Download the partnership proposal" : "The partnership proposal is not available yet."}
                onClick={(event) => { if (!proposalAvailable) event.preventDefault(); }}
              >
                Download our partnership proposal (PDF)
              </a>
            </div>
            <p className="agency-tagline">We Don&apos;t Write CVs. We Build Interview Opportunities.</p>
          </div>
          <AgencyEnquiryForm />
        </div>
      </section>
    </div>
  );
}
