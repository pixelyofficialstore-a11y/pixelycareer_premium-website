"use client";
import { useEffect, type RefObject } from "react";

/*
 * GSAP is not part of the initial JavaScript. It loads once the page is idle, and each section
 * then sets up in its own short task, so animation setup never blocks first paint or input.
 */
type Gsap = typeof import("gsap").gsap;
type ST = typeof import("gsap/ScrollTrigger").ScrollTrigger;
export type Motion = { gsap: Gsap; ScrollTrigger: ST };
export type MotionConditions = { desktop: boolean; compact: boolean; reduced: boolean };

const MQ = {
  desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  compact: "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
};

let loading: Promise<Motion> | null = null;
export function loadMotion() {
  loading ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
    g.gsap.registerPlugin(s.ScrollTrigger);
    return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
  });
  return loading;
}

/** Re-measures pinned sections after the page height changes. Harmless if GSAP hasn't loaded. */
export function refreshScroll() {
  loading?.then((m) => m.ScrollTrigger.refresh());
}

/** Resolves when the loading screen has finished and the browser has a free moment. */
export function whenPageSettled(run: () => void) {
  const idle = () => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 1200 });
    else window.setTimeout(run, 300);
  };
  const html = document.documentElement;
  if (html.getAttribute("data-intro") !== "on") return idle();
  const mo = new MutationObserver(() => {
    if (html.getAttribute("data-intro") !== "on") {
      mo.disconnect();
      idle();
    }
  });
  mo.observe(html, { attributes: true, attributeFilter: ["data-intro"] });
}

/** Phones: nothing animated is on screen until the user moves, so GSAP waits for the first gesture. */
function whenMotionNeeded(run: () => void) {
  if (window.innerWidth >= 1024) return whenPageSettled(run);
  let fired = false;
  const events = ["scroll", "pointerdown", "keydown"] as const;
  const fire = () => {
    if (fired) return;
    fired = true;
    events.forEach((e) => window.removeEventListener(e, fire));
    window.clearTimeout(timer);
    run();
  };
  const timer = window.setTimeout(fire, 8000);
  events.forEach((e) => window.addEventListener(e, fire, { passive: true }));
  if (window.scrollY > 0) fire();
}

const queue: ((m: Motion) => void)[] = [];
let running = false;

async function drain() {
  const m = await loadMotion();
  while (queue.length) {
    queue.shift()!(m);
    await new Promise((r) => setTimeout(r, 0)); // Hand the main thread back between sections
  }
  running = false;
  m.ScrollTrigger.refresh();
}

/** Runs a job in the shared, one-at-a-time setup queue. */
export function scheduleMotion(job: (m: Motion) => void) {
  queue.push(job);
  if (!running) {
    running = true;
    whenMotionNeeded(drain);
  }
}

/** Scoped GSAP setup with responsive + reduced-motion branches, reverted on unmount. */
export function useGsapSection(
  scope: RefObject<HTMLElement | null>,
  setup: (c: MotionConditions, m: Motion) => void | (() => void),
) {
  useEffect(() => {
    let cancelled = false;
    let revert: (() => void) | undefined;
    scheduleMotion((m) => {
      if (cancelled) return;
      const mm = m.gsap.matchMedia(scope.current ?? undefined);
      mm.add(MQ, (ctx) => setup(ctx.conditions as MotionConditions, m));
      revert = () => mm.revert();
    });
    return () => {
      cancelled = true;
      revert?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
