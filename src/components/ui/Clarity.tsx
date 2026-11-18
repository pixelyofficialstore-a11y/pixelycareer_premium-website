"use client";
/**
 * Microsoft Clarity (session recordings and heatmaps) on every page, /offer and /checkout included.
 * Loads only when NEXT_PUBLIC_CLARITY_ID is set, never on localhost, never for bots or test visits.
 * Form inputs are masked: Clarity masks input values by default, and every form also carries data-clarity-mask.
 */
import Script from "next/script";
import { useEffect, useState } from "react";
import { blocked } from "@/lib/track";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export default function Clarity() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!CLARITY_ID || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || blocked()) return;
    setOn(true);
  }, []);
  if (!on || !CLARITY_ID) return null;
  return (
    <Script id="ms-clarity" strategy="afterInteractive">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID.replace(/[^\w]/g, "")}");`}</Script>
  );
}
