"use client";

import AgencyEnquiryForm from "./AgencyEnquiryForm";
import AgencyFAQ from "./AgencyFAQ";
import PartnersCarousel from "./PartnersCarousel";
import type { AgencySample } from "./types";
import "./partners.css";

const WHY = [
  {
    title: "Stronger candidate CVs",
    text: "Clear, ATS-ready documents for employers.",
    icon: "document",
  },
  {
    title: "A new income line",
    text: "Set your price. We handle the documents.",
    icon: "growth",
  },
  {
    title: "No team to hire",
    text: "Writing, design and formatting, handled.",
    icon: "team",
  },
];

function FeatureIcon({ type }: { type: string }) {
  if (type === "growth") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M4 18V6m0 12h16M7 15l4-4 3 2 5-6M15 7h4v4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "team") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19v-1.5a5.5 5.5 0 0111 0V19zm11-13a3 3 0 010 5.8m2 2.2a4.5 4.5 0 014 4.5V19h-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M7 3.5h7l4 4V20a1 1 0 01-1 1H7a1 1 0 01-1-1V4.5a1 1 0 011-1z" strokeLinejoin="round" />
      <path d="M14 4v4h4M9 12h6M9 16h6" strokeLinecap="round" />
    </svg>
  );
}

function HeroStack() {
  return (
    <div className="agency-visual-wrap" aria-label="A stack of sample CV documents">
      <div className="agency-cv-stack" aria-hidden="true">
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
    </div>
  );
}

function ProofBand() {
  return (
    <section className="agency-proof" aria-label="Partnership experience">
      <div className="agency-wrap agency-proof-grid">
        <div className="agency-proof-item">
          <strong className="agency-proof-number">30+</strong>
          <span className="agency-proof-label">agencies</span>
        </div>
        <div className="agency-proof-item">
          <strong className="agency-proof-number">5,000+</strong>
          <span className="agency-proof-label">resumes built</span>
        </div>
        <div className="agency-proof-item">
          <strong className="agency-proof-number">3+</strong>
          <span className="agency-proof-label">years of experience</span>
        </div>
      </div>
    </section>
  );
}

function AgencyProcess() {
  const steps = [
    ["01", "Send the brief", "Share the CV and target role."],
    ["02", "We prepare a draft", "Built around your candidate’s experience."],
    ["03", "Review together", "We make the requested edits."],
    ["04", "Receive final files", "Ready to share with your candidate."],
  ];

  return (
    <section className="agency-section agency-process" aria-labelledby="agency-process-title">
      <div className="agency-wrap">
        <h2 className="agency-title" id="agency-process-title">A straightforward <em>process.</em></h2>
        <ol className="agency-process-layout">
          {steps.map(([number, title, description]) => (
            <li className="agency-process-step" key={number}>
              <span className="agency-step-number">{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default function PartnersPage({ samples }: { samples: AgencySample[] }) {
  return (
    <div className="agency-page">
      <section className="agency-hero" aria-labelledby="agency-hero-title">
        <div className="agency-wrap agency-hero-grid">
          <div className="agency-hero-copy">
            <h1 id="agency-hero-title">Your agency&apos;s <em>CV department.</em></h1>
            <p className="agency-hero-sub">A dependable outsourced CV and documentation team for recruitment agencies.</p>
            <div className="agency-hero-actions">
              <a className="btn btn-primary" href="#agency-enquiry" data-cta="partners-hero-call">Book a 15-minute call</a>
              <a className="agency-quiet-link" href="#samples">See sample work</a>
            </div>
          </div>
          <HeroStack />
        </div>
      </section>

      <ProofBand />

      <section className="agency-section agency-why" aria-labelledby="agency-why-title">
        <div className="agency-wrap">
          <h2 className="agency-title" id="agency-why-title">Why us</h2>
          <div className="agency-why-grid">
            {WHY.map((item) => (
              <article className="agency-why-card" key={item.title}>
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
          <h2 className="agency-title" id="agency-ways-title">Two ways to <em>work together.</em></h2>
          <div className="agency-way-grid">
            <article className="agency-way-card agency-way-primary">
              <h3>White label</h3>
              <p>Your brand and templates. We work behind the scenes.</p>
            </article>
            <article className="agency-way-card">
              <h3>Referral</h3>
              <p>Refer candidates. We handle the work; you earn a commission.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="agency-section agency-samples" id="samples" aria-labelledby="agency-samples-title">
        <div className="agency-wrap">
          <h2 className="agency-title" id="agency-samples-title">Sample work</h2>
          <PartnersCarousel samples={samples} />
          <div className="agency-template-strip">
            <p>Already have a format? Send us your template and we will work on it.</p>
            <a className="btn btn-primary" href="#agency-enquiry">Book a 15-minute call</a>
          </div>
        </div>
      </section>

      <AgencyProcess />

      <AgencyFAQ />

      <section className="agency-section agency-final" id="agency-enquiry" aria-labelledby="agency-final-title">
        <div className="agency-wrap agency-final-grid">
          <div className="agency-final-copy">
            <h2 className="agency-title" id="agency-final-title">Let&apos;s talk for <em>15 minutes.</em></h2>
            <p>Tell us a little about your agency and we&apos;ll get back to you on WhatsApp.</p>
          </div>
          <AgencyEnquiryForm />
        </div>
      </section>
    </div>
  );
}
