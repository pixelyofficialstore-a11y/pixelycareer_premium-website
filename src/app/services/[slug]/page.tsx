import Link from "next/link";
import { notFound } from "next/navigation";
import { getPackages, homeHref, localize, localizeTitle, orderHref } from "@/config/markets";
import { SERVICES, getService } from "@/config/services";
import BeforeAfter from "@/components/blog/BeforeAfter";
import BlogCard from "@/components/blog/BlogCard";
import Faq from "@/components/sections/Faq";
import FinalCta from "@/components/sections/FinalCta";
import Process from "@/components/sections/Process";
import { ServiceVisual } from "@/components/sections/ServiceVisuals";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { ArrowRight } from "@/components/ui/Icons";
import Reveal from "@/components/ui/Reveal";
import Rich from "@/components/ui/Rich";
import { getPosts } from "@/lib/blog";
import { requestMarket } from "@/lib/market-server";
import { JsonLd, SITE, breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import { WHATSAPP_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ market?: string }> };

export async function generateMetadata({ params }: Props) {
  const service = getService((await params).slug);
  if (!service) return {};
  const market = await requestMarket();
  return pageMetadata(`/services/${service.slug}`, `${localizeTitle(market, service.metaTitle)} | Pixely Careers`, localize(market, service.description), `/services/${service.slug}/opengraph-image`);
}

export default async function Page({ params, searchParams }: Props) {
  const service = getService((await params).slug);
  if (!service) notFound();
  const market = await requestMarket((await searchParams).market);
  const l = (t: string) => localize(market, t);
  const name = localizeTitle(market, service.name);
  const faq = service.faq.map((i) => ({ q: l(i.q), a: l(i.a) }));
  const all = getPackages(market);
  const packages = (service.packages ?? []).map((id) => all.find((p) => p.id === id)!);
  const posts = getPosts();
  const reading = [...posts.filter((p) => p.relatedService === service.slug), ...posts.filter((p) => p.relatedService !== service.slug)].slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name,
          description: l(service.description),
          serviceType: service.group,
          url: `${SITE}/services/${service.slug}`,
          provider: { "@id": `${SITE}/#org` },
          areaServed: "Worldwide",
          ...(packages.length > 0 && {
            offers: packages.map((p) => ({
              "@type": "Offer",
              name: p.name,
              url: `${SITE}${orderHref(market, p.id)}`,
              ...(market.approved && { price: String(p.price), priceCurrency: market.currency }),
            })),
          }),
        }}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name, path: `/services/${service.slug}` }])} />
      <JsonLd data={faqJsonLd(faq)} />

      <section className="svc-hero wrap grid12 items-center gap-y-12">
        <div className="col-span-12 lg:col-span-6">
          <Breadcrumb items={[{ label: "Home", href: market.path }, { label: "Services", href: "/services" }, { label: name }]} />
          <p className="label mt-6">{service.group}</p>
          <h1 className="page-h1 mt-5">{l(service.h1)}</h1>
          <p className="page-sub">{l(service.line)}</p>
          <div className="mt-8 flex flex-col items-stretch gap-x-7 gap-y-2 sm:flex-row sm:items-center">
            <Link href={homeHref(market, "#pricing")} className="btn btn-primary min-h-14 px-8 text-[1.0625rem]" data-cta={`service-${service.slug}-packages`}>
              See packages
              <ArrowRight />
            </Link>
            <Link href="/free-cv-review" className="link-u font-head self-start font-medium sm:self-auto" data-cta={`service-${service.slug}-free-review`}>
              Get a free review
            </Link>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <div className={`svc-hero-visual flex justify-center overflow-hidden rounded-2xl bg-mist ${service.visual === "cv" ? "items-end" : "items-center"}`}>
            <ServiceVisual kind={service.visual} large alt={l("Single-column ATS CV written by Pixely Careers")} sizes="(min-width: 1024px) 32vw, 66vw" />
          </div>
        </div>
      </section>

      <section aria-labelledby="problem-title" className="on-dark mt-20 bg-navy py-20 text-white lg:mt-24 lg:py-28">
        <div className="wrap" data-reveal>
          <h2 id="problem-title" className="h2 max-w-[20ch]">
            {l(service.problem)}
          </h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {service.mistakes.map((m) => (
              <li key={m} className="chip chip-dark">
                {l(m)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="gets-title" className="section wrap">
        <h2 id="gets-title" className="h2" data-reveal>
          What you get
        </h2>
        <ul className="check-list mt-12 grid gap-x-12 gap-y-6 md:grid-cols-2">
          {service.gets.map((g) => (
            <li key={g.title} data-reveal>
              <strong className="block text-lg font-semibold">
                <Rich text={l(g.title)} />
              </strong>
              <span className="mt-1 block text-base text-navy/70">
                <Rich text={l(g.line)} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ba-title" className="wrap pb-24 lg:pb-40">
        <h2 id="ba-title" className="h2" data-reveal>
          Before / After
        </h2>
        <div className="mt-12 max-w-[900px]" data-reveal>
          <BeforeAfter before={l(service.before)} after={l(service.after)} large />
        </div>
      </section>

      <section aria-labelledby="who-title" className="wrap pb-24 lg:pb-40">
        <h2 id="who-title" className="h2" data-reveal>
          Who it’s for
        </h2>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {service.who.map((w) => (
            <li key={w.title} className="card lift p-8" data-reveal>
              <h3 className="card-title">{w.title}</h3>
              <p className="mt-3 leading-[1.5] text-navy/70">{l(w.line)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="in-title" className="wrap">
        <div data-reveal>
          <h2 id="in-title" className="h2">
            Included in
          </h2>
          {!market.approved && packages.length > 0 && (
            <p className="mt-4">
              <span className="confirm">[CONFIRM pricing]</span>
            </p>
          )}
        </div>
        {packages.length > 0 ? (
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {packages.map((p) => (
              <li key={p.id} className="card lift flex flex-col p-8" data-reveal>
                <h3 className="card-title">{p.name}</h3>
                {service.packageNotes?.[p.id] && <p className="mt-2 text-[15px] text-navy/70">{service.packageNotes[p.id]}</p>}
                <p className="mt-auto pt-4 text-[28px] font-semibold tabular-nums">{p.priceLabel}</p>
                <Link href={orderHref(market, p.id)} className="price-btn" data-cta={`service-${service.slug}-choose-${p.id}`}>
                  {p.button}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3" data-reveal>
            <p className="text-lg text-navy/75">
              <Rich text={service.includedNote ?? ""} />
            </p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="link-u font-head font-medium" data-cta={`service-${service.slug}-whatsapp`}>
              Ask on WhatsApp
              <ArrowRight />
            </a>
          </div>
        )}
      </section>

      <Process market={market.key} />
      <Faq items={faq} />

      <section aria-labelledby="reading-title" className="wrap pb-24 lg:pb-32">
        <h2 id="reading-title" className="h2" data-reveal>
          Related reading
        </h2>
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reading.map((p) => (
            <li key={p.slug} data-reveal>
              <BlogCard post={p} />
            </li>
          ))}
        </ul>
        <nav aria-label="Related" className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-2">
          <Link href="/pricing" className="link-u font-head font-medium">
            Pricing
            <ArrowRight />
          </Link>
          {service.related.map((slug) => (
            <Link key={slug} href={`/services/${slug}`} className="link-u font-head font-medium">
              {localizeTitle(market, getService(slug)?.name ?? "")}
              <ArrowRight />
            </Link>
          ))}
        </nav>
      </section>

      <FinalCta market={market} />
      <Reveal />
    </>
  );
}

export const generateStaticParams = () => SERVICES.map((s) => ({ slug: s.slug }));
