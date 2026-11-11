"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MARKETS, orderHref } from "@/config/markets";
import { useMarket } from "./useMarket";

/** Small screen order bar on every page except /order: appears once the hero has scrolled out, hides near the final call to action. */
export default function StickyBar() {
  const market = useMarket();
  const path = usePathname();
  const [show, setShow] = useState(false);
  const off = path === "/order" || path.startsWith("/order/");

  useEffect(() => {
    if (off) return;
    const onScroll = () => {
      const hero = document.getElementById("top") ?? document.querySelector("main > section, main > div > section, main > div");
      const cta = document.getElementById("final-cta");
      const heroGone = hero ? hero.getBoundingClientRect().bottom < 0 : window.scrollY > 600;
      const ctaNear = cta ? cta.getBoundingClientRect().top <= window.innerHeight - 80 : false;
      const visible = heroGone && !ctaNear;
      setShow(visible);
      document.documentElement.classList.toggle("has-sticky-bar", visible);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.documentElement.classList.remove("has-sticky-bar");
    };
  }, [off, path]);

  if (off) return null;
  return (
    <div
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-white px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-transform duration-300 ease-out-soft lg:hidden ${show ? "translate-y-0" : "translate-y-full"}`}
    >
      <Link href={orderHref(MARKETS[market])} className="btn btn-primary w-full" data-cta="sticky-order">
        Start your order →
      </Link>
    </div>
  );
}
