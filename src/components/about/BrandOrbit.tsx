/** "Your personal brand": a central You circle with four chips orbiting slowly on a dashed ring. Pure CSS. */
const I = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const CHIPS = [
  { label: "ATS CV", icon: <svg {...I} aria-hidden="true"><path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" /></svg> },
  { label: "LinkedIn", icon: <svg {...I} aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></svg> },
  { label: "Portfolio", icon: <svg {...I} aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></svg> },
  { label: "Interviews", icon: <svg {...I} aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /></svg> },
];

export default function BrandOrbit() {
  return (
    <div className="orbit" role="img" aria-label="Your personal brand: ATS CV, LinkedIn, portfolio and interviews around you">
      <div className="orbit-ring">
        {CHIPS.map((c, i) => (
          <span key={c.label} className="orbit-slot" style={{ "--a": `${i * 90 - 45}deg`, "--d": `${i * 80}ms` } as React.CSSProperties}>
            <span className="orbit-chip">{c.icon}{c.label}</span>
          </span>
        ))}
      </div>
      <div className="orbit-core">
        <span className="orbit-you">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7Z" /></svg>
        </span>
        <b>You</b>
      </div>
      <style>{`
        .orbit { --r: 150px; position: relative; width: min(100%, 380px); aspect-ratio: 1; margin-left: auto; }
        .orbit-ring { position: absolute; inset: calc(50% - var(--r)); border: 1px dashed #d6e2ff; border-radius: 50%; animation: orbit-spin 60s linear infinite; }
        .orbit:hover .orbit-ring, .orbit:hover .orbit-chip { animation-play-state: paused; }
        .orbit-slot { position: absolute; top: 50%; left: 50%; width: 0; height: 0; transform: rotate(var(--a)) translateX(var(--r)) rotate(calc(-1 * var(--a))); animation: orbit-out 600ms cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d); }
        .orbit-chip { position: absolute; display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 999px; background: #fff; color: #010c28; font-size: 13px; font-weight: 500; white-space: nowrap; box-shadow: 0 8px 24px -10px rgb(1 12 40 / 0.25); transform: translate(-50%, -50%); animation: orbit-upright 60s linear infinite; }
        .orbit-chip svg { color: #0048ff; }
        .orbit-core { position: absolute; top: 50%; left: 50%; display: grid; justify-items: center; gap: 8px; transform: translate(-50%, -50%); }
        .orbit-you { display: grid; width: 120px; height: 120px; place-items: center; border-radius: 50%; background: radial-gradient(circle at 30% 25%, #5b8bff, #0048ff 70%); box-shadow: 0 20px 40px -18px rgb(0 72 255 / 0.6); }
        .orbit-core b { color: #010c28; font-size: 13px; font-weight: 600; }
        @keyframes orbit-spin { to { transform: rotate(360deg); } }
        @keyframes orbit-upright { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(-360deg); } }
        @keyframes orbit-out { from { opacity: 0; transform: rotate(var(--a)) translateX(0) rotate(calc(-1 * var(--a))); } to { opacity: 1; transform: rotate(var(--a)) translateX(var(--r)) rotate(calc(-1 * var(--a))); } }
        @media (max-width: 1023px) { .orbit { --r: 100px; width: 260px; margin: 40px auto 0; } .orbit-you { width: 88px; height: 88px; } .orbit-you svg { width: 38px; height: 38px; } .orbit-chip { padding: 6px 10px; font-size: 12px; } }
        @media (prefers-reduced-motion: reduce) { .orbit-ring, .orbit-chip, .orbit-slot { animation: none !important; } .orbit-chip { transform: translate(-50%, -50%); } }
      `}</style>
    </div>
  );
}
