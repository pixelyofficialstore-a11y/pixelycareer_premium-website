"use client";
import { useEffect, useRef } from "react";
import { useGsapSection } from "@/lib/motion";

/**
 * /ae hero: "the best CV comes out of the bad stack". All the movement is written in CSS from one number, --rise (0 to 1).
 * Large screens scrub it while the hero holds (a sticky stage in a taller track, so nothing can jump when it lets go).
 * Phones play it once when the visual comes into view. With reduced motion, CSS simply sets it to 1.
 */
export default function HeroRise({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGsapSection(root, ({ desktop }, { gsap }) => {
    const el = root.current;
    if (!desktop || !el) return;

    gsap.to(el, {
      "--rise": 1,
      ease: "power1.inOut",
      scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6 },
    });

    // The 3D tilt: follows the cursor, 4° at most each way.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      el.style.setProperty("--mx", `${((e.clientX / window.innerWidth) * 2 - 1) * 4}deg`);
      el.style.setProperty("--my", `${(1 - (e.clientY / window.innerHeight) * 2) * 4}deg`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };
  });

  // Phones don't load GSAP until the first gesture, and this doesn't need it.
  useEffect(() => {
    const el = root.current;
    const visual = el?.querySelector(".ae-stack");
    if (!el || !visual || window.innerWidth >= 1024) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add("is-out");
        io.disconnect();
      },
      { threshold: 0.45 },
    );
    io.observe(visual);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} className="rise-track">
      <div className="rise-stage">{children}</div>
    </div>
  );
}
