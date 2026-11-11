import ae from "../../content/reviews/ae.json";
import globalReviews from "../../content/reviews/global.json";
import pk from "../../content/reviews/pk.json";
import sa from "../../content/reviews/sa.json";
import uk from "../../content/reviews/uk.json";
import us from "../../content/reviews/us.json";
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

// Imported statically so the build only bundles these files (no whole-project file tracing).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FILES: Record<string, any> = { "content/reviews/ae.json": ae, "content/reviews/global.json": globalReviews, "content/reviews/pk.json": pk, "content/reviews/sa.json": sa, "content/reviews/uk.json": uk, "content/reviews/us.json": us };
const json = (file: string) => FILES[file] ?? { reviews: [] };

/** The market's own reviews, then the global ones. Never generated: empty files mean no section. */
export function getReviews(market: MarketKey): Review[] {
  const own = json(`content/reviews/${market}.json`).reviews as Review[];
  return own.length > 0 ? own : (json("content/reviews/global.json").reviews as Review[]);
}

export type Testimonial = {
  id: string;
  type: "result" | "review";
  quote: string;
  name: string;
  tag?: string;
  source: "whatsapp" | "facebook";
  location: string;
  markets: MarketKey[];
  screenshot?: string | null;
  screenshotAlt?: string;
  relevantMarkets?: (MarketKey | "global")[];
  primaryService?: string;
  feedbackCategory?: "outcome" | "service";
  outcomeCategory?: "none" | "new_job" | "appointment" | "interview_call" | "interview_interest";
  authenticity?: "owner_confirmed" | "source_verified" | "unverified" | "generated";
  publicationApproved?: boolean;
  displayPriority?: number;
  sourceFile?: string;
};

/** Separate collection keeps the unapproved country and About page rollout unchanged. */
export function getTestimonials(market: MarketKey): Testimonial[] {
  const global = json("content/reviews/global.json");
  const own = json(`content/reviews/${market}.json`);
  const items: Testimonial[] = own.testimonials?.length ? own.testimonials : global.testimonials ?? [];
  // Only explicitly client approved result IDs may be published.
  const approved = new Set<string>([...(global.approvedResultIds ?? []), ...(own.approvedResultIds ?? [])]);
  return items.filter((item) =>
    (item.markets.length === 0 || item.markets.includes(market)) &&
    item.publicationApproved !== false &&
    item.authenticity !== "generated" &&
    item.authenticity !== "unverified" &&
    (item.type !== "result" || approved.has(item.id)))
    .sort((a, b) => (a.displayPriority ?? 100) - (b.displayPriority ?? 100));
}
