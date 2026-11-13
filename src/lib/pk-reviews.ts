import type { Testimonial } from "@/lib/home-content";

/** The nine approved screenshots in public/reviews/pk, shown on /pk in this exact order. */
const shot = (n: string, source: Testimonial["source"], name: string, alt: string): Testimonial => ({
  id: `pk-review-${n}`, type: source === "whatsapp" ? "result" : "review", quote: "", name, source, location: "Pakistan", markets: ["pk"],
  screenshot: `/reviews/pk/${n}.png`, screenshotAlt: alt,
});

export const PK_REVIEW_SHOTS: Testimonial[] = [
  shot("01", "whatsapp", "Client", "Client review: interview call from Huawei"),
  shot("02", "whatsapp", "Client", "Client review: selected as Assistant Director Admin"),
  shot("03", "whatsapp", "Client", "Client review: new job in 15 days"),
  shot("04", "facebook", "Muhammad Asif", "Client review from Muhammad Asif on Facebook"),
  shot("05", "facebook", "Hina M", "Client review from Hina M on Facebook"),
  shot("06", "facebook", "Maria Khan", "Client review from Maria Khan on Facebook"),
  shot("07", "facebook", "Rajpoot Zada", "Client review from Rajpoot Zada on Facebook"),
  shot("08", "facebook", "M Honey", "Client review from M Honey on Facebook"),
  shot("09", "facebook", "Heather Bates", "Client review from Heather Bates on Facebook"),
];
