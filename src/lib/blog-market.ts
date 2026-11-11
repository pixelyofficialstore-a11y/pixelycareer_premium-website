import type { MarketKey } from "@/config/markets";

/** Country code (from the host's geo header) to market. */
export function marketFromCountry(country?: string | null): MarketKey | null {
  switch ((country ?? "").toUpperCase()) {
    case "AE": return "ae";
    case "SA": return "sa";
    case "GB": return "uk";
    case "PK": return "pk";
    case "": return null;
    default: return "us";
  }
}

/**
 * The market every blog CTA points to, in this order:
 * 1. the post's own market (gulf: the visitor's Gulf market, else UAE),
 * 2. the visitor's saved market (pc_market cookie),
 * 3. the visitor's country (geo header, saved by proxy.ts as pc_geo),
 * 4. the US.
 */
export function getBlogMarket(
  postMarket: string | null | undefined,
  request: { saved?: MarketKey | null; country?: string | null },
): MarketKey {
  const visitor = request.saved ?? marketFromCountry(request.country);
  if (postMarket === "ae" || postMarket === "sa" || postMarket === "uk") return postMarket;
  if (postMarket === "gulf") return visitor === "ae" || visitor === "sa" ? visitor : "ae";
  return visitor ?? "us";
}

export const pricingHref = (m: MarketKey) => `/pricing?m=${m}`;

/* The current post's market, shared with the header, bar and CTAs (set by <BlogPostMarket />). */
let postMarket: string | null = null;
export const getPostMarket = () => postMarket;
export function setPostMarket(next: string | null) {
  if (postMarket === next) return;
  postMarket = next;
  window.dispatchEvent(new Event("pixely-market"));
}
