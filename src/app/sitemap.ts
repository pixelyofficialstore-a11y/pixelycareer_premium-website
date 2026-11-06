import type { MetadataRoute } from "next";
import { MARKETS, MARKET_KEYS } from "@/config/markets";
import { SERVICES } from "@/config/services";
import { getPosts } from "@/lib/blog";
import { SITE } from "@/lib/seo";

const url = (path: string) => (path === "/" ? SITE : `${SITE}${path}`);

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    ...Object.fromEntries(MARKET_KEYS.map((k) => [MARKETS[k].hreflang, url(MARKETS[k].path)])),
    "x-default": SITE,
  };
  const pages = [
    "/services",
    ...SERVICES.map((s) => `/services/${s.slug}`),
    "/pricing",
    "/about",
    "/blog",
    "/partners",
    "/contact",
    "/order",
    "/free-cv-review",
    "/privacy",
    "/terms",
  ];
  return [...MARKET_KEYS.map((k) => ({ url: url(MARKETS[k].path), lastModified: new Date(), priority: k === "us" ? 1 : 0.9, alternates: { languages } })), ...pages.map((path) => ({ url: url(path) })), ...getPosts().map((p) => ({ url: url(`/blog/${p.slug}`), lastModified: p.updated ?? p.date }))];
}
