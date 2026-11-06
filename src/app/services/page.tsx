import Link from "next/link";
import { homeHref, localize, localizeTitle } from "@/config/markets";
import { SERVICES } from "@/config/services";
import { ArrowRight } from "@/components/ui/Icons";
import { ServiceVisual } from "@/components/sections/ServiceVisuals";
import Reveal from "@/components/ui/Reveal";
import Rich from "@/components/ui/Rich";
import { requestMarket } from "@/lib/market-server";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/services",
  "Services | Pixely Careers",
  "Everything recruiters see, in three layers of your professional brand: career documents, your LinkedIn profile and your own portfolio website online.",
);

const GROUPS = [
  { name: "Career Documents", visual: "cv" as const },
  { name: "Professional Visibility", visual: "profile" as const },
  { name: "Digital Presence", visual: "browser" as const },
];

export default async function Page({ searchParams }: { searchParams: Promise<{ market?: string }> }) {
  const market = await requestMarket((await searchParams).market);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])} />
      <section className="page-top wrap">
        <p className="label">Services</p>
        <h1 className="page-h1 mt-6">Everything recruiters see.</h1>
        <p className="page-sub">Three layers of your professional brand.</p>
      </section>

      <div className="wrap mt-16 grid gap-6 lg:mt-24">
        {GROUPS.map((g) => (
          <section key={g.name} aria-label={g.name} className="card grid overflow-hidden lg:grid-cols-2" data-reveal>
            <div className={`flex h-[300px] justify-center overflow-hidden bg-mist lg:h-auto lg:min-h-[380px] ${g.visual === "cv" ? "items-end" : "items-center"}`}>
              <ServiceVisual kind={g.visual} alt={localize(market, "Single-column ATS CV written by Pixely Careers")} sizes="(min-width: 1024px) 30vw, 66vw" />
            </div>
            <div className="flex flex-col justify-center p-7 lg:p-12">
              <h2 className="font-head text-[clamp(28px,2.8vw,40px)] leading-[1.1] font-semibold tracking-[-0.02em]">{g.name}</h2>
              <ul className="mt-6 grid gap-3">
                {SERVICES.filter((s) => s.group === g.name).map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className="lift group flex min-h-14 items-center justify-between gap-4 rounded-xl border border-[#e6e9f0] px-5 py-3">
                      <span>
                        <span className="block font-medium">{localizeTitle(market, s.name)}</span>
                        <span className="mt-0.5 block text-sm text-navy/70">
                          <Rich text={s.hubIncluded} />
                        </span>
                      </span>
                      <span className="flex-none transition-transform group-hover:translate-x-1">
                        <ArrowRight />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <section className="wrap section text-center" aria-labelledby="unsure-title" data-reveal>
        <h2 id="unsure-title" className="h2">
          Not sure what you need?
        </h2>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-8">
          <Link href="/free-cv-review" className="btn btn-primary min-h-14 px-8 text-[1.0625rem]" data-cta="services-free-review">
            {localize(market, "Get a free CV review")}
            <ArrowRight />
          </Link>
          <Link href={homeHref(market, "#pricing")} className="link-u font-head font-medium" data-cta="services-packages">
            or See packages
            <ArrowRight />
          </Link>
        </div>
      </section>
      <Reveal />
    </>
  );
}
