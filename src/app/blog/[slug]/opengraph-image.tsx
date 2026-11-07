import { getPost, getPosts } from "@/lib/blog";
import { ogImage } from "@/lib/og";
import fs from "node:fs";
import path from "node:path";

export const alt = "Pixely Careers blog post";
export const size = { width: 1600, height: 1000 };
export const contentType = "image/webp";
export const generateStaticParams = () => getPosts().map((p) => ({ slug: p.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (post?.meta.cover) {
    const file = path.join(process.cwd(), "public", post.meta.cover);
    if (fs.existsSync(file)) {
      return new Response(new Uint8Array(fs.readFileSync(file)), { headers: { "Content-Type": "image/webp" } });
    }
  }
  return ogImage(post?.meta.category ?? "Blog", post?.meta.title ?? "Career notes.");
}
