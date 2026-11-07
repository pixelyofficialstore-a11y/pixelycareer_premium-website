import CvSheet from "@/components/cv/CvSheet";
import type { HeroPersona } from "@/config/heroPersonas";

// How far each sheet behind the top one fans out from it: angles of -16°, -12° and -8°, toward the lower left.
const SHEETS = [
  { a: -8, dx: -7, dy: 4 },
  { a: -4, dx: -3.5, dy: 2 },
  { a: 0, dx: 0, dy: 0 },
];

/** The good CV starts tucked in the pile; --rise (see HeroRise) brings it out. Decorative, so hidden from screen readers. */
export default function HeroStack({ persona }: { persona: HeroPersona }) {
  const { heroBad, good, heroFlip } = persona.images;
  return (
    <div className="hs" aria-hidden="true">
      <div className="hs-pile">
        {SHEETS.map((s, i) => (
          <div key={i} className={`hs-sheet ${i < 2 ? "hs-plain" : ""}`} style={{ "--a": s.a, "--dx": s.dx, "--dy": s.dy } as React.CSSProperties}>
            {i === 2 && <CvSheet image={heroBad} eager />}
          </div>
        ))}
      </div>
      <div className="hs-good">
        <div className="hs-shadow" />
        <div className="hs-paper">
          <div className="hs-flip">
            <div className="hs-face">
              <CvSheet image={good} eager />
            </div>
            <div className="hs-face hs-face-back">
              <CvSheet image={heroFlip} eager />
            </div>
          </div>
        </div>
        {persona.chips.map((chip, i) => (
          <span key={chip} className={`hs-chip hs-chip-${i + 1}`} style={{ "--i": i } as React.CSSProperties}>
            <span>{chip}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
