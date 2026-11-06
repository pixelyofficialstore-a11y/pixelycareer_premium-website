import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

/** Brand-colored type panel: no stock photos. */
export function PostCover({ post, wide }: { post: PostMeta; wide?: boolean }) {
  const blue = post.category === "LinkedIn" || post.category === "UK & Europe";
  return (
    <div aria-hidden="true" className={`flex flex-col justify-between p-6 text-white ${blue ? "bg-vivid" : "bg-navy"} ${wide ? "min-h-64 lg:p-10" : "h-48"}`}>
      <span className="text-sm font-medium">{post.category}</span>
      <span className={`font-head line-clamp-2 leading-[1.1] font-semibold tracking-[-0.02em] ${wide ? "text-[clamp(28px,3vw,44px)]" : "text-[24px]"}`}>{post.title}</span>
    </div>
  );
}

export default function BlogCard({ post }: { post: PostMeta }) {
  return (
    <article className="card lift group relative flex h-full flex-col overflow-hidden">
      <PostCover post={post} />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm font-medium text-vivid">{post.category}</p>
        <h3 className="mt-2 text-[20px] leading-[1.25] font-semibold tracking-[-0.01em]">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-2 text-[15px] leading-[1.5] text-navy/70">{post.description}</p>
        <p className="mt-auto pt-5 text-sm text-navy/70">
          {post.dateLabel} · {post.readingTime}
        </p>
      </div>
    </article>
  );
}
