"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "@/components/ui/Icons";
import type { PostMeta } from "@/lib/blog";
import BlogCard, { PostCover } from "./BlogCard";

const ORDER = ["CV & Resume", "LinkedIn", "Gulf jobs", "UK & Europe"];
const PER_PAGE = 9;

/** The page is static HTML with every post in it; search and filters run in the browser. */
export default function BlogIndex({ posts }: { posts: PostMeta[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Filters are shareable, so read them from the address once the page is live.
  useEffect(() => {
    const u = new URLSearchParams(location.search);
    const c = u.get("category");
    /* eslint-disable react-hooks/set-state-in-effect */
    if (c && ORDER.includes(c)) setCategory(c);
    if (u.get("q")) setQuery(u.get("q") ?? "");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const writeUrl = (c: string | null, q: string) => {
    const u = new URLSearchParams();
    if (c) u.set("category", c);
    if (q) u.set("q", q);
    history.replaceState(history.state, "", u.size ? `/blog?${u}` : "/blog");
  };

  const categories = ORDER.filter((c) => posts.some((p) => p.category === c));
  const needle = query.trim().toLowerCase();
  const filtering = !!category || !!needle;
  const matches = useMemo(
    () => posts.filter((p) => (!category || p.category === category) && (!needle || `${p.title} ${p.description}`.toLowerCase().includes(needle))),
    [posts, category, needle],
  );
  const featured = filtering ? null : posts[0];
  const list = featured ? matches.slice(1) : matches;
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = list.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const pick = (c: string | null) => {
    setCategory(c);
    setPage(1);
    writeUrl(c, query.trim());
  };

  return (
    <>
      <div className="mt-8 max-w-[460px]">
        <label htmlFor="blog-search" className="sr-only">
          Search posts
        </label>
        <input
          id="blog-search"
          type="search"
          placeholder="Search posts"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
            writeUrl(category, e.target.value.trim());
          }}
          className="form-input"
        />
      </div>

      {featured && (
        <article className="card lift group relative mt-12 grid overflow-hidden lg:grid-cols-2">
          <PostCover post={featured} wide />
          <div className="flex flex-col justify-center p-7 lg:p-12">
            <p className="text-sm font-medium text-vivid">Featured · {featured.category}</p>
            <h2 className="font-head mt-3 text-[clamp(26px,2.6vw,36px)] leading-[1.15] font-semibold tracking-[-0.02em] text-balance">
              <Link href={`/blog/${featured.slug}`} className="after:absolute after:inset-0 after:content-['']">
                {featured.title}
              </Link>
            </h2>
            <p className="mt-4 leading-[1.55] text-navy/70">{featured.description}</p>
            <p className="mt-5 text-sm text-navy/70">
              {featured.dateLabel} · {featured.readingTime}
            </p>
          </div>
        </article>
      )}

      <ul className="mt-12 flex flex-wrap gap-3" aria-label="Filter by category">
        {[null, ...categories].map((c) => (
          <li key={c ?? "all"}>
            <button type="button" aria-pressed={category === c} onClick={() => pick(c)} className="chip chip-btn">
              {c ?? "All"}
            </button>
          </li>
        ))}
      </ul>

      <h2 className="sr-only">Posts</h2>
      {shown.length > 0 ? (
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <li key={p.slug}>
              <BlogCard post={p} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-lg text-navy/70" role="status">
          No posts match that search.
        </p>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-current={n === current ? "page" : undefined}
              aria-pressed={n === current}
              aria-label={`Page ${n}`}
              onClick={() => {
                setPage(n);
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
              className="chip chip-btn min-w-11 justify-center"
            >
              {n}
            </button>
          ))}
        </nav>
      )}

      <section aria-labelledby="fix-title" className="mt-20 flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-mist p-8 lg:mt-28 lg:p-12">
        <h2 id="fix-title" className="font-head text-[clamp(26px,2.8vw,40px)] leading-[1.1] font-semibold tracking-[-0.02em]">
          Want us to fix it for you?
        </h2>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-8">
          <Link href="/pricing" className="btn btn-primary" data-cta="blog-packages">
            See packages
            <ArrowRight />
          </Link>
          <Link href="/free-cv-review" className="link-u font-head font-medium" data-cta="blog-free-review">
            Free CV review
          </Link>
        </div>
      </section>
    </>
  );
}
