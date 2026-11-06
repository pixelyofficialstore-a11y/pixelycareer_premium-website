"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MARKETS, orderHref, type MarketKey } from "@/config/markets";
import { WHATSAPP_URL } from "@/lib/site";
import { WhatsApp } from "./Icons";

/** Small-screen order bar: appears after the hero, hides once the final call to action arrives. */
export default function StickyBar({ market }: { market: MarketKey }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("top");
      const cta = document.getElementById("final-cta");
      if (!hero || !cta) return;
      setShow(hero.getBoundingClientRect().bottom < 0 && cta.getBoundingClientRect().top > window.innerHeight - 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-white px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-transform duration-300 ease-out-soft lg:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3">
        <Link href={orderHref(MARKETS[market])} className="btn btn-primary flex-1" data-cta="sticky-order">
          Start Your Order
        </Link>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          data-cta="sticky-whatsapp"
          className="inline-flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full border border-navy/20 text-navy"
        >
          <WhatsApp />
        </a>
      </div>
    </div>
  );
}
