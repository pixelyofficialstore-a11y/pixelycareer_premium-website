"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { refreshScroll } from "@/lib/motion";

type Lenis = { scrollTo: (target: number, options?: { immediate?: boolean; force?: boolean }) => void };
const KEY = "pixely-scroll";
const saved = (): Record<string, number> => { try { return JSON.parse(sessionStorage.getItem(KEY) || "{}"); } catch { return {}; } };

/**
 * A new page opens at the top, or at its #hash below the sticky header.
 * Back and forward return to where the visitor was on that page.
 */
export default function ScrollReset() {
  const pathname = usePathname();

  // Remember each page's position as the visitor scrolls, and notice back/forward.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    let timer = 0;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if ((window as unknown as { __pixelyHold?: boolean }).__pixelyHold) return;
        const all = saved();
        all[location.pathname + location.search] = window.scrollY;
        sessionStorage.setItem(KEY, JSON.stringify(all));
      }, 120);
    };
    const saveNow = () => {
      if ((window as unknown as { __pixelyHold?: boolean }).__pixelyHold) return;
      const all = saved();
      all[location.pathname + location.search] = window.scrollY;
      sessionStorage.setItem(KEY, JSON.stringify(all));
    };
    document.addEventListener("click", saveNow, true);
    window.addEventListener("pagehide", saveNow);
    const onPop = () => { (window as unknown as { __pixelyPop?: boolean }).__pixelyPop = true; };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPop);
    return () => { document.removeEventListener("click", saveNow, true); window.removeEventListener("pagehide", saveNow); window.removeEventListener("scroll", onScroll); window.removeEventListener("popstate", onPop); window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    const w = window as unknown as { __lenis?: Lenis; __pixelyPop?: boolean; __pixelyHold?: boolean };
    const back = w.__pixelyPop === true;
    w.__pixelyPop = false;
    const hash = decodeURIComponent(location.hash.slice(1));
    const header = (document.querySelector("header") as HTMLElement | null)?.offsetHeight ?? 72;
    const to = (y: number) => { if (w.__lenis) w.__lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); };
    const wanted = back ? saved()[location.pathname + location.search] : undefined;
    // While the page is still growing, keep placing it and do not record the in-between positions.
    if (typeof wanted === "number") w.__pixelyHold = true;
    const go = () => {
      if (back) {
        if (typeof wanted === "number") to(wanted);
      } else if (hash) {
        const target = document.getElementById(hash);
        if (target) to(target.getBoundingClientRect().top + window.scrollY - header - 16);
      } else to(0);
      refreshScroll();
    };
    go();
    // Images and fonts can still move things, so place it again once they settle.
    const timers = back || hash ? [150, 400, 800, 1300].map((ms) => window.setTimeout(go, ms)) : [];
    if (typeof wanted === "number") timers.push(window.setTimeout(() => { w.__pixelyHold = false; }, 1500));
    document.fonts?.ready.then(() => refreshScroll());
    return () => { timers.forEach(window.clearTimeout); w.__pixelyHold = false; };
  }, [pathname]);
  return null;
}
