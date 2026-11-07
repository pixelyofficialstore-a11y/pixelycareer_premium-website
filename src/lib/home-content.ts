import fs from "fs";
import path from "path";
import type { MarketKey } from "@/config/markets";

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

/** The market's own reviews, then the global ones. Never generated: empty files mean no section. */
export function getReviews(market: MarketKey): Review[] {
  const own = json(`content/reviews/${market}.json`).reviews as Review[];
  return own.length > 0 ? own : (json("content/reviews/global.json").reviews as Review[]);
}
