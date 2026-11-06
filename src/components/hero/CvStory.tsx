"use client";
import { useRef } from "react";
import { useGsapSection, type Motion } from "@/lib/motion";

// All in screens of scroll. Keep the total in step with .story-track's height in globals.css.
const PARK = 0.4; // the CVs drop clear of the heading's area
const HEAD_IN = [0.38, 0.6]; // the heading settles at the top
const SPREAD = 0.6; // then the CVs move into place below it
const TRAVEL = 1;
const STEP = 0.5; // one card, three cards in all: about 150vh in place
const TOTAL = TRAVEL + STEP * 3;

/**
 * Hero to Problem section. The two sections share one sticky stage (its scroll length is set in CSS,
 * so nothing jumps when GSAP arrives or when the stage lets go). All timing is tied to scroll.
 */
function buildStory(root: HTMLElement, { gsap }: Motion) {
  const q = <T extends Element = HTMLElement>(s: string) => root.querySelector(s) as unknown as T;
  const all = <T extends Element = HTMLElement>(s: string) => [...root.querySelectorAll(s)] as unknown as T[];
  const stage = q(".story-stage");
  const cards = all("[data-card]");
  const dots = all("[data-dot]");
  const markers = all("[data-cv] [data-marker]");

  const s = stage.getBoundingClientRect();
  const local = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { left: r.left - s.left, top: r.top - s.top, width: r.width };
  };
  const toSlot = (move: Element, slot: Element) => {
    const from = local(move);
    const to = local(slot);
    return { x: to.left - from.left, y: to.top - from.top, scale: to.width / from.width };
  };
  const good = q("[data-cv='good']");
  const bad = q("[data-cv='a']");
  const goodTo = toSlot(good, q("[data-slot='good']"));
  const badTo = toSlot(bad, q("[data-slot='a']"));

  gsap.set(cards, { opacity: 0, y: 16 });
  gsap.set(markers, { opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: true },
  });

  // The hero leaves, and the CVs drop below where the heading will sit.
  tl.fromTo(q("[data-hero-copy]"), { y: 0, opacity: 1 }, { y: -s.height * 0.6, opacity: 0, duration: 0.34 }, 0);
  tl.to(q("[data-cv='b']"), { autoAlpha: 0, duration: 0.3 }, 0);
  tl.to(good, { y: goodTo.y, duration: PARK, ease: "power1.inOut" }, 0);
  tl.to(bad, { y: badTo.y, duration: PARK, ease: "power1.inOut" }, 0);
  // The heading settles in the space they cleared.
  tl.fromTo(q(".problem-head"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: HEAD_IN[1] - HEAD_IN[0], ease: "power1.out" }, HEAD_IN[0]);
  // Then they spread to either side of the card slot and straighten.
  tl.to(good, { x: goodTo.x, scale: goodTo.scale, duration: TRAVEL - SPREAD, ease: "power1.inOut" }, SPREAD);
  tl.to(bad, { x: badTo.x, scale: badTo.scale, duration: TRAVEL - SPREAD, ease: "power1.inOut" }, SPREAD);
  tl.to(q("[data-cv='good'] [data-tilt]"), { rotation: 0, duration: TRAVEL - SPREAD, ease: "power1.inOut" }, SPREAD);
  tl.to(q("[data-cv='a'] [data-tilt]"), { rotation: 0, duration: TRAVEL - SPREAD, ease: "power1.inOut" }, SPREAD);
  tl.to(markers, { opacity: 0.4, duration: 0.08 }, TRAVEL - 0.08);
  tl.to(q(".p-dots"), { opacity: 1, duration: 0.08 }, TRAVEL - 0.08);

  // One card at a time, each lighting up a matching pair of areas.
  cards.forEach((card, i) => {
    const t = TRAVEL + i * STEP;
    const pair = [`a-${i}`, `good-${i}`];
    const boxes = pair.map((id) => q(`[data-cv] [data-hl='${id}']`));
    const dots2 = pair.map((id) => q(`[data-cv] [data-marker='${id}']`));
    tl.to(card, { opacity: 1, y: 0, duration: 0.08 }, t);
    tl.to(dots[i], { opacity: 1, duration: 0.04 }, t);
    tl.to(boxes, { opacity: 1, duration: 0.08 }, t + 0.02);
    tl.to(dots2, { opacity: 1, duration: 0.04 }, t + 0.02);
    tl.to(dots2, { scale: 1.35, duration: 0.05 }, t + 0.02);
    tl.to(dots2, { scale: 1, duration: 0.07 }, t + 0.07);
    if (i < cards.length - 1) {
      const out = t + STEP - 0.08;
      tl.to(card, { opacity: 0, y: -16, duration: 0.08 }, out);
      tl.to(dots[i], { opacity: 0.25, duration: 0.04 }, out);
      tl.to(boxes, { opacity: 0, duration: 0.08 }, out);
      tl.to(dots2, { opacity: 0.4, duration: 0.08 }, out);
    }
  });
  tl.to({}, { duration: 0.001 }, TOTAL - 0.001);
}

export default function CvStory({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGsapSection(root, ({ desktop, compact }, motion) => {
    const { gsap, ScrollTrigger } = motion;
    const el = root.current;
    if (!el) return;

    if (compact) {
      gsap.utils.toArray<HTMLElement>("[data-card]", el).forEach((card) => {
        gsap.from(card, { opacity: 0, y: 24, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 90%", once: true } });
      });
      return;
    }
    if (!desktop) return;

    let ctx: ReturnType<typeof gsap.context> | undefined;
    const build = () => {
      ctx?.revert();
      ctx = gsap.context(() => buildStory(el, motion), el);
      ScrollTrigger.refresh();
    };
    build();

    // Positions come from measuring the layout, so they are rebuilt when the window changes size.
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(build, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      ctx?.revert();
    };
  });

  return (
    <div ref={root} className="story-track">
      <div className="story-stage">{children}</div>
      <noscript>
        <style>{`.story-track{height:auto!important}.story-stage{position:static!important;height:auto!important;overflow:visible!important}.hero,.problem{position:relative!important;height:auto!important}.problem-head,.p-card{opacity:1!important}`}</style>
      </noscript>
    </div>
  );
}
