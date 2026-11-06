"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MARKETS, orderHref } from "@/config/markets";
import { NAV } from "@/lib/site";
import { useMarket } from "./useMarket";

export default function Header() {
  const market = MARKETS[useMarket()];
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const dialog = useRef<HTMLDivElement>(null);

  // Turns white once this 40px marker at the very top of the page has scrolled away.
  useEffect(() => {
    if (!sentinel.current) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    firstLink.current?.focus();
    const trigger = menuButton.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab" || !dialog.current) return;
      const items = dialog.current.querySelectorAll<HTMLElement>("a,button");
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <div ref={sentinel} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 h-10 w-px" />
      <header className={`fixed inset-x-0 z-50 border-b transition-[background-color,border-color,box-shadow,top] duration-300 ${scrolled ? "top-0 border-navy/10 bg-white shadow-[0_6px_18px_-12px_rgb(1_12_40/0.28)]" : "top-[var(--bar-h)] border-transparent bg-transparent"}`}>
        <div className="wrap grid h-[72px] grid-cols-[1fr_auto] items-center lg:h-20 lg:grid-cols-[1fr_auto_1fr]">
          <Link href={market.path} aria-label="Pixely Careers home" className="inline-flex min-h-11 w-fit items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-dark.svg" alt="" width={136} height={40} className="h-9 w-auto lg:h-10" />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="font-head inline-flex min-h-11 items-center text-[0.9375rem] font-medium transition-colors hover:text-vivid">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-2 lg:gap-4">
            <Link href={orderHref(market)} className="btn btn-primary btn-sm hidden lg:inline-flex" data-cta="header-order">
              Start Your Order
            </Link>
            <button
              ref={menuButton}
              type="button"
              className="-mr-2 inline-flex h-11 w-11 cursor-pointer items-center justify-center lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 8h18M3 16h18" />
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div ref={dialog} id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" data-lenis-prevent className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white lg:hidden">
            <div className="wrap flex h-[72px] flex-none items-center justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-dark.svg" alt="" width={136} height={40} className="h-9 w-auto" />
              <button type="button" className="-mr-2 inline-flex h-11 w-11 cursor-pointer items-center justify-center" aria-label="Close menu" onClick={() => setOpen(false)}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
              </button>
            </div>
            <nav aria-label="Mobile" className="wrap flex flex-1 flex-col py-8">
              <ul className="my-auto flex flex-col gap-2">
                {NAV.map((n, i) => (
                  <li key={n.href}>
                    <Link
                      ref={i === 0 ? firstLink : undefined}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="font-head inline-flex min-h-14 items-center text-[clamp(34px,10vw,56px)] leading-none font-semibold tracking-tight"
                    >
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={orderHref(market)} onClick={() => setOpen(false)} className="btn btn-primary mt-10 w-full" data-cta="menu-order">
                Start Your Order
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
