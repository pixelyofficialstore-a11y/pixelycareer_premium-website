"use client";
import Link from "next/link";
import { MARKETS, homeHref, localize } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";
import { useMarket } from "@/components/ui/useMarket";
import { pricingHref } from "@/lib/blog-market";

/** The one mid article call to action: the market's packages, then its formats. */
export default function MidCta() {
  const m = MARKETS[useMarket()];
  return (
    <aside className="post-cta">
      <p className="post-cta-title">{localize(m, "Want a CV like this?")}</p>
      <p className="post-cta-copy">Written for your role and country. First draft in 2 days.</p>
      <div className="post-cta-actions">
        <Link href={pricingHref(m.key)} className="post-cta-button" data-cta="post-mid-packages">
          See packages <ArrowRight />
        </Link>
        <Link href={homeHref(m, "#formats")} className="post-cta-link" data-cta="post-mid-formats">
          {localize(m, "See CV formats")} <ArrowRight />
        </Link>
      </div>
    </aside>
  );
}
