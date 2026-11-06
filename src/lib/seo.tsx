import type { Metadata } from "next";
import { MARKETS, MARKET_KEYS, type Market, formatPrice, getPackages, orderHref } from "@/config/markets";

export const SITE = "https://pixelycareers.com";

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export const hreflangs = () => ({
  ...Object.fromEntries(MARKET_KEYS.map((k) => [MARKETS[k].hreflang, MARKETS[k].path])),
  "x-default": "/",
});

export function homeMetadata(m: Market): Metadata {
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
    },
    twitter: { card: "summary_large_image", title: m.meta.title, description: m.meta.ogDescription ?? m.meta.description },
  };
}

export function pageMetadata(path: string, title: string, description: string, image = "/opengraph-image"): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: `${SITE}${path}`, siteName: "Pixely Careers", title, description, locale: "en_US", images: [{ url: image, width: 1200, height: 630, alt: "Pixely Careers" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
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
