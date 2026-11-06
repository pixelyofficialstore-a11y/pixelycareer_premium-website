import Image from "next/image";

export const CV = {
  good: "/cv/good-cv-ats-single-column.webp",
  a: "/cv/bad-cv-two-column-1.webp",
  b: "/cv/bad-cv-two-column-2.webp",
};
const W = 1655;
const H = 2340;

type Area = { x: number; y: number; w: number; h: number };
const area = (x0: number, x1: number, y0: number, y1: number): Area => ({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });

/** Where each problem card points, as % of the image. Index 0 to 2 matches cards 01 to 03. */
export const HIGHLIGHTS: Record<"a" | "good", Area[]> = {
  a: [area(0, 44, 0, 100), area(45, 99, 21, 36), area(52, 96, 73, 96)],
  good: [area(5, 95, 18, 98), area(5, 95, 19, 29), area(5, 95, 64, 74)],
};

type Props = {
  cv: keyof typeof CV;
  alt?: string;
  sizes: string;
  /** Images on screen at load: lazy loading only slows those down, and any of the three can be the LCP element. */
  eager?: boolean;
  /** "story": the scroll story lights these up. "static": always on. Both have numbered markers. */
  highlights?: "story" | "static";
};

/** One CV image styled as a sheet of paper, with its aspect ratio reserved so nothing shifts on load. */
export default function CvPaper({ cv, alt = "", sizes, eager, highlights }: Props) {
  const areas = cv === "good" || cv === "a" ? HIGHLIGHTS[cv] : [];
  return (
    <div className={`cv-paper cv-paper-${cv}`}>
      <Image src={CV[cv]} alt={alt} width={W} height={H} sizes={sizes} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} className="cv-img" />
      {highlights &&
        areas.map((a, i) => (
          <span key={i} aria-hidden="true" className={`hl-zone hl-${highlights}`} style={{ left: `${a.x}%`, top: `${a.y}%`, width: `${a.w}%`, height: `${a.h}%` }}>
            <span data-hl={`${cv}-${i}`} className={`hl ${cv === "a" ? "hl-bad" : "hl-fix"}`} />
            <b data-marker={`${cv}-${i}`}>{i + 1}</b>
          </span>
        ))}
    </div>
  );
}
