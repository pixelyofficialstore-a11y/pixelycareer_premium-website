import Link from "next/link";
import CvSheet from "@/components/cv/CvSheet";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import { localize, type Market } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";

const ROWS = [
  { title: "Built for looks, not for screening", line: "Two columns and graphics can get scrambled when ATS software reads your CV.", fix: "Clean single-column ATS format" },
  { title: "A summary that could be anyone", line: "“Hardworking and motivated” tells a recruiter nothing about you.", fix: "A sharp summary built around your target role" },
  { title: "Duties, not results", line: "“Responsible for…” lists the job. Recruiters look for what you achieved.", fix: "Achievement-led bullet points" },
];

export function ProblemNext({ market }: { market: Market }) {
  return (
    <p className="wrap pb-16 text-center text-base text-navy/70 lg:pb-20" data-reveal>
      {localize(market, "Not sure about your CV?")}{" "}
      <Link href="/free-cv-review" className="link-u font-head font-medium text-navy" data-cta="problem-free-review">
        Get a free review
        <ArrowRight />
      </Link>
    </p>
  );
}

/** Everything is readable at a glance: the weak CV, what goes wrong and how it's fixed, the strong CV. */
export default function Problem({ market }: { market: Market }) {
  const l = (t: string) => localize(market, t);
  const { bad, good } = HERO_PERSONAS[market.key].images;
  return (
    <section id="problem" aria-labelledby="problem-title" className="problem">
      <div className="wrap">
        <header className="problem-head" data-reveal>
          <p className="label">The problem</p>
          <h2 id="problem-title" className="h2 problem-title">
            Your experience isn’t the problem. <em>{l("Your CV is.")}</em>
          </h2>
        </header>

        <div className="problem-grid">
          <figure className="p-fig p-fig-bad" data-reveal>
            <figcaption className="p-tag p-tag-bad">{l("Before: a typical CV")}</figcaption>
            <CvSheet image={bad} />
          </figure>

          <ol className="p-rows">
            {ROWS.map((row, i) => (
              <li key={row.title} className="p-row" data-reveal>
                <span className="p-num" aria-hidden="true">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="p-title">{row.title}</h3>
                  <p className="p-line">{l(row.line)}</p>
                  <p className="p-fix">✓ {l(row.fix)}</p>
                </div>
              </li>
            ))}
          </ol>

          <figure className="p-fig p-fig-good" data-reveal>
            <figcaption className="p-tag p-tag-good">{l("After: built by Pixely")}</figcaption>
            <CvSheet image={good} />
          </figure>
        </div>
      </div>
    </section>
  );
}
