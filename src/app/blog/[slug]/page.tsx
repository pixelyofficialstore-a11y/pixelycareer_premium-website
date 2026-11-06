import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getService } from "@/config/services";
import BeforeAfter from "@/components/blog/BeforeAfter";
import BlogCard from "@/components/blog/BlogCard";
import MarketFinalCta from "@/components/blog/MarketFinalCta";
import { PostToc, ReadingProgress, ShareRow } from "@/components/blog/PostTools";
import { headingSlug } from "@/components/blog/slug";
import Accordion from "@/components/ui/Accordion";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { ArrowRight } from "@/components/ui/Icons";
import Reveal from "@/components/ui/Reveal";
import { getHeadings, getPost, getPosts } from "@/lib/blog";
import { JsonLd, SITE, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
type Kids = { children?: React.ReactNode };

export const generateStaticParams = () => getPosts().map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) return {};
  const { title, description, date, updated, slug, keywords } = post.meta;
  return {
    // The brand suffix only where the whole title still fits in 60 characters.
    title: { absolute: title.length + 18 <= 60 ? `${title} | Pixely Careers` : title },
    description,
    keywords,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { type: "article", url: `${SITE}/blog/${slug}`, siteName: "Pixely Careers", title, description, locale: "en_US", publishedTime: date, modifiedTime: updated ?? date },
    twitter: { card: "summary_large_image", title, description },
  };
}

function textOf(c: React.ReactNode): string {
  if (typeof c === "string" || typeof c === "number") return String(c);
  if (Array.isArray(c)) return c.map(textOf).join("");
  if (c && typeof c === "object" && "props" in c) return textOf((c.props as Kids).children);
  return "";
}

function Callout({ type = "note", title, children }: Kids & { type?: "tip" | "note"; title?: string }) {
  return (
    <aside className="callout">
      <p className="callout-label">{type === "tip" ? "Tip" : "Note"}</p>
      {title && <p className="callout-title">{title}</p>}
      <div className="callout-body">{children}</div>
    </aside>
  );
}

function Cta({ service }: { service: string }) {
  const s = getService(service);
  if (!s) return null;
  return (
    <aside className="post-cta on-dark">
      <p className="font-head text-[26px] leading-[1.15] font-semibold tracking-[-0.02em]">{s.ctaTitle}</p>
      <p className="mt-2 text-white/75">{s.line}</p>
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-7">
        <Link href="/pricing" className="btn btn-primary" data-cta={`post-${s.slug}-packages`}>
          See packages
          <ArrowRight />
        </Link>
        <Link href={`/services/${s.slug}`} className="link-u font-head font-medium text-white">
          Learn about {s.name}
          <ArrowRight />
        </Link>
      </div>
    </aside>
  );
}

export default async function Page({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const { meta, content: source } = post;
  const { content } = await compileMDX({
    source,
    options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
    components: {
      h2: ({ children }: Kids) => <h2 id={headingSlug(textOf(children))}>{children}</h2>,
      table: ({ children }: Kids) => (
        <div className="post-table" tabIndex={0} role="region" aria-label="Table">
          <table>{children}</table>
        </div>
      ),
      BeforeAfter,
      Callout,
      CTA: Cta,
    },
  });
  const headings = getHeadings(source);
  const all = getPosts();
  const others = all.filter((p) => p.slug !== meta.slug);
  const related = [...others.filter((p) => p.category === meta.category), ...others.filter((p) => p.category !== meta.category)].slice(0, 3);
  const index = all.findIndex((p) => p.slug === meta.slug);
  const prev = all[index - 1];
  const next = all[index + 1];
  const url = `${SITE}/blog/${meta.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: meta.title,
          description: meta.description,
          datePublished: meta.date,
          dateModified: meta.updated ?? meta.date,
          author: { "@type": "Organization", name: meta.author },
          publisher: { "@type": "Organization", "@id": `${SITE}/#org`, name: "Pixely Careers", logo: { "@type": "ImageObject", url: `${SITE}/brand/logo.png` } },
          image: `${url}/opengraph-image`,
          mainEntityOfPage: url,
          keywords: meta.keywords.join(", "),
        }}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: meta.title, path: `/blog/${meta.slug}` }])} />
      {meta.faq && <JsonLd data={faqJsonLd(meta.faq)} />}
      <ReadingProgress />

      <div className="page-top wrap pb-24 lg:pb-32">
        <div className="post-grid">
          <article data-post-body className="min-w-0">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: meta.category, href: `/blog?category=${encodeURIComponent(meta.category)}` }]} />
            <p className="label mt-6">{meta.category}</p>
            <h1 className="page-h1 mt-5 text-[clamp(36px,4.2vw,56px)] leading-[1.05]">{meta.title}</h1>
            <p className="mt-5 text-xl leading-[1.5] text-pretty text-navy/75">{meta.description}</p>
            <p className="mt-5 text-sm text-navy/70">
              {meta.author} · {meta.dateLabel}
              {meta.updatedLabel && ` · Updated ${meta.updatedLabel}`} · {meta.readingTime}
            </p>
            <details className="post-toc-mobile">
              <summary>On this page</summary>
              {headings.map((h) => (
                <a key={h} href={`#${headingSlug(h)}`}>
                  {h}
                </a>
              ))}
            </details>
            <div className="post-body">{content}</div>

            {meta.faq && (
              <section aria-labelledby="post-faq" className="mt-16">
                <h2 id="post-faq" className="font-head mb-6 text-[32px] leading-[1.2] font-semibold tracking-[-0.02em]">
                  FAQ
                </h2>
                <Accordion items={meta.faq} reveal={false} />
              </section>
            )}
            <ShareRow title={meta.title} url={url} />
            <nav aria-label="More posts" className="mt-10 grid gap-4 border-t border-navy/15 pt-6 sm:grid-cols-2">
              {prev ? (
                <Link href={`/blog/${prev.slug}`} className="py-2 hover:text-vivid">
                  <span className="block text-sm text-navy/70">Previous</span>
                  <span className="font-medium">{prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={`/blog/${next.slug}`} className="py-2 hover:text-vivid sm:text-right">
                  <span className="block text-sm text-navy/70">Next</span>
                  <span className="font-medium">{next.title}</span>
                </Link>
              )}
            </nav>
          </article>
          <PostToc headings={headings} />
        </div>

        <section aria-labelledby="related-title" className="mt-20 lg:mt-28">
          <h2 id="related-title" className="font-head text-[32px] font-semibold tracking-[-0.02em]">
            Related posts
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <BlogCard post={p} />
              </li>
            ))}
          </ul>
        </section>
      </div>
      <MarketFinalCta />
      <Reveal />
    </>
  );
}
