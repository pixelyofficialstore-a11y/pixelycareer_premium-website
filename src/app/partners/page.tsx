import { ArrowRight } from "@/components/ui/Icons";
import Reveal from "@/components/ui/Reveal";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { whatsappMessage } from "@/lib/site";

export const metadata = pageMetadata(
  "/partners",
  "CV Partnership for Recruitment Agencies | Pixely Careers",
  "Your agency’s CV department. We prepare CVs and cover letters for your candidates, under your name or ours. Partner rates are agreed on a 15-minute call.",
);

const CALL = whatsappMessage("Hi, I'm from [agency]. I'd like to discuss a CV partnership.");
const WHY = [
  { title: "More candidates shortlisted", line: "ATS-ready, recruiter-focused CVs for Gulf and European employers." },
  { title: "A new income line", line: "You set your own price and keep the difference." },
  { title: "No team to hire", line: "We write, design and format everything." },
];
const WAYS = [
  { title: "White-label", points: ["Your branding and templates", "You keep the candidate relationship", "We stay behind the scenes"] },
  { title: "Referral", points: ["Send candidates to us", "We handle everything directly", "You earn a commission on every order"] },
];
const STEPS = ["Send the candidate’s CV, role and country", "First draft within 24 hours", "Revise until you approve", "Final files, ready to send"];
const CHIPS = ["ATS CVs", "Europass CVs", "Cover letters", "LinkedIn, Indeed & Naukrigulf profiles", "SOPs, LORs, motivation letters", "Bio statements", "Contact cards", "Your own template"];

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "For Agencies", path: "/partners" }])} />
      <section className="page-top wrap">
        <p className="label">For Agencies</p>
        <h1 className="page-h1 mt-6 max-w-[14ch]">Your agency’s CV department.</h1>
        <p className="page-sub">We prepare CVs and cover letters for your candidates, under your name or ours.</p>
        <a href={CALL} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-8 min-h-14 px-8 text-[1.0625rem]" data-cta="partners-book-call">
          Book a 15-minute call
          <ArrowRight />
        </a>
        <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-navy/60">
          <span>20+ agencies already partner with us</span>
          <span aria-hidden="true" className="h-3 w-px bg-navy/30" />
          <span>1,800+ clients served</span>
        </p>
      </section>

      <section aria-labelledby="why-title" className="section wrap">
        <h2 id="why-title" className="h2" data-reveal>
          Why agencies partner with us
        </h2>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {WHY.map((w) => (
            <li key={w.title} className="card lift p-8" data-reveal>
              <h3 className="card-title">{w.title}</h3>
              <p className="mt-3 leading-[1.5] text-navy/70">{w.line}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ways-title" className="wrap pb-24 lg:pb-40">
        <h2 id="ways-title" className="h2" data-reveal>
          Two ways to work
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {WAYS.map((w) => (
            <article key={w.title} className="card lift p-8 lg:p-12" data-reveal>
              <h3 className="font-head text-[clamp(28px,2.8vw,40px)] leading-[1.1] font-semibold tracking-[-0.02em]">{w.title}</h3>
              <ul className="check-list mt-6">
                {w.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="order-title" className="wrap pb-24 lg:pb-40">
        <h2 id="order-title" className="h2" data-reveal>
          How an order works
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s} data-reveal>
              <span className="proc-num" aria-hidden="true">
                0{i + 1}
              </span>
              <p className="mt-3 max-w-[24ch] text-[18px] leading-[1.4] font-medium text-pretty">{s}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="prepare-title" className="wrap pb-24 lg:pb-40" data-reveal>
        <h2 id="prepare-title" className="h2">
          What we can prepare
        </h2>
        <ul className="mt-8 flex flex-wrap gap-3">
          {CHIPS.map((c) => (
            <li key={c} className="chip">
              {c}
            </li>
          ))}
        </ul>
        <p className="mt-10 text-lg text-navy/75">Partner rates are agreed on a 15-minute call. No minimum volume.</p>
      </section>

      <section aria-labelledby="talk-title" className="on-blue section bg-vivid text-center text-white">
        <div className="wrap" data-reveal>
          <h2 id="talk-title" className="h2">
            Let’s talk for 15 minutes.
          </h2>
          <a href={CALL} target="_blank" rel="noopener noreferrer" className="btn btn-white mt-10 min-h-14 px-8 text-[1.0625rem]" data-cta="partners-final-call">
            Book a call on WhatsApp
            <ArrowRight />
          </a>
        </div>
      </section>
      <Reveal />
    </>
  );
}
