"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MARKETS, orderHref } from "@/config/markets";
import { useMarket } from "./useMarket";
import { StickyOffer, useLive } from "@/components/offer/Offer";
import { cartCount, openCart, useCart } from "@/lib/cart";
import { WA_HELLO, WaGlyph } from "@/components/cart/CartDrawer";
import { OFFER_WA } from "@/lib/site";

/** Small screen order bar on every page except /order: appears once the hero has scrolled out, hides near the final call to action. */
export default function StickyBar() {
  const market = useMarket();
  const path = usePathname();
  const [show, setShow] = useState(false);
  const footerIn = useRef(false);
  const off = path === "/checkout" || path.startsWith("/order/");
  // /offer: "Start order" and "WhatsApp", hidden while the hero buttons are on screen.
  const landing = path === "/offer";
  // pk: the November Sale replaces "Start your order" while it is on, and hides while the offer band is in view.
  const { live: saleLive } = useLive(market, 60_000);
  const pk = market === "pk";
  const sale = saleLive && !pk;
  const count = cartCount(useCart());
  // pk: "See plans" until the plans have been seen and something is in the cart, then "Place your order".
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!pk) return;
    try { if (sessionStorage.getItem("pixely-plans-seen")) { setSeen(true); return; } } catch {}
    const el = document.getElementById("plans");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); try { sessionStorage.setItem("pixely-plans-seen", "1"); } catch {} io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [pk, path]);

  useEffect(() => {
    if (off) return;
    const onScroll = () => {
      const hero = document.getElementById("top") ?? document.querySelector("main > section, main > div > section, main > div");
      const cta = document.getElementById("final-cta");
      const actions = landing ? document.querySelector("[data-hero-actions]")?.getBoundingClientRect() : null;
      const heroGone = actions ? actions.bottom < 0 || actions.top > window.innerHeight : hero ? hero.getBoundingClientRect().bottom < 0 : window.scrollY > 600;
      const ctaNear = cta ? cta.getBoundingClientRect().top <= window.innerHeight - 80 : false;
      const band = document.getElementById("offer")?.getBoundingClientRect();
      const bandInView = !!band && band.top < window.innerHeight && band.bottom > 0;
      const visible = heroGone && !ctaNear && !(sale && bandInView) && !footerIn.current;
      setShow(visible);
      document.documentElement.classList.toggle("has-sticky-bar", visible);
    };
    // Hidden while the footer is on screen, so the page ends at the footer with no blank space under it.
    const footer = document.querySelector("footer");
    const io = footer ? new IntersectionObserver(([e]) => { footerIn.current = e.isIntersecting; onScroll(); }) : null;
    if (footer && io) io.observe(footer);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io?.disconnect();
      document.documentElement.classList.remove("has-sticky-bar");
    };
  }, [off, path, sale, landing]);

  // --sticky-h: the bar's real height (its bottom padding already includes the safe area), used for the page's bottom padding.
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty("--sticky-h", `${el.offsetHeight}px`);
    const ro = new ResizeObserver(set);
    ro.observe(el);
    set();
    return () => ro.disconnect();
  }, [off]);
  if (off) return null;
  return (
    <div
      ref={bar}
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-40 transition-[transform,opacity] duration-200 ease-out-soft lg:hidden ${sale ? "" : "border-t border-navy/10 bg-white px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]"} ${show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
    >
      {landing ? (
        <div className="flex gap-2">
          {count ? <button type="button" onClick={openCart} className="btn btn-primary min-h-12 flex-1" data-cta="offer-sticky-checkout">Start your order</button>
            : <a href="#pricing" className="btn btn-primary min-h-12 flex-1" data-cta="offer-sticky-see-plans">See plans</a>}
          <a href={OFFER_WA} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" data-cta="offer-sticky-whatsapp" className="grid h-12 w-12 flex-none place-items-center rounded-full bg-[#010c28] text-white"><WaGlyph size={24} /></a>
        </div>
      ) : pk ? (
        <div className="flex gap-2">
          {seen && count ? (
            <button type="button" onClick={openCart} className="btn btn-primary flex-1" data-cta="sticky-checkout">Place your order</button>
          ) : (
            <a href="#plans" onClick={(e) => { if (!document.getElementById("plans")) { e.preventDefault(); location.href = "/pricing#plans"; } }} className="btn btn-primary flex-1" data-cta="sticky-see-plans">See plans</a>
          )}
          <a href={WA_HELLO} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" data-cta="sticky-whatsapp" className="grid h-12 w-12 flex-none place-items-center rounded-full bg-[#010c28] text-white"><WaGlyph size={24} /></a>
        </div>
      ) : sale ? <StickyOffer /> : <Link href={orderHref(MARKETS[market])} className="btn btn-primary w-full" data-cta="sticky-order">
        Start your order →
      </Link>}
    </div>
  );
}
