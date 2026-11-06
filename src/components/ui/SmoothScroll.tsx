"use client";
import { useEffect } from "react";
import { scheduleMotion } from "@/lib/motion";

/** Lenis on mouse and trackpad devices only. Touch scrolling stays native (and free of a rAF loop). */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    scheduleMotion(({ gsap, ScrollTrigger }) => {
      import("lenis").then(({ default: Lenis }) => {
        if (cancelled) return;
        const lenis = new Lenis({ anchors: true, lerp: 0.11 });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (t: number) => lenis.raf(t * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        cleanup = () => {
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      });
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);
  return null;
}
