"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MARKETS, localizeTitle } from "@/config/markets";
import PaymentLogos from "@/components/ui/PaymentLogos";
import { useMarket } from "@/components/ui/useMarket";
import { SaleFooterLine } from "@/components/offer/Offer";
import { CONTACT_EMAIL, FACEBOOK_URL, FOOTER_SERVICES, LINKEDIN_URL, WHATSAPP_URL } from "@/lib/site";

const colTitle = "font-head text-sm font-medium text-white";
const linkCls = "inline-flex min-h-11 items-center text-white/75 transition-colors hover:text-white lg:min-h-9";

/** Open columns on large screens; on phones each one folds into a tap to open row. */
function Fold({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <div className="hidden lg:block">
        <h2 className={colTitle}>{title}</h2>
        <ul className="mt-4">{children}</ul>
      </div>
      <details className="footer-fold border-b border-white/15 lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-head text-[15px] font-medium text-white">
          {title}<span aria-hidden="true" className="footer-fold-icon text-white/60">+</span>
        </summary>
        <ul className="pb-3 text-[14px]">{children}</ul>
      </details>
    </>
  );
}

function Col({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <Fold title={title}>
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className={linkCls}>
              {l.label}
            </Link>
          </li>
        ))}
      </Fold>
    </nav>
  );
}

/** One clean list: a 16px icon and a short label on each row. */
const CONTACT_ROWS = [
  { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, cta: "footer-email", icon: "M3 6h18v12H3zM3 7l9 6 9-6" },
  { label: "+92 370 6404900", href: WHATSAPP_URL, cta: "footer-whatsapp", icon: "M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3zM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 1a5 5 0 0 1-3-3l1-1-1-2z" },
  { label: "LinkedIn", href: LINKEDIN_URL, cta: "footer-linkedin", icon: "M4 4h16v16H4zM8 10v6M8 7.5v.01M12 16v-6M12 13a2.5 2.5 0 0 1 5 0v3" },
  { label: "@pixelycareers.pk", href: "https://www.instagram.com/pixelycareers.pk", cta: "footer-instagram", icon: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM17.5 6.5v.01" },
  { label: "Pixely Careers PK", href: FACEBOOK_URL, cta: "footer-facebook", icon: "M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7.5a.5.5 0 0 1 .5-.5H15z" },
];

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
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "For Agencies", href: "/partners" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <footer className="on-dark bg-navy pt-12 pb-20 text-white lg:pt-[72px] lg:pb-8">
      <div className="wrap">
        <div className="grid12 gap-y-0 lg:gap-y-14">
          <div className="col-span-12 mb-6 lg:col-span-4 lg:mb-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-light.svg" alt="Pixely Careers" width={204} height={60} loading="lazy" className="h-11 w-auto lg:h-14" />
            <p className="mt-4 max-w-[320px] text-pretty text-[14px] text-white/75 lg:mt-6 lg:text-base"><span className="lg:hidden">Career documentation and personal branding.</span><span className="hidden lg:inline">Career documentation and personal branding for professionals worldwide.</span></p>
          </div>
          <div className="col-span-12 lg:col-span-3 lg:col-start-5">
            <Col title="Services" links={FOOTER_SERVICES.filter((l) => market.key !== "us" || !/europass/i.test(l.label)).map((l) => ({ ...l, label: localizeTitle(market, l.label) }))} />
          </div>
          <div className="col-span-12 lg:col-span-2">
            <Col title="Company" links={company} />
          </div>
          <div className="col-span-12 lg:col-span-3">
            <Fold title="Contact">
              {CONTACT_ROWS.map((row) => (
                <li key={row.label}>
                  <a href={row.href} {...(row.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="foot-contact" data-cta={row.cta}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={row.icon} /></svg>
                    <span>{row.label}</span>
                  </a>
                </li>
              ))}
            </Fold>
          </div>
        </div>

        {false && !fromAd && (
          <nav aria-label="Other regions" className="mt-8 flex flex-wrap items-center gap-2 text-[13px] text-white/70 lg:mt-14 lg:gap-x-2 lg:gap-y-0">
            <span className="hidden lg:inline">Other regions:</span>
            {regions.map((k, i) => (
              <span key={k} className="flex items-center gap-x-2">
                {i > 0 && <span aria-hidden="true" className="hidden lg:inline">·</span>}
                <Link href={MARKETS[k].path} className="inline-block rounded-full border border-white/20 px-3 py-1.5 underline-offset-4 hover:text-white lg:rounded-none lg:border-0 lg:px-0 lg:py-1 lg:hover:underline">
                  {MARKETS[k].region}
                </Link>
              </span>
            ))}
          </nav>
        )}
        <SaleFooterLine market={market.key} />
        <div className="mt-8 flex flex-col gap-1 border-t border-white/15 pt-4 text-sm text-white/75 md:flex-row md:items-center md:justify-between md:gap-3 md:pt-6">
          <p>
            © 2026 Pixely Careers ·{" "}
            <Link href="/privacy" className="inline-block py-3 underline underline-offset-4 hover:text-white md:py-0">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link href="/terms" className="inline-block py-3 underline underline-offset-4 hover:text-white md:py-0">
              Terms
            </Link>{" "}
            ·{" "}
            <Link href="/refund-policy" className="inline-block py-3 underline underline-offset-4 hover:text-white md:py-0">
              Refund Policy
            </Link>
          </p>
          <PaymentLogos />
          <p className="max-w-[60ch] text-xs text-pretty md:text-right">
            Pixely Careers provides career documentation only. We do not offer job placement, visa or immigration services.
          </p>
        </div>
      </div>
    </footer>
  );
}
