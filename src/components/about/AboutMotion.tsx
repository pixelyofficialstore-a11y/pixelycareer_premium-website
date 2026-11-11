"use client";
import { useEffect } from "react";

/** About page reveals, each played once when it enters view: fade ups, the word by word lead, and the steps sequence. */
export default function AboutMotion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.querySelector<HTMLElement>(".ab");
    if (!root || reduce) return;
    root.classList.add("ab-js");
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-ab-rise], [data-ab-words], [data-ab-steps]"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        if (el.hasAttribute("data-ab-steps")) el.classList.add("play");
        else {
          if (el.classList.contains("ab-card")) {
            const i = Array.from(el.parentElement?.children ?? []).indexOf(el);
            el.style.transitionDelay = `${Math.max(0, i) * 100}ms`;
          }
          el.classList.add("is-in");
        }
        io.unobserve(el);
      });
    }, { threshold: 0.25 });
    targets.forEach((el) => io.observe(el));
    return () => { io.disconnect(); root.classList.remove("ab-js"); };
  }, []);
  return null;
}
