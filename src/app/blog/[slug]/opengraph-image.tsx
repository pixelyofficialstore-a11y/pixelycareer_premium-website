import { getPost, getPosts } from "@/lib/blog";
import { OG_SIZE, OG_TYPE, ogImage } from "@/lib/og";

export const alt = "Pixely Careers blog post";
export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const generateStaticParams = () => getPosts().map((p) => ({ slug: p.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  return ogImage(post?.meta.category ?? "Blog", post?.meta.title ?? "Career notes.");
}
