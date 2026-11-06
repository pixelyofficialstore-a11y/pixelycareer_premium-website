import Link from "next/link";
import { localize, type Market } from "@/config/markets";
import CvPaper from "@/components/hero/CvPaper";
import { ArrowRight } from "@/components/ui/Icons";

const CARDS = [
  {
    title: "Built for looks, not for screening",
    line: "Two columns, icons and graphics can get scrambled when ATS software reads your CV.",
    fix: "Clean single-column ATS format",
  },
  {
    title: "A summary that could be anyone",
    line: "“Hardworking and motivated” tells a recruiter nothing about you.",
    fix: "A sharp summary built around your target role",
  },
  {
    title: "Duties, not results",
    line: "“Responsible for…” lists the job. Recruiters look for what you achieved.",
    fix: "Achievement-led bullet points",
  },
];

const FIG_SIZES = "(min-width: 1024px) 30vw, 100vw";

/** Sits after the pinned story, so it is never part of the scroll animation. */
export function ProblemNext({ market }: { market: Market }) {
  return (
    <p className="wrap py-12 text-center text-base text-navy/70" data-reveal>
      {localize(market, "Not sure about your CV?")}{" "}
      <Link href="/free-cv-review" className="link-u font-head font-medium text-navy" data-cta="problem-free-review">
        Get a free review
        <ArrowRight />
      </Link>
    </p>
  );
}

/** plain: not inside the scroll story, so nothing travels here. Each part just fades in. */
export default function Problem({ market, plain }: { market: Market; plain?: boolean }) {
  const l = (t: string) => localize(market, t);
  const reveal = plain ? { "data-reveal": true } : {};
  return (
    <section id="problem" aria-labelledby="problem-title" className="problem" data-problem>
      <div className="wrap problem-inner">
        <header className="problem-head" {...reveal}>
          <p className="label">The problem</p>
          <h2 id="problem-title" className="h2 problem-title">
            Your experience isn’t the problem. <em>{l("Your CV is.")}</em>
          </h2>
          <p className="problem-sub">{l("Three things that quietly hold most CVs back.")}</p>
        </header>

        <div className="problem-grid">
          <figure className="p-fig p-fig-a" data-slot="a" {...reveal}>
            <CvPaper cv="a" sizes={FIG_SIZES} alt={l("Example of a two-column CV with common problems")} highlights="static" />
          </figure>

          <div className="p-slot">
            <ol className="p-cards">
              {CARDS.map((c, i) => (
                <li key={c.title} className="p-card" data-card {...reveal}>
                  <span className="p-num" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <h3 className="p-title">{c.title}</h3>
                  <p className="p-line">{l(c.line)}</p>
                  <p className="p-fix">✓ {l(c.fix)}</p>
                </li>
              ))}
            </ol>
            <div className="p-dots" aria-hidden="true">
              {CARDS.map((c) => (
                <i key={c.title} data-dot />
              ))}
            </div>
          </div>

          <figure className="p-fig p-fig-good" data-slot="good" {...reveal}>
            <CvPaper cv="good" sizes={FIG_SIZES} alt={l("Example of a single-column ATS-friendly CV by Pixely Careers")} highlights="static" />
          </figure>
        </div>
      </div>
    </section>
  );
}
