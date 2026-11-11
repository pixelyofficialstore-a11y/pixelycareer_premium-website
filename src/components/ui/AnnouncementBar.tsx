"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { getAnnouncement, isBarHidden } from "@/config/announcements";
import { MARKETS } from "@/config/markets";
import { useMarket } from "./useMarket";
import { useCountdown, useOffer } from "@/components/offer/useOffer";
import { Ticker } from "@/components/offer/Offer";
import "@/components/offer/offer.css";

const CAMPAIGN_KEY = "pixely-campaign";
const CLOSED_KEY = "pixely-bar-closed";

/** The page's message is in the server HTML. A campaign swaps only the words after load, so the height never changes. */
function readCampaign() {
  try {
    const fromUrl = new URLSearchParams(location.search).get("utm_campaign");
    if (fromUrl) sessionStorage.setItem(CAMPAIGN_KEY, fromUrl);
    const source = new URLSearchParams(location.search).get("utm_source");
    if (source) sessionStorage.setItem("pixely-utm-source", source);
    return fromUrl ?? sessionStorage.getItem(CAMPAIGN_KEY);
  } catch {
    return new URLSearchParams(location.search).get("utm_campaign");
  }
}

export default function AnnouncementBar() {
  const path = usePathname();
  const market = MARKETS[useMarket()];
  const [campaign, setCampaign] = useState<string | null>(null);
  const hidden = isBarHidden(path);
  const { open: offerOpen, remaining } = useOffer(market.key);
  const left = useCountdown();

  // Moving between pages with and without a bar: the header and page spacing follow --bar-h.
  useLayoutEffect(() => {
    document.documentElement.toggleAttribute("data-no-bar", hidden);
  }, [hidden]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCampaign(readCampaign());
  }, [path]);

  if (hidden) return null;

  const close = () => {
    document.documentElement.setAttribute("data-bar-closed", "");
    try {
      sessionStorage.setItem(CLOSED_KEY, "1");
    } catch {
      // Storage is blocked: it stays closed until the next full page load.
    }
  };

  // pk: the Personal Brand Bundle replaces the page message while it is open (also for utm_campaign "bundle").
  const bundle = offerOpen && !left.done;
  const message = bundle ? { key: "brand-bundle", text: "", href: "/pk#offer", ctaLabel: undefined } : getAnnouncement(market, path, campaign);
  const inner = bundle ? (
    <>
      <Ticker t={left} />
    </>
  ) : (
    <>
      {message.text}
      {message.ctaLabel && <span className="ml-2 underline underline-offset-3">{message.ctaLabel}</span>}
    </>
  );
  const cta = `announcement-${message.key}`;

  return (
    <div className="ann-bar">
      {message.href.startsWith("http") ? (
        <a href={message.href} target="_blank" rel="noopener noreferrer" className="ann-link" data-cta={cta}>
          {inner}
        </a>
      ) : (
        <Link href={message.href} className="ann-link" data-cta={cta}>
          {inner}
        </Link>
      )}
      <button type="button" onClick={close} aria-label="Close announcement" className="ann-close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
      </button>
    </div>
  );
}
