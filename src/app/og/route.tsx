import { BUNDLE, offerOpen } from "@/config/offers";
import { ogImage, ogOfferImage } from "@/lib/og";

export const runtime = "nodejs";

const clean = (v: string | null, max: number) => (v ?? "").replace(/[^\p{L}\p{N}\s&,.:'’!?+()/-]/gu, "").slice(0, max).trim();

/** One branded share image for every page: /og?l=LABEL&t=TITLE, or /og?v=offer for the 11.11 version (normal card once the sale ends). */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const offer = q.get("v") === "offer" && offerOpen(BUNDLE, "pk");
  const img = offer ? ogOfferImage() : ogImage(clean(q.get("l"), 30) || "Pixely Careers", clean(q.get("t"), 80) || "Stand out from the stack.");
  img.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  return img;
}
