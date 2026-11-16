import type { MarketKey } from "@/config/markets";

export const pricingHref = (m: MarketKey) => (m === "pk" ? "/pricing" : "/pricing");

/* The current post's market, shared with the header, bar and CTAs (set by <BlogPostMarket />). */
let postMarket: string | null = null;
export const getPostMarket = () => postMarket;
export function setPostMarket(next: string | null) {
  if (postMarket === next) return;
  postMarket = next;
  window.dispatchEvent(new Event("pixely-market"));
}
