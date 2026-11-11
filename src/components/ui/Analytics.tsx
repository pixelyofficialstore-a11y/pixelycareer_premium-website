"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { GA4_ID, META_PIXEL_ID, trackFunnel } from "@/lib/analytics";

/** Renders and does nothing until NEXT_PUBLIC_GA4_ID or NEXT_PUBLIC_META_PIXEL_ID is set. */
export default function Analytics() {
  const path = usePathname();
  const enabled = !!(GA4_ID || META_PIXEL_ID);

  useEffect(() => {
    if (!enabled) return;
    // A pricing card as a commerce item: its name, its price as shown, and the page's currency.
    const item = (card: HTMLElement, id: string) => {
      const name = card.querySelector(".price-name")?.textContent ?? "";
      const price = [...card.querySelectorAll("[class*='price']")].map((n) => n.textContent ?? "").filter((t) => /\d/.test(t) && !/\d.*\d{4,}.*\d{4,}/.test(t)).pop() ?? "";
      const pk = /Rs|PKR/.test(card.textContent ?? "");
      return { name, ids: [id || name.toLowerCase().replace(/\s+/g, "-")], value: Number(price.replace(/[^\d]/g, "")) || 0, currency: pk ? "PKR" : /£/.test(price) ? "GBP" : /AED/.test(price) ? "AED" : /SAR/.test(price) ? "SAR" : "USD" };
    };
    const onClick = (e: MouseEvent) => {
      const cta = (e.target as Element).closest<HTMLElement>("[data-cta]")?.dataset.cta ?? "";
      const card = (e.target as Element).closest<HTMLElement>(".price-card");
      const chosen = cta.match(/-(?:choose|order)-(ats-career|international-pro|executive)$/)?.[1];
      if (chosen && card) trackFunnel("cart", item(card, chosen));
      else if (/^service-.+-order$/.test(cta)) trackFunnel("cart", { name: document.title.split("|")[0].trim(), ids: [cta.replace(/^service-|-order$/g, "")], value: 0, currency: "USD" });
    };
    document.addEventListener("click", onClick);
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        trackFunnel("view", item(entry.target as HTMLElement, ""));
      }
    });
    document.querySelectorAll(".price-card").forEach((c) => io.observe(c));
    return () => {
      document.removeEventListener("click", onClick);
      io.disconnect();
    };
  }, [enabled, path]);

  if (!enabled) return null;
  return (
    <>
      {GA4_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${GA4_ID}');`}</Script>
        </>
      )}
      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}</Script>
      )}
    </>
  );
}
