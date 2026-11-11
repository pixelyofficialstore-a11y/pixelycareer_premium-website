import Image from "next/image";
import Link from "next/link";
import type { PostMeta } from "@/lib/blog";
import BlogCoverFallback from "./BlogCoverFallback";

type CoverMeta = PostMeta & { cover?: string; coverAlt?: string };

/** A 16:10 editorial image, or the designed category fallback when no photo exists. */
export function PostCover({ post, wide = false, priority = false }: { post: PostMeta; wide?: boolean; priority?: boolean }) {
  const item = post as CoverMeta;
  return (
    <div className={`blog-cover-inner${wide ? " blog-cover-inner-wide" : ""}`}>
      {item.cover ? (
        <Image
          src={item.cover}
          alt={item.coverAlt || `Editorial cover for ${post.title}`}
          fill
          priority={priority}
          sizes={wide ? "(max-width: 767px) 100vw, 55vw" : "(max-width: 767px) 100vw, (max-width: 900px) 50vw, 33vw"}
        />
      ) : (
        <BlogCoverFallback category={post.category} />
      )}
    </div>
  );
}

export default function BlogCard({ post }: { post: PostMeta }) {
  return (
    <article className="blog-card">
      <Link href={`/blog/${post.slug}`} className="blog-card-cover" aria-label={`Read ${post.title}`}>
        <PostCover post={post} />
      </Link>
      <div className="blog-card-copy">
        <p className="blog-card-category">{post.category}</p>
        <h3 className="blog-card-title">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="blog-card-meta">{post.dateLabel} · {post.readingTime}</p>
      </div>
    </article>
  );
}
