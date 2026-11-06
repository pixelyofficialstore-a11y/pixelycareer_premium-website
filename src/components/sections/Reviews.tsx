import type { Market } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";
import Rich from "@/components/ui/Rich";
import type { Review } from "@/lib/home-content";

function Card({ r, hidden }: { r: Review; hidden?: boolean }) {
  const who = (
    <p className="mt-4 text-sm">
      <span className="font-semibold">{r.name}</span>
      <span className="block text-navy/70">
        {r.role} · {r.country}
      </span>
      <span className="mt-1 block text-[13px] text-navy/70">{r.source}</span>
    </p>
  );
  if (r.type === "screenshot" && r.image) {
    return (
      <li className="review-card review-shot" aria-hidden={hidden}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={r.image} alt={`Review from ${r.name}, on ${r.source}`} loading="lazy" />
        {who}
      </li>
    );
  }
  return (
    <li className="review-card" aria-hidden={hidden}>
      <blockquote className="text-[17px] leading-[1.5]">“{r.quote}”</blockquote>
      {who}
    </li>
  );
}

function Row({ items, reverse }: { items: Review[]; reverse?: boolean }) {
  // Repeated until a row is wider than any screen, so a short list leaves no gap. Only the first copy is read out.
  const extra = Array.from({ length: Math.ceil(8 / items.length) - 1 }, () => items).flat();
  return (
    <div className="review-row">
      <div className={`review-track ${reverse ? "review-reverse" : ""}`}>
        <ul>
          {items.map((r) => (
            <Card key={`${r.name}-${r.role}`} r={r} />
          ))}
          {extra.map((r, i) => (
            <Card key={i} r={r} hidden />
          ))}
        </ul>
        {/* The copy that makes the loop seamless */}
        <ul aria-hidden="true">
          {[...items, ...extra].map((r, i) => (
            <Card key={i} r={r} />
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Renders only with real reviews from content/reviews/. */
export default function Reviews({ market, reviews }: { market: Market; reviews: Review[] }) {
  if (reviews.length === 0) return null;
  const half = Math.ceil(reviews.length / 2);
  const rows = reviews.length > 3 ? [reviews.slice(0, half), reviews.slice(half)] : [reviews];
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="section overflow-hidden bg-mist">
      <div className="wrap">
        <p className="label">Client stories</p>
        <h2 id="reviews-title" className="h2 mt-6">
          Real people. <em>Real results.</em>
        </h2>
      </div>
      <div className="mt-12 grid gap-5">
        {rows.map((items, i) => (
          <Row key={i} items={items} reverse={i === 1} />
        ))}
      </div>
      <p className="wrap mt-10">
        {market.reviewsUrl ? (
          <a href={market.reviewsUrl} target="_blank" rel="noopener noreferrer" className="link-u font-head font-medium">
            See all reviews on Facebook
            <ArrowRight />
          </a>
        ) : (
          <span className="text-navy/70">
            See all reviews on Facebook <Rich text="[CONFIRM URL]" />
          </span>
        )}
      </p>
    </section>
  );
}
