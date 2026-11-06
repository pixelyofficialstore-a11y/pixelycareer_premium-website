import fs from "fs";
import path from "path";
import type { MarketKey, SampleTab } from "@/config/markets";

export type Sample = { image: string; caption: string; role: string };
export type Review = {
  type: "text" | "screenshot";
  name: string;
  role: string;
  country: string;
  quote?: string;
  image?: string;
  source: "Facebook" | "Google" | "WhatsApp";
  sourceUrl?: string;
};

const json = (file: string) => JSON.parse(fs.readFileSync(path.join(process.cwd(), file), "utf8"));

/** A file name is served from /samples/{tab}/ (see scripts/sync-samples.mjs). */
export function getSamples(): Record<SampleTab, Sample[]> {
  const read = (tab: SampleTab) => (json(`content/samples/${tab}/samples.json`) as Sample[]).map((s) => ({ ...s, image: `/samples/${tab}/${s.image}` }));
  return { pakistan: read("pakistan"), gulf: read("gulf"), uk: read("uk"), europe: read("europe"), usa: read("usa") };
}

/** The market's own reviews, then the global ones. Never generated: empty files mean no section. */
export function getReviews(market: MarketKey): Review[] {
  const own = json(`content/reviews/${market}.json`).reviews as Review[];
  return own.length > 0 ? own : (json("content/reviews/global.json").reviews as Review[]);
}
