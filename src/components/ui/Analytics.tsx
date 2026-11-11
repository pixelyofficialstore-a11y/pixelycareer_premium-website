"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { enableMeta, track, visitorId } from "@/lib/meta";
import { GA4_ID, META_PIXEL_ID, trackFunnel } from "@/lib/analytics";

/** Renders and does nothing until NEXT_PUBLIC_GA4_ID or NEXT_PUBLIC_META_PIXEL_ID is set. */
export default function Analytics({ allowLocal = false }: { allowLocal?: boolean }) {
  const path = usePathname();
  const enabled = !!(GA4_ID || META_PIXEL_ID);
  // Meta: never on localhost unless META_TEST_EVENT_CODE is set (then events show in Test events).
  const [pixel, setPixel] = useState<{ vid: string } | null>(null);
  useEffect(() => {
    if (!META_PIXEL_ID || (!allowLocal && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname))) return;
    enableMeta();
    // fbc: keep the click id from ?fbclid as an _fbc cookie for 90 days when Meta has not set one.
    const fbclid = new URLSearchParams(location.search).get("fbclid");
    if (fbclid && !/(?:^|; )_fbc=/.test(document.cookie)) document.cookie = `_fbc=fb.1.${Date.now()}.${fbclid}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`;
    setPixel({ vid: visitorId() });
  }, [allowLocal]);
  // PageView on first load and on every route change, once per page.
  const lastPage = useRef("");
  useEffect(() => {
    if (!pixel || path.startsWith("/api") || lastPage.current === path) return;
    lastPage.current = path;
    track("PageView");
    if (/^\/services\/[^/]+/.test(path)) {
      const slug = path.split("/")[2];
      track("ViewContent", { content_name: document.title.split("|")[0].trim(), content_ids: [slug], content_type: "product" });
    }
  }, [pixel, path]);

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
      {META_PIXEL_ID && pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');`}</Script>
      )}
      {META_PIXEL_ID && (
        // eslint-disable-next-line @next/next/no-img-element
        <noscript><img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} /></noscript>
      )}
    </>
  );
}
