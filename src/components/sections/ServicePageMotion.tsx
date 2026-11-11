"use client";
import { useEffect } from "react";

/** Service pages: each [data-sp] section plays its entrance once when it scrolls in. */
export default function ServicePageMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".sp");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.classList.add("sp-js");
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { threshold: 0.2 });
    root.querySelectorAll("[data-sp]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
