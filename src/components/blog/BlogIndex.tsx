"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArrowRight } from "@/components/ui/Icons";
import type { PostMeta } from "@/lib/blog";
import { scheduleMotion } from "@/lib/motion";
import BlogCard, { PostCover } from "./BlogCard";

const ORDER = ["CV & Resume", "LinkedIn", "Gulf jobs", "UK & Europe"];
const PER_PAGE = 12;

export default function BlogIndex({ posts }: { posts: PostMeta[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selected = params.get("category");
    // The URL is only available in the browser, so preserve server markup and hydrate filters once.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (selected && ORDER.includes(selected)) setCategory(selected);
    if (params.get("q")) setQuery(params.get("q") ?? "");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-blog-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let revert: (() => void) | undefined;
    scheduleMotion(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const context = gsap.context(() => {
        gsap.set(nodes, { opacity: 0, y: 10 });
        ScrollTrigger.batch(nodes, {
          start: "top 96%",
          once: true,
          onEnter: (batch) => gsap.to(batch, {
            opacity: 1, y: 0, duration: 0.34, stagger: 0.06,
            ease: "power2.out", clearProps: "transform,opacity",
          }),
        });
      });
      revert = () => context.revert();
    });
    return () => { cancelled = true; revert?.(); };
  }, [category, query, page]);

  const writeUrl = (nextCategory: string | null, nextQuery: string) => {
    const params = new URLSearchParams();
    if (nextCategory) params.set("category", nextCategory);
    if (nextQuery) params.set("q", nextQuery);
    history.replaceState(history.state, "", params.size ? `/blog?${params}` : "/blog");
  };
  const needle = query.trim().toLowerCase();
  const filtering = Boolean(category || needle);
  const matches = useMemo(
    () => posts.filter((post) =>
      (!category || post.category === category) &&
      (!needle || `${post.title} ${post.description} ${post.category}`.toLowerCase().includes(needle)),
    ),
    [posts, category, needle],
  );
  const featured = filtering ? null : posts[0];
  const list = featured ? matches.filter((post) => post.slug !== featured.slug) : matches;
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = list.slice(0, current * PER_PAGE);

  return (
    <>

      {featured && (
        <article className="blog-feature">
          <Link href={`/blog/${featured.slug}`} className="blog-feature-visual" aria-label={`Read ${featured.title}`}>
            <PostCover post={featured} wide priority />
          </Link>
          <div className="blog-feature-copy">
            <p className="blog-kicker">Featured · {featured.category}</p>
            <h2 className="blog-feature-title"><Link href={`/blog/${featured.slug}`}>{featured.title}</Link></h2>
            <p className="blog-feature-excerpt">{featured.description}</p>
            <p className="blog-feature-meta">{featured.dateLabel} · {featured.readingTime}</p>
            <Link href={`/blog/${featured.slug}`} className="blog-feature-link">
              Read article <ArrowRight />
            </Link>
          </div>
        </article>
      )}

      {featured && <div className="blog-divider" role="separator"><span>More articles</span></div>}
      <h2 className="sr-only">Posts</h2>
      {shown.length ? (
        <ul className="blog-grid">
          {shown.map((post, index) => (
            <li key={post.slug} data-blog-reveal data-revealed="true" style={{ "--reveal-delay": `${(index % 3) * 60}ms` } as CSSProperties}>
              <BlogCard post={post} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="blog-empty" role="status">No posts found. Try another word.</p>
      )}

      {list.length > shown.length && (
        <div className="blog-more">
          <button type="button" className="blog-more-button" onClick={() => setPage((value) => value + 1)}>
            Load more
          </button>
        </div>
      )}
    </>
  );
}
