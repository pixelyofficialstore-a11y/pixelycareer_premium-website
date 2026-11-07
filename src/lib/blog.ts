import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "content/blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  category: string;
  market?: string;
  author: string;
  keywords: string[];
  relatedService: string;
  cover?: string;
  coverAlt?: string;
  coverCredit?: string;
  coverCreditUrl?: string;
  takeaways?: string[];
  faq?: { q: string; a: string }[];
  draft?: boolean;
  dateLabel: string;
  updatedLabel?: string;
  readingTime: string;
};

const asDate = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v));
const label = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function read(file: string) {
  const { data, content } = matter(fs.readFileSync(path.join(DIR, file), "utf8"));
  const date = asDate(data.date);
  const updated = data.updated ? asDate(data.updated) : undefined;
  const words = content.trim().split(/\s+/).length;
  const meta = {
    ...data,
    slug: file.replace(/\.mdx$/, ""),
    date,
    updated,
    dateLabel: label(date),
    updatedLabel: updated && updated !== date ? label(updated) : undefined,
    readingTime: `${Math.max(3, Math.ceil(words / 220))} min read`,
  } as PostMeta;
  return { meta, content };
}

/** Newest first. Drafts never appear. */
export function getPosts(): PostMeta[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => read(f).meta)
    .filter((p) => !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string) {
  const file = `${slug}.mdx`;
  if (!/^[a-z0-9-]+$/.test(slug) || !fs.existsSync(path.join(DIR, file))) return null;
  const post = read(file);
  return post.meta.draft ? null : post;
}

export const headingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const getHeadings = (content: string) => [...content.matchAll(/^## (.+)$/gm)].map((m) => m[1].replace(/[*`]/g, "").trim());
