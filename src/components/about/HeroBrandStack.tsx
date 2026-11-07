"use client";

import { useEffect, useRef } from "react";
import { scheduleMotion } from "@/lib/motion";

export default function HeroBrandStack() {
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      stack.classList.add("is-ready");
      return;
    }
    let cancelled = false;
    let teardown = () => {};
    scheduleMotion(({ gsap }) => {
      if (cancelled || motionQuery.matches) return;
      const cards = Array.from(stack.querySelectorAll<HTMLElement>(".brand-layer"));
      let ready = false;
      let move: (event: PointerEvent) => void = () => {};
      let reset = () => {};
      const context = gsap.context(() => {
        const xTo = cards.map((card) => gsap.quickTo(card, "x", { duration: 0.4, ease: "power2.out" }));
        const yTo = cards.map((card) => gsap.quickTo(card, "y", { duration: 0.4, ease: "power2.out" }));
        move = (event) => {
          if (!ready) return;
          const bounds = stack.getBoundingClientRect();
          const x = Math.max(-8, Math.min(8, ((event.clientX - bounds.left) / bounds.width - 0.5) * 16));
          const y = Math.max(-8, Math.min(8, ((event.clientY - bounds.top) / bounds.height - 0.5) * 16));
          cards.forEach((_, index) => {
            const depth = [0.6, 0.85, 1][index];
            xTo[index](x * depth);
            yTo[index](y * depth);
          });
        };
        reset = () => {
          xTo.forEach((set) => set(0));
          yTo.forEach((set) => set(0));
        };
        gsap.fromTo(cards, {
          opacity: 0.6,
          x: (index) => [68, -20, 0][index],
          y: (index) => [42, 28, 0][index],
          rotation: 0,
          scale: 0.76,
        }, {
          opacity: 1,
          x: 0,
          y: 0,
          rotation: (index) => [-9, 7, 1.5][index],
          scale: (index) => [0.94, 0.96, 0.98][index],
          duration: 0.9,
          ease: "power3.out",
          onComplete: () => {
            ready = true;
            stack.classList.add("is-ready");
          },
        });
      }, stack);
      stack.addEventListener("pointermove", move);
      stack.addEventListener("pointerleave", reset);
      teardown = () => {
        stack.removeEventListener("pointermove", move);
        stack.removeEventListener("pointerleave", reset);
        context.revert();
      };
    });
    const changeMotion = () => {
      if (motionQuery.matches) {
        teardown();
        stack.classList.add("is-ready");
      }
    };
    motionQuery.addEventListener("change", changeMotion);
    return () => {
      cancelled = true;
      teardown();
      motionQuery.removeEventListener("change", changeMotion);
    };
  }, []);

  return (
    <div className="brand-stage" aria-label="A CV, LinkedIn profile and portfolio website for James Carter">
      <div ref={stackRef} className="brand-stack">
        <div className="portfolio-card brand-layer" aria-hidden="true">
          <div className="browser-top">
            <span /><span /><span />
            <i>jamescarter.com</i>
          </div>
          <div className="portfolio-inner">
            <small>PROJECT MANAGER</small>
            <strong>James<br />Carter</strong>
            <div className="portfolio-blue">
              <span>Turning complex work</span>
              <span>into clear outcomes.</span>
            </div>
            <div className="portfolio-lines"><i /><i /><i /></div>
            <div className="portfolio-foot"><b>Selected work</b><span>01 / 03</span></div>
          </div>
        </div>
        <div className="linkedin-card brand-layer" aria-hidden="true">
          <div className="linkedin-brand">in</div>
          <div className="profile-top">
            <div className="profile-avatar">JC</div>
            <div className="profile-copy">
              <b>James Carter</b>
              <span>Project Manager | Logistics | Agile</span>
              <small>500+ connections</small>
            </div>
          </div>
          <div className="profile-rule" />
          <div className="profile-about"><b>About</b><i /><i /><i /></div>
          <div className="profile-bottom"><span>Open to opportunities</span><span>View profile ↗</span></div>
        </div>
        <div className="cv-card brand-layer" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cv/us/good.webp" alt="" />
          <span className="cv-tag">ATS READY</span>
        </div>
      </div>
      <div className="stack-pill">CV · LinkedIn · Portfolio</div>
      <style jsx>{`
        .brand-stage {
          position: relative;
          width: 100%;
          height: 490px;
          max-width: 560px;
          margin: 0 auto;
          perspective: 1100px;
        }
        .brand-stack {
          position: absolute;
          inset: 0;
        }
        .brand-layer {
          position: absolute;
          overflow: hidden;
          background: #fff;
          border: 1px solid rgba(1, 12, 40, .08);
          border-radius: 14px;
          box-shadow: 0 24px 60px rgba(22, 47, 102, .13), 0 4px 12px rgba(1, 12, 40, .06);
          transform-origin: center;
          opacity: 1;
        }
        .portfolio-card {
          z-index: 1;
          width: 270px;
          height: 336px;
          left: 8%;
          top: 42px;
          transform: translate3d(0, 0, 0) rotate(-9deg) scale(.94);
        }
        .linkedin-card {
          z-index: 2;
          width: 310px;
          height: 218px;
          right: 1%;
          top: 78px;
          padding: 20px;
          transform: translate3d(0, 0, 0) rotate(7deg) scale(.96);
        }
        .cv-card {
          z-index: 3;
          width: 250px;
          height: 354px;
          left: 27%;
          top: 116px;
          border-radius: 8px;
          transform: translate3d(0, 0, 0) rotate(1.5deg) scale(.98);
        }
        .cv-card img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; }
        .cv-tag {
          position: absolute;
          right: 10px;
          bottom: 10px;
          padding: 6px 9px;
          border-radius: 5px;
          color: #0048ff;
          background: #eef3ff;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .12em;
        }
        .browser-top {
          display: flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 10px;
          border-bottom: 1px solid #e8edf5;
          background: #fbfcfe;
        }
        .browser-top span { width: 5px; height: 5px; border-radius: 50%; background: #cbd4e2; }
        .browser-top i { margin-left: 7px; color: #8290a5; font-size: 8px; font-style: normal; }
        .portfolio-inner { padding: 20px 18px; color: #010c28; }
        .portfolio-inner small { font-size: 7px; font-weight: 800; letter-spacing: .16em; color: #0048ff; }
        .portfolio-inner strong { display: block; margin: 8px 0 14px; font-size: 32px; line-height: .94; letter-spacing: -.06em; }
        .portfolio-blue {
          display: flex;
          flex-direction: column;
          padding: 12px 11px;
          background: #0048ff;
          color: #fff;
          font-size: 9px;
          font-weight: 600;
          line-height: 1.5;
        }
        .portfolio-lines { display: grid; gap: 6px; margin-top: 14px; }
        .portfolio-lines i, .profile-about i { display: block; height: 4px; border-radius: 4px; background: #e6ebf2; }
        .portfolio-lines i:nth-child(1) { width: 94%; }
        .portfolio-lines i:nth-child(2) { width: 78%; }
        .portfolio-lines i:nth-child(3) { width: 59%; }
        .portfolio-foot { display: flex; justify-content: space-between; margin-top: 20px; color: #738099; font-size: 8px; }
        .portfolio-foot b { color: #010c28; }
        .linkedin-brand {
          display: grid;
          place-items: center;
          width: 20px;
          height: 20px;
          border-radius: 4px;
          background: #0a66c2;
          color: white;
          font-size: 13px;
          font-weight: 800;
        }
        .profile-top { display: flex; align-items: center; gap: 12px; margin-top: 13px; }
        .profile-avatar {
          display: grid;
          flex: none;
          place-items: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #e9efff;
          color: #0048ff;
          font-size: 14px;
          font-weight: 700;
        }
        .profile-copy { display: grid; gap: 4px; color: #192844; }
        .profile-copy b { font-size: 12px; }
        .profile-copy span { font-size: 8px; }
        .profile-copy small { color: #748198; font-size: 8px; }
        .profile-rule { height: 1px; margin: 14px 0 12px; background: #e8edf5; }
        .profile-about { display: grid; gap: 5px; }
        .profile-about b { margin-bottom: 1px; color: #172541; font-size: 9px; }
        .profile-about i { height: 3px; }
        .profile-about i:nth-child(2) { width: 95%; }
        .profile-about i:nth-child(3) { width: 80%; }
        .profile-about i:nth-child(4) { width: 54%; }
        .profile-bottom { display: flex; justify-content: space-between; margin-top: 12px; color: #0a66c2; font-size: 8px; font-weight: 600; }
        .stack-pill {
          position: absolute;
          z-index: 5;
          left: 0;
          bottom: 44px;
          padding: 13px 17px;
          border: 1px solid #e4eaf5;
          border-radius: 999px;
          background: #fff;
          color: #263959;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 10px 32px rgba(22,47,102,.1);
        }
        .is-ready .portfolio-card { animation: idle-left 7s ease-in-out infinite; }
        .is-ready .linkedin-card { animation: idle-right 8s ease-in-out infinite; }
        .is-ready .cv-card { animation: idle-front 7.5s ease-in-out infinite; }
        @keyframes idle-left { 0%,100% { translate: 0 0; } 50% { translate: 0 -5px; } }
        @keyframes idle-right { 0%,100% { translate: 0 0; } 50% { translate: 0 -6px; } }
        @keyframes idle-front { 0%,100% { translate: 0 0; } 50% { translate: 0 -4px; } }
        @media (max-width: 767px) {
          .brand-stage { height: 390px; max-width: 440px; margin-top: 12px; }
          .portfolio-card { width: 210px; height: 282px; left: 4%; top: 26px; }
          .linkedin-card { width: 245px; height: 185px; right: 0; top: 52px; padding: 14px; }
          .cv-card { width: 190px; height: 270px; left: 26%; top: 94px; }
          .portfolio-inner { padding: 15px 14px; }
          .portfolio-inner strong { font-size: 27px; }
          .portfolio-blue { padding: 9px; }
          .portfolio-lines { margin-top: 10px; }
          .portfolio-foot { margin-top: 12px; }
          .profile-top { gap: 9px; margin-top: 9px; }
          .profile-avatar { width: 40px; height: 40px; }
          .profile-copy span { font-size: 7px; }
          .profile-rule { margin: 10px 0 9px; }
          .profile-bottom { margin-top: 8px; font-size: 7px; }
          .stack-pill { left: 1%; bottom: 20px; padding: 10px 12px; font-size: 9px; gap: 7px; }
        }
        @media (max-width: 380px) {
          .brand-stage { height: 340px; }
          .portfolio-card { width: 185px; height: 252px; left: 2%; }
          .linkedin-card { width: 218px; height: 168px; right: -1%; }
          .cv-card { width: 165px; height: 234px; left: 27%; top: 84px; }
          .stack-pill { bottom: 12px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .brand-layer, .is-ready .brand-layer { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  );
}
