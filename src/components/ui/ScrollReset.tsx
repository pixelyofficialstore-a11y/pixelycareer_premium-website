"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { refreshScroll } from "@/lib/motion";
import { anchorTarget, anchorY } from "@/lib/anchor";

type Lenis = { scrollTo: (target: number, options?: { immediate?: boolean; force?: boolean; duration?: number }) => void; resize?: () => void };
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
    const hash = location.hash.slice(1);
    // Lenis keeps the page height it measured last, and the page is still growing: measure again first, or a far section comes up short.
    const to = (y: number) => { if (w.__lenis) { w.__lenis.resize?.(); w.__lenis.scrollTo(y, { immediate: true, force: true }); } else window.scrollTo(0, y); };
    const wanted = back ? saved()[location.pathname + location.search] : undefined;
    // While the page is still growing, keep placing it and do not record the in-between positions.
    if (typeof wanted === "number") w.__pixelyHold = true;
    const go = (refresh: unknown = true) => {
      if (back) {
        if (typeof wanted === "number") to(wanted);
      } else if (hash) {
        // The section's heading (data-anchor), just below the fixed header. #how-it-works is an alias of #process.
        const target = anchorTarget(hash);
        if (target) to(anchorY(target));
      } else to(0);
      if (refresh !== false) refreshScroll();
    };
    go();
    // Images and fonts can still move things, so place it again once they settle.
    // In-app browsers (Facebook, Instagram) can ignore the hash or render late, and the page above keeps growing as it loads:
    // for a hash, place it again on every layout change for 6 seconds, until the visitor scrolls themselves.
    const timers = back || hash ? [150, 400, 800, 1300, ...(hash ? [2000, 3000, 4500, 6000] : [])].map((ms) => window.setTimeout(go, ms)) : [];
    const ro = hash && !back && typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => go(false)) : null;
    ro?.observe(document.body);
    const stop = () => { timers.forEach(window.clearTimeout); ro?.disconnect(); window.removeEventListener("load", go); };
    if (ro) timers.push(window.setTimeout(() => ro.disconnect(), 6000));
    if (hash && !back) { window.addEventListener("wheel", stop, { once: true, passive: true }); window.addEventListener("touchstart", stop, { once: true, passive: true }); window.addEventListener("keydown", stop, { once: true }); window.addEventListener("load", go, { once: true }); }
    if (typeof wanted === "number") timers.push(window.setTimeout(() => { w.__pixelyHold = false; }, 1500));
    document.fonts?.ready.then(() => refreshScroll());
    return () => { stop(); window.removeEventListener("wheel", stop); window.removeEventListener("touchstart", stop); window.removeEventListener("keydown", stop); w.__pixelyHold = false; };
  }, [pathname]);

  // Hash links on the same page (See plans, ad links opened again, a hash added after load): land on the heading too.
  useEffect(() => {
    const w = window as unknown as { __lenis?: Lenis };
    const glide = (hash: string, smooth: boolean) => {
      const target = anchorTarget(hash);
      if (!target) return false;
      const y = anchorY(target);
      w.__lenis?.resize?.();
      if (w.__lenis) w.__lenis.scrollTo(y, smooth ? { force: true } : { immediate: true, force: true });
      else window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
      return true;
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      if (!glide(url.hash, true)) return;
      e.preventDefault();
      // Phones lay out far sections only as they come near, so the heading can move while the page glides there:
      // check again as it arrives and correct, unless the visitor takes over.
      let off = false;
      const cancel = () => { off = true; };
      window.addEventListener("wheel", cancel, { once: true, passive: true });
      window.addEventListener("touchstart", cancel, { once: true, passive: true });
      [700, 1300, 2000].forEach((ms) => window.setTimeout(() => {
        const t = anchorTarget(url.hash);
        if (!off && t && Math.abs(anchorY(t) - window.scrollY) > 2) glide(url.hash, true);
      }, ms));
      if (url.hash !== location.hash) history.pushState(history.state, "", url.pathname + url.search + url.hash);
    };
    const onHash = () => glide(location.hash, false);
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", onHash);
    return () => { document.removeEventListener("click", onClick, true); window.removeEventListener("hashchange", onHash); };
  }, []);
  return null;
}
