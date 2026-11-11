"use client";
import { useEffect, useRef } from "react";
import { useGsapSection } from "@/lib/motion";

/**
 * Hero: "the good CV comes out of the bad stack". All the movement is written in CSS from one number, --rise (0 to 1).
 * Large screens scrub it while the hero holds (a sticky stage in a taller track, so nothing can jump when it lets go).
 * Phones play it once when the visual comes into view. With reduced motion, CSS simply shows the final state.
 * The chips pop in as the CV clears the stack, a little before it reaches its final place.
 * A market with a second good CV spins between the two once the CV is fully out: always the same way, with a pause on each.
 */
export default function HeroRise({ children, free = false }: { children: React.ReactNode; free?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const flipTimer = useRef(0);
  const spinEnd = useRef(0);
  const angle = useRef(0);

  const startFlip = () => {
    const el = root.current;
    if (!el || flipTimer.current || !el.querySelector(".hs-flip")) return;
    flipTimer.current = window.setInterval(() => {
      // A hidden tab plays no transitions; skipping turns there stops a burst of spins on return.
      if (document.hidden) return;
      angle.current += 180;
      el.style.setProperty("--flip", `${angle.current}deg`);
      // The chips step aside during the turn, then pop back.
      el.classList.add("is-spinning");
      window.clearTimeout(spinEnd.current);
      spinEnd.current = window.setTimeout(() => el.classList.remove("is-spinning"), 1100);
    }, 4500);
  };
  const stopFlip = () => {
    window.clearInterval(flipTimer.current);
    window.clearTimeout(spinEnd.current);
    flipTimer.current = 0;
    angle.current = 0;
    root.current?.classList.remove("is-spinning");
    root.current?.style.removeProperty("--flip");
  };

  useGsapSection(root, ({ desktop }, { gsap }) => {
    const el = root.current;
    if (!desktop || !el) return;
    if (free) {
      if (!window.matchMedia("(pointer: fine)").matches) return;
      const tilt = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const clamp = (v: number) => Math.max(-6, Math.min(6, v));
        el.style.setProperty("--mx", `${clamp(((e.clientX / window.innerWidth) * 2 - 1) * 6)}deg`);
        el.style.setProperty("--my", `${clamp((1 - (e.clientY / window.innerHeight) * 2) * 6)}deg`);
      };
      window.addEventListener("pointermove", tilt, { passive: true });
      return () => window.removeEventListener("pointermove", tilt);
    }

    // The CV is fully out by 65% of the hold. The rest keeps it on screen, so the page only moves on when the visitor scrolls again.
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6 },
      onUpdate: () => {
        el.classList.toggle("chips-on", tl.progress() > 0.4);
        if (tl.progress() > 0.64) startFlip();
        else stopFlip();
      },
    });
    tl.to(el, { "--rise": 1, ease: "power1.inOut", duration: 0.65 }).to({}, { duration: 0.35 });

    // The 3D tilt: follows the cursor, 6° at most each way.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      el.style.setProperty("--mx", `${((e.clientX / window.innerWidth) * 2 - 1) * 6}deg`);
      el.style.setProperty("--my", `${(1 - (e.clientY / window.innerHeight) * 2) * 6}deg`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      stopFlip();
      el.classList.remove("chips-on");
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };
  });

  // Phones don't load GSAP until the first gesture, and this doesn't need it.
  useEffect(() => {
    const el = root.current;
    const visual = el?.querySelector(".hs");
    if (!el || !visual || (!free && window.innerWidth >= 1024)) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        el.classList.add("is-out");
        timer = window.setTimeout(() => {
          el.classList.add("chips-on");
          if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) startFlip();
        }, 350);
      },
      { threshold: 0.45 },
    );
    io.observe(visual);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      stopFlip();
    };
  }, []);

  return (
    <div ref={root} className={`rise-track${free ? " rise-free" : ""}`}>
      <div className="rise-stage">{children}</div>
    </div>
  );
}
