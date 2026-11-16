"use client";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { enableMeta, sha256, visitorId } from "@/lib/meta";
import { GA4_ID, META_PIXEL_ID, gaAllowed, gaInit, trackFunnel } from "@/lib/analytics";
import { resetPageOnce, send } from "@/lib/track";

/** Renders and does nothing until NEXT_PUBLIC_GA_ID or NEXT_PUBLIC_META_PIXEL_ID is set. */
export default function Analytics({ allowLocal = false }: { allowLocal?: boolean }) {
  const path = usePathname();
  const enabled = !!(GA4_ID || META_PIXEL_ID);
  // Meta: never on localhost unless META_TEST_EVENT_CODE is set (then events show in Test events).
  const [pixel, setPixel] = useState<{ vid: string; ext: string } | null>(null);
  useEffect(() => {
    if (!META_PIXEL_ID || (!allowLocal && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname))) return;
    enableMeta();
    // fbc: keep the click id from ?fbclid as an _fbc cookie for 90 days when Meta has not set one.
    const fbclid = new URLSearchParams(location.search).get("fbclid");
    if (fbclid && !/(?:^|; )_fbc=/.test(document.cookie)) document.cookie = `_fbc=fb.1.${Date.now()}.${fbclid}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`;
    // external_id: sha256(px_vid) in the Pixel's advanced matching, the same value the Conversions API sends.
    const vid = visitorId();
    void sha256(vid).then((ext) => setPixel({ vid, ext: ext ?? vid }));
  }, [allowLocal]);
  // GA4: loads only on the public site (gtag's own first page_view is off).
  const [ga, setGa] = useState(false);
  useEffect(() => { if (GA4_ID && gaAllowed(location.hostname)) { gaInit(); setGa(true); } }, []);
  const search = useSearchParams()?.toString() ?? "";

  // PageView (Meta + GA4) once per URL, after both are set up. Service pages also send ViewContent once per path.
  const ready = !!pixel || ga;
  useEffect(() => {
    if (!ready || path.startsWith("/api")) return;
    resetPageOnce();
    send("PageView", { key: path + "?" + search });
    if (path.startsWith("/services/") && path.split("/").pop()) {
      const slug = path.split("/").pop() ?? "";
      send("ViewContent", { key: "service:" + path, name: document.title.split("|")[0].trim(), ids: [slug], currency: "PKR" });
    }
  }, [ready, path, search]);

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
      const wa = (e.target as Element).closest<HTMLAnchorElement>("a[href*='wa.me'], a[href*='whatsapp.com']");
      if (wa) {
        const where = wa.dataset.cta || wa.closest<HTMLElement>("[data-cta]")?.dataset.cta || wa.closest("section,header,footer,aside")?.getAttribute("aria-label") || (wa.closest("footer") ? "footer" : path);
        send("Contact", { key: "wa:" + Date.now(), name: String(where).slice(0, 60), ga: { method: "whatsapp", cta: String(where).slice(0, 60), link_url: wa.href } });
      }
      const cta = (e.target as Element).closest<HTMLElement>("[data-cta]")?.dataset.cta ?? "";
      const card = (e.target as Element).closest<HTMLElement>(".price-card");
      const chosen = cta.match(/-(?:choose|order)-(cv-starter|ats-career|international-pro|executive)$/)?.[1];
      if (chosen && card && !(e.target as Element).closest("button")) trackFunnel("cart", item(card, chosen));
      else if (/^service-.+-order$/.test(cta)) trackFunnel("cart", { name: document.title.split("|")[0].trim(), ids: [cta.replace(/^service-|-order$/g, "")], value: 0, currency: "PKR" });
    };
    document.addEventListener("click", onClick);
    // ViewContent: the plans section in view, once per session, valued at the lowest plan price.
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const cards = [...document.querySelectorAll<HTMLElement>(".price-card")].map((c) => item(c, ""));
      if (!cards.length) return;
      const low = cards.reduce((a, b) => (b.value && b.value < a.value ? b : a));
      trackFunnel("view", { name: "Plans", ids: cards.map((c) => c.ids[0]), value: low.value, currency: low.currency }, "plans:" + low.currency);
    }, { threshold: 0.25 });
    const plans = document.querySelector("#plans, #pricing");
    if (plans) io.observe(plans);
    return () => {
      document.removeEventListener("click", onClick);
      io.disconnect();
    };
  }, [enabled, path]);

  if (!enabled) return null;
  return (
    <>
      {GA4_ID && ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
        </>
      )}
      {META_PIXEL_ID && pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}',{external_id:'${pixel.ext.replace(/[^\w-]/g, "")}'});`}</Script>
      )}
      {META_PIXEL_ID && (
        // eslint-disable-next-line @next/next/no-img-element
        <noscript><img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} /></noscript>
      )}
    </>
  );
}
