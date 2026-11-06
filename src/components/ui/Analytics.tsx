"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { GA4_ID, META_PIXEL_ID, trackEvent } from "@/lib/analytics";

/** Renders and does nothing until NEXT_PUBLIC_GA4_ID or NEXT_PUBLIC_META_PIXEL_ID is set. */
export default function Analytics() {
  const path = usePathname();
  const enabled = !!(GA4_ID || META_PIXEL_ID);

  useEffect(() => {
    if (!enabled) return;
    const onClick = (e: MouseEvent) => {
      const cta = (e.target as Element).closest<HTMLElement>("[data-cta]")?.dataset.cta ?? "";
      const chosen = cta.match(/-choose-(.+)$/)?.[1];
      if (chosen) trackEvent("begin_order", { package: chosen, cta });
    };
    document.addEventListener("click", onClick);
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        trackEvent("view_package", { package: entry.target.querySelector(".price-name")?.textContent });
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
