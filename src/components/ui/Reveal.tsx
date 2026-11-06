"use client";
import { useEffect } from "react";
import { scheduleMotion } from "@/lib/motion";

/**
 * The one reveal used across the page: opacity 0 to 1, y 24 to 0, 600ms, power3.out, 80ms stagger.
 * Mark an element with data-reveal. Content is visible by default, so this can only ever add polish.
 */
export default function Reveal() {
  // Phones skip laying out far-off sections, so arriving from another page at /#pricing needs one more
  // pass once the real heights are known. Any touch from the visitor cancels it.
  useEffect(() => {
    const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (!target || window.innerWidth >= 1024) return;
    const settle = () => target.scrollIntoView({ behavior: "instant" });
    const timers = [window.setTimeout(settle, 120), window.setTimeout(settle, 500), window.setTimeout(settle, 1000)];
    const cancel = () => timers.forEach(window.clearTimeout);
    window.addEventListener("touchstart", cancel, { passive: true, once: true });
    return () => {
      cancel();
      window.removeEventListener("touchstart", cancel);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let revert: (() => void) | undefined;
    let cancelled = false;
    scheduleMotion(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        // Anything already on screen stays put rather than blinking out and back.
        const els = gsap.utils.toArray<HTMLElement>("[data-reveal]").filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);
        // Opacity only, not visibility, so headings stay available to screen readers before they scroll in.
        gsap.set(els, { opacity: 0, y: 24 });
        ScrollTrigger.batch(els, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08, overwrite: true, clearProps: "transform,opacity" }),
        });
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          gsap.fromTo(el, { y: 20 }, { y: -20, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
        });
      });
      revert = () => ctx.revert();
    });
    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);
  return null;
}
