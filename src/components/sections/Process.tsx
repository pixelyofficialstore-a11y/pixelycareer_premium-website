import { MARKETS, formatPrice, localize, type MarketKey } from "@/config/markets";

const STEPS = [
  { n: "01", title: "Choose", line: "Pick a package and your target country." },
  { n: "02", title: "Share", line: "Send your current CV on WhatsApp." },
  { n: "03", title: "Draft", line: "Your first draft in 2–3 days." },
  { n: "04", title: "Refine", line: "Revise until it’s right, then get your files." },
];

export default function Process({ market }: { market: MarketKey }) {
  const m = MARKETS[market];
  const visuals = [
    <div key="1" className="mini mini-pack">
      <span>ATS Career</span>
      <b>{formatPrice(m, m.prices["ats-career"])}</b>
    </div>,
    <div key="2" className="mini mini-chat">
      <span>Here’s my {m.word}</span>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 11.5l-8.5 8.5a5.5 5.5 0 01-8-8l9-9a3.7 3.7 0 015.2 5.2l-9 9a1.8 1.8 0 01-2.6-2.6l8.3-8.3" />
      </svg>
    </div>,
    <div key="3" className="mini mini-draft">
      <em>Draft 1</em>
      <i />
      <i />
      <i />
      <i />
    </div>,
    <div key="4" className="mini mini-done">
      <b>✓</b>
      <span>PDF + Word</span>
    </div>,
  ];
  return (
    <section id="process" aria-labelledby="process-title" className="section on-dark bg-navy text-white">
      <div className="wrap">
        <div data-reveal>
          <p className="label">How it works</p>
          <h2 id="process-title" className="h2 mt-6">
            Four steps. <em>Zero guesswork.</em>
          </h2>
        </div>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.n} className="step" data-reveal>
              <div className="step-visual" aria-hidden="true">
                {visuals[i]}
              </div>
              <p className="step-n" aria-hidden="true">
                {s.n}
              </p>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-line">{localize(m, s.line)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
