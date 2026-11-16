import type { MetadataRoute } from "next";
import { SERVICES } from "@/config/services";
import { getPosts } from "@/lib/blog";
import { SITE } from "@/lib/seo";

const url = (path: string) => (path === "/" ? SITE : `${SITE}${path}`);

/** Pakistan pages and the blog only. No hreflang while Pakistan is the only market. /cv and /checkout are not listed (noindex). */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/pricing",
    "/services",
    ...SERVICES.map((s) => `/services/${s.slug}`),
    "/about",
    "/blog",
    "/partners",
    "/contact",
    "/free-cv-review",
    "/privacy",
    "/terms",
    "/refund-policy",
  ];
  return [{ url: SITE, lastModified: new Date(), priority: 1 }, ...pages.map((path) => ({ url: url(path) })), ...getPosts().map((p) => ({ url: url(`/blog/${p.slug}`), lastModified: p.updated ?? p.date, ...(p.cover ? { images: [url(p.cover)] } : {}) }))];
}
