"use client";
import { useEffect, useRef } from "react";
import { MARKETS, formatPrice, localize, type MarketKey } from "@/config/markets";
import { useGsapSection } from "@/lib/motion";

const SQUARE = 10;
const VIVID = "#0048ff";

function Choose({ market }: { market: MarketKey }) {
  const m = MARKETS[market];
  return (
    <div className="proc-visual bg-white text-navy">
      <p className="text-[11px] font-semibold">ATS Career</p>
      <span className="mt-2 inline-block rounded-full bg-vivid px-2.5 py-1 text-[11px] font-semibold text-white tabular-nums">{formatPrice(m, m.prices["ats-career"])}</span>
    </div>
  );
}
const Share = ({ word }: { word: string }) => (
  <div className="proc-visual proc-bubble bg-[#dcf8c6] text-navy">
    <p className="text-[12px] leading-[1.35]">
      Here’s my {word}{" "}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline align-[-1px]" aria-hidden="true">
        <path d="M21 11.5l-8.5 8.5a5.5 5.5 0 01-8-8l9-9a3.7 3.7 0 015.2 5.2l-9 9a1.8 1.8 0 01-2.6-2.6l8.3-8.3" />
      </svg>
    </p>
  </div>
);
const Draft = () => (
  <div className="proc-visual relative bg-white">
    <span className="absolute -top-2 right-2 rounded-full bg-vivid px-2 py-0.5 text-[10px] font-semibold text-white">Draft 1</span>
    <i className="block h-1.5 w-1/2 bg-navy" />
    <i className="mt-2 block h-1 w-full bg-navy/20" />
    <i className="mt-1 block h-1 w-5/6 bg-navy/20" />
    <i className="mt-1 block h-1 w-full bg-navy/20" />
    <i className="mt-1 block h-1 w-2/3 bg-navy/20" />
  </div>
);
const Refine = () => (
  <div className="proc-visual bg-white text-navy">
    <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-vivid text-[13px] font-semibold text-white">
      ✓
    </span>
    <p className="mt-1.5 text-[11px] leading-[1.3] font-medium">Final files: PDF + Word</p>
  </div>
);

const STEPS = [
  { n: "01", title: "Choose", line: "Pick a package and your target country." },
  { n: "02", title: "Share", line: "Send your current CV on WhatsApp." },
  { n: "03", title: "Draft", line: "Your first draft in 2–3 days." },
  { n: "04", title: "Refine", line: "Revise until it’s right, then get your files." },
];

/** Draws the path past each step. Returns where along it each step sits, from 0 to 1. */
function layoutLine(area: HTMLElement, svg: SVGSVGElement, path: SVGPathElement) {
  const a = area.getBoundingClientRect();
  const wide = window.innerWidth >= 1024;
  const steps = [...area.querySelectorAll<HTMLElement>("[data-step]")];
  svg.setAttribute("viewBox", `0 0 ${a.width} ${a.height}`);
  const center = a.width / 2;
  const ys = steps.map((s) => {
    const r = s.getBoundingClientRect();
    return r.top - a.top + (wide ? r.height / 2 : 24);
  });

  const segments: string[] = [];
  if (wide) {
    // An S: the line swings toward each step, left then right.
    let x = center;
    let y = 0;
    ys.forEach((ny, i) => {
      const nx = center + (i % 2 === 0 ? -56 : 56);
      const k = (ny - y) * 0.55;
      segments.push(`C${x} ${y + k} ${nx} ${ny - k} ${nx} ${ny}`);
      x = nx;
      y = ny;
    });
    const k = (a.height - y) * 0.55;
    segments.push(`C${x} ${y + k} ${center} ${a.height - k} ${center} ${a.height}`);
  } else {
    ys.forEach((ny) => segments.push(`L4 ${ny}`));
    segments.push(`L4 ${a.height}`);
  }
  const start = wide ? `M${center} 0` : "M4 0";
  const stops: number[] = [];
  segments.slice(0, steps.length).forEach((_, i) => {
    path.setAttribute("d", `${start}${segments.slice(0, i + 1).join("")}`);
    stops.push(path.getTotalLength());
  });
  path.setAttribute("d", `${start}${segments.join("")}`);
  const length = path.getTotalLength();
  return { length, stops: stops.map((s) => s / length), steps };
}

export default function Process({ market, pin = false }: { market: MarketKey; pin?: boolean }) {
  const m = MARKETS[market];
  const root = useRef<HTMLElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const square = useRef<SVGRectElement>(null);

  const paint = (progress: number, length: number) => {
    if (!path.current || !square.current) return;
    path.current.style.strokeDasharray = `${length}`;
    path.current.style.strokeDashoffset = `${length * (1 - progress)}`;
    const pt = path.current.getPointAtLength(length * progress);
    square.current.setAttribute("x", `${pt.x - SQUARE / 2}`);
    square.current.setAttribute("y", `${pt.y - SQUARE / 2}`);
  };

  // The finished line is drawn for everyone, including reduced motion.
  useEffect(() => {
    const draw = () => {
      if (area.current && svg.current && path.current) paint(1, layoutLine(area.current, svg.current, path.current).length);
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  useGsapSection(root, ({ reduced }, { ScrollTrigger }) => {
    if (reduced || !area.current || !svg.current || !path.current) return;
    const host = area.current;
    const svgEl = svg.current;
    const line = path.current;
    let trigger: ReturnType<typeof ScrollTrigger.create> | undefined;
    const build = () => {
      trigger?.kill();
      const { length, stops, steps } = layoutLine(host, svgEl, line);
      host.classList.add("proc-armed");
      const update = (p: number) => {
        paint(p, length);
        steps.forEach((s, i) => s.classList.toggle("is-on", p >= stops[i] - 0.005));
      };
      const wide = window.innerWidth >= 1024;
      trigger = ScrollTrigger.create(
        wide && pin
          ? { trigger: root.current, start: "top top", end: "bottom bottom", onUpdate: (self) => update(self.progress) }
          : { trigger: host, start: "top 75%", end: "bottom 75%", onUpdate: (self) => update(self.progress) },
      );
      update(trigger.progress);
    };
    build();
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(build, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      trigger?.kill();
      host.classList.remove("proc-armed");
    };
  });

  return (
    <section ref={root} id="process" aria-labelledby="process-title" className={`on-dark proc bg-navy text-white ${pin ? "proc-pin" : "section"}`}>
      <div className="proc-frame">
        <div className="wrap proc-inner">
          <div>
            <p className="label">How it works</p>
            <h2 id="process-title" className="h2 mt-4">
              Four steps. <em>Zero guesswork.</em>
            </h2>
          </div>
          <div ref={area} className="proc-area">
            <svg ref={svg} aria-hidden="true" className="proc-svg">
              <path ref={path} fill="none" stroke={VIVID} strokeWidth="2" />
              <rect ref={square} width={SQUARE} height={SQUARE} fill={VIVID} />
            </svg>
            <ol className="proc-steps">
              {STEPS.map((s, i) => (
                <li key={s.n} data-step className={`proc-step ${i % 2 === 0 ? "proc-left" : "proc-right"}`}>
                  <span aria-hidden="true" className="proc-num">
                    {s.n}
                  </span>
                  <div className="proc-copy">
                    <h3 className="font-head text-[22px] leading-[1.2] font-semibold tracking-[-0.01em]">{s.title}</h3>
                    <p className="mt-1 text-[15px] leading-[1.45] text-pretty text-white/75">{localize(m, s.line)}</p>
                  </div>
                  <div className="proc-mini" aria-hidden="true">
                    {i === 0 && <Choose market={market} />}
                    {i === 1 && <Share word={m.word} />}
                    {i === 2 && <Draft />}
                    {i === 3 && <Refine />}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
