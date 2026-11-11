import type { Metadata } from "next";
import { MARKETS, MARKET_KEYS, type Market, formatPrice, getPackages, orderHref } from "@/config/markets";

export const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://pixelycareers.com").replace(/\/$/, "");

/** The share image for a page: always our branded card, as an absolute URL with its size and type. */
export type OgSpec = { label?: string; title?: string; offer?: boolean; locale?: string; alt?: string };
const COUNTRY: Record<string, string> = { us: "US", uk: "UK", ae: "UAE", sa: "Saudi", pk: "Pakistani" };
export function ogImages(spec: { label: string; title: string; offer?: boolean; alt: string }) {
  const url = spec.offer ? `${SITE}/og?v=offer` : `${SITE}/og?${new URLSearchParams({ l: spec.label, t: spec.title })}`;
  return [{ url, width: 1200, height: 630, type: "image/png", alt: spec.alt }];
}
const labelFor = (path: string) => {
  const seg = path.split("/").filter(Boolean)[0] ?? "";
  return ({ blog: "Blog", services: "Service", pricing: "Pricing", order: "Order", about: "About", contact: "Contact", partners: "For agencies", "free-cv-review": "Free CV review" } as Record<string, string>)[seg] ?? "Pixely Careers";
};

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export const hreflangs = () => ({
  ...Object.fromEntries(MARKET_KEYS.map((k) => [MARKETS[k].hreflang, MARKETS[k].path])),
  "x-default": "/",
});

export function homeMetadata(m: Market, offer = false): Metadata {
  const images = ogImages({ label: m.region, title: `Stand out in the ${COUNTRY[m.key] ?? m.region} market`, offer, alt: m.meta.title });
  return {
    title: { absolute: m.meta.title },
    description: m.meta.description,
    alternates: { canonical: m.path, languages: hreflangs() },
    openGraph: {
      type: "website",
      url: `${SITE}${m.path === "/" ? "" : m.path}`,
      siteName: "Pixely Careers",
      title: m.meta.title,
      description: m.meta.ogDescription ?? m.meta.description,
      locale: m.hreflang.replace("-", "_"),
      images,
    },
    twitter: { card: "summary_large_image", title: m.meta.title, description: m.meta.ogDescription ?? m.meta.description, images: images.map((i) => i.url) },
  };
}

export function pageMetadata(path: string, title: string, description: string, og: OgSpec = {}): Metadata {
  const images = ogImages({ label: og.label ?? labelFor(path), title: og.title ?? title.replace(/\s*\|\s*Pixely Careers$/, "").split(" | ")[0], offer: og.offer, alt: og.alt ?? title });
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: `${SITE}${path}`, siteName: "Pixely Careers", title, description, locale: og.locale ?? "en_US", images },
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
  };
}

/** On each market home. Offers appear only once that market's prices are approved. */
export function homeJsonLd(m: Market) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Pixely Careers",
    url: `${SITE}${m.path === "/" ? "" : m.path}`,
    parentOrganization: { "@id": `${SITE}/#org` },
    description: m.meta.description,
    areaServed: { "@type": "Country", name: m.areaServed },
    telephone: "+92-370-6404900",
    ...(m.approved && {
      priceRange: `${formatPrice(m, m.prices["ats-career"])} – ${formatPrice(m, m.prices.executive)}`,
      makesOffer: getPackages(m).map((p) => ({ "@type": "Offer", name: p.name, price: String(p.price), priceCurrency: m.currency, url: `${SITE}${orderHref(m, p.id)}` })),
    }),
  };
}

/** Items still awaiting confirmation stay out of the structured data. */
export function faqJsonLd(items: { q: string; a: string }[]) {
  // Every visible question is listed. A [CONFIRM ...] note is for the team, so it stays out of the search data.
  const clean = (t: string) => t.replace(/:?s*[[^]]*]/g, "");
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: clean(i.q), acceptedAnswer: { "@type": "Answer", text: clean(i.a) } })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((i, n) => ({ "@type": "ListItem", position: n + 1, name: i.name, item: `${SITE}${i.path}` })),
  };
}
