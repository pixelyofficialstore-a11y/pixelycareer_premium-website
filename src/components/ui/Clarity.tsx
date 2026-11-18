"use client";
/**
 * Microsoft Clarity (session recordings and heatmaps) on every page, /offer and /checkout included.
 * Loads only when NEXT_PUBLIC_CLARITY_ID is set, never on localhost, never for bots or test visits.
 * Form inputs are masked: Clarity masks input values by default, and every form also carries data-clarity-mask.
 */
import Script from "next/script";
import { useEffect, useState } from "react";
import { blocked } from "@/lib/track";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "zfoyofxs2s";
const UTM = ["utm_source", "utm_campaign", "utm_content"] as const;

type ClarityFn = (...a: unknown[]) => void;
/** Tags the Clarity session (queued until the tag loads). Safe to call anywhere. */
export function claritySet(key: string, value: string) {
  if (typeof window === "undefined" || !value) return;
  const w = window as unknown as { clarity?: ClarityFn & { q?: unknown[] } };
  // Same queue stub as the Clarity snippet, so tags set before the tag loads are kept.
  w.clarity = w.clarity || function (...a: unknown[]) { (w.clarity!.q = w.clarity!.q || []).push(a); };
  w.clarity("set", key, value);
}

export default function Clarity() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!CLARITY_ID || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || blocked()) return;
    setOn(true);
  }, []);
  // After the tag is queued: UTM tags from the URL, or from earlier in this visit.
  useEffect(() => {
    if (!on) return;
    const q = new URLSearchParams(location.search);
    for (const k of UTM) {
      let v = q.get(k) ?? "";
      try { if (v) sessionStorage.setItem("pixely-cl-" + k, v); else v = sessionStorage.getItem("pixely-cl-" + k) ?? ""; } catch {}
      claritySet(k, v);
    }
  }, [on]);
  if (!on || !CLARITY_ID) return null;
  return (
    <Script id="ms-clarity" strategy="afterInteractive">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID.replace(/[^\w]/g, "")}");`}</Script>
  );
}
