"use client";
import { useEffect } from "react";

/** Services page: each layer card plays once as it enters (visual slides in, rows fade up 80ms apart). */
export default function ServicesMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector<HTMLElement>(".sv");
    if (!root) return;
    root.classList.add("sv-js");
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-sv-card]"));
    cards.forEach((card) => card.querySelectorAll<HTMLElement>("[data-sv-row]").forEach((row, i) => { row.style.transitionDelay = `${150 + i * 80}ms`; }));
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { threshold: 0.2 });
    cards.forEach((c) => io.observe(c));
    return () => { io.disconnect(); root.classList.remove("sv-js"); };
  }, []);
  return null;
}
