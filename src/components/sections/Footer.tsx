"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MARKETS, localizeTitle } from "@/config/markets";
import { useMarket } from "@/components/ui/useMarket";
import { FOOTER_SERVICES, WHATSAPP_URL } from "@/lib/site";

const colTitle = "font-head text-sm font-medium text-white";
const linkCls = "inline-flex min-h-11 items-center text-white/75 transition-colors hover:text-white lg:min-h-9";

function Col({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className={colTitle}>{title}</h2>
      <ul className="mt-4">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className={linkCls}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  const market = MARKETS[useMarket()];
  // Quiet region links, hidden for visitors arriving from an ad. No prices here.
  const [fromAd, setFromAd] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(location.search).has("utm_source")) sessionStorage.setItem("pixely-ad", "1");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFromAd(sessionStorage.getItem("pixely-ad") === "1");
  }, []);
  const regions = ["us", "uk", "ae", "sa", "pk"] as const;
  const home = market.path === "/" ? "" : market.path;
  const company = [
    { label: "How it works", href: `${home}/#process`.replace(/^(\/[a-z]{2})\/#/, "$1#") },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "For Agencies", href: "/partners" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <footer className="on-dark bg-navy pt-[clamp(72px,9vw,120px)] pb-10 text-white">
      <div className="wrap">
        <div className="grid12 gap-y-14">
          <div className="col-span-12 lg:col-span-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-light.svg" alt="Pixely Careers" width={204} height={60} loading="lazy" className="h-14 w-auto" />
            <p className="mt-6 max-w-[320px] text-pretty text-white/75">Career documentation and personal branding for professionals worldwide.</p>
          </div>
          <div className="col-span-6 md:col-span-4 lg:col-span-3 lg:col-start-5">
            <Col title="Services" links={FOOTER_SERVICES.map((l) => ({ ...l, label: localizeTitle(market, l.label) }))} />
          </div>
          <div className="col-span-6 md:col-span-3 lg:col-span-2">
            <Col title="Company" links={company} />
          </div>
          <div className="col-span-12 md:col-span-5 lg:col-span-3">
            <h2 className={colTitle}>Contact</h2>
            <ul className="mt-4">
              <li>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={linkCls} data-cta="footer-whatsapp">
                  WhatsApp 0370-6404900
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/pixelycareers.pk" target="_blank" rel="noopener noreferrer" className={linkCls}>
                  Instagram @pixelycareers.pk
                </a>
              </li>
              <li className="flex min-h-11 items-center text-white/75 lg:min-h-9">Facebook: Pixely Careers PK</li>
            </ul>
          </div>
        </div>

        {!fromAd && (
          <nav aria-label="Other regions" className="mt-14 flex flex-wrap items-center gap-x-2 text-[13px] text-white/70">
            <span>Other regions:</span>
            {regions.map((k, i) => (
              <span key={k} className="flex items-center gap-x-2">
                {i > 0 && <span aria-hidden="true">·</span>}
                <Link href={MARKETS[k].path} className="inline-block py-3 underline-offset-4 hover:text-white hover:underline md:py-1">
                  {MARKETS[k].region}
                </Link>
              </span>
            ))}
          </nav>
        )}
        <div className="mt-6 flex flex-col gap-3 border-t border-white/15 pt-6 text-sm text-white/75 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 Pixely Careers ·{" "}
            <Link href="/privacy" className="inline-block py-3 underline underline-offset-4 hover:text-white md:py-0">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link href="/terms" className="inline-block py-3 underline underline-offset-4 hover:text-white md:py-0">
              Terms
            </Link>
          </p>
          <p className="max-w-[60ch] text-xs text-pretty md:text-right">
            Pixely Careers provides career documentation only. We do not offer job placement, visa or immigration services.
          </p>
        </div>
      </div>
    </footer>
  );
}
