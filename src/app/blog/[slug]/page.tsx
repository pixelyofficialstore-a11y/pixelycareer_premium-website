import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import remarkGfm from "remark-gfm";
import { getService } from "@/config/services";
import BeforeAfter from "@/components/blog/BeforeAfter";
import BlogCard from "@/components/blog/BlogCard";
import BlogCoverFallback from "@/components/blog/BlogCoverFallback";
import BlogFaq from "@/components/blog/BlogFaq";
import MarketFinalCta from "@/components/blog/MarketFinalCta";
import { PostToc, ReadingProgress, ShareRow } from "@/components/blog/PostTools";
import { headingSlug } from "@/components/blog/slug";
import { ArrowRight } from "@/components/ui/Icons";
import Reveal from "@/components/ui/Reveal";
import { getHeadings, getPost, getPosts } from "@/lib/blog";
import { JsonLd, SITE, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import "@/components/blog/blog.css";

type Props = { params: Promise<{ slug: string }> };
type Kids = { children?: ReactNode };

export const generateStaticParams = () => getPosts().map((post) => ({ slug: post.slug }));

export async function generateMetadata({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) return {};
  const meta = post.meta;
  const image = meta.cover ? `${SITE}${meta.cover}` : undefined;
  const images = image ? [{ url: image, width: 1600, height: 1000, alt: meta.coverAlt || meta.title }] : undefined;
  return {
    title: { absolute: meta.title.length + 18 <= 60 ? `${meta.title} | Pixely Careers` : meta.title },
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: `/blog/${meta.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE}/blog/${meta.slug}`,
      siteName: "Pixely Careers",
      title: meta.title,
      description: meta.description,
      locale: "en_US",
      publishedTime: meta.date,
      modifiedTime: meta.updated ?? meta.date,
      ...(images ? { images } : {}),
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description, ...(images ? { images } : {}) },
  };
}

function textOf(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textOf).join("");
  if (children && typeof children === "object" && "props" in children) return textOf((children.props as Kids).children);
  return "";
}

function Callout({ type = "note", title, children }: Kids & { type?: "tip" | "note"; title?: string }) {
  return (
    <aside className="post-callout" data-kind={type}>
      <p className="post-callout-label">{type === "tip" ? "Tip" : "Note"}</p>
      {title && <p className="post-callout-title">{title}</p>}
      <div className="post-callout-body">{children}</div>
    </aside>
  );
}

function Cta() {
  const offering = getService("ats-cv");
  if (!offering) return null;
  return (
    <aside className="post-cta">
      <p className="post-cta-title">Want an ATS CV like this?</p>
      <p className="post-cta-copy">{offering.line}</p>
      <div className="post-cta-actions">
        <Link href="/pricing" className="btn btn-primary" data-cta={`post-${offering.slug}-packages`}>
          See packages <ArrowRight />
        </Link>
        <Link href={`/services/${offering.slug}`} className="link-u font-head font-medium text-white">
          Learn about ATS CV <ArrowRight />
        </Link>
      </div>
    </aside>
  );
}

function addMidCta(source: string) {
  const matches = [...source.matchAll(/^## .+$/gm)];
  if (matches.length < 2) return source;
  const insertion = matches[2]?.index ?? source.length;
  return `${source.slice(0, insertion)}\n<MidArticleCTA />\n${source.slice(insertion)}`;
}

function Avatar({ large = false }: { large?: boolean }) {
  return <span className="post-avatar" aria-hidden="true">{large ? "P" : "P"}</span>;
}

export default async function Page({ params }: Props) {
  const loaded = getPost((await params).slug);
  if (!loaded) notFound();
  const meta = loaded.meta;
  const { content: originalSource } = loaded;
  const source = addMidCta(originalSource);
  const readingTime = meta.readingTime;
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
      CTA: () => null,
      MidArticleCTA: Cta,
    },
  });
  const headings = getHeadings(originalSource);
  const all = getPosts();
  const others = all.filter((post) => post.slug !== meta.slug);
  const related = [
    ...others.filter((post) => post.category === meta.category),
    ...others.filter((post) => post.category !== meta.category),
  ].slice(0, 3);
  const index = all.findIndex((post) => post.slug === meta.slug);
  const previous = all.length > 1 ? all[(index - 1 + all.length) % all.length] : undefined;
  const next = all.length > 1 ? all[(index + 1) % all.length] : undefined;
  const url = `${SITE}/blog/${meta.slug}`;
  const coverAbsolute = meta.cover ? `${SITE}${meta.cover}` : `${url}/opengraph-image`;
  const authorDescription = "We write ATS CVs, Europass profiles and LinkedIn profiles for professionals in the US, UK, Gulf and Pakistan.";

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: meta.title,
        description: meta.description,
        datePublished: meta.date,
        dateModified: meta.updated ?? meta.date,
        author: { "@type": "Organization", name: "Pixely Careers" },
        publisher: { "@type": "Organization", "@id": `${SITE}/#org`, name: "Pixely Careers", logo: { "@type": "ImageObject", url: `${SITE}/brand/logo.png` } },
        image: coverAbsolute,
        mainEntityOfPage: url,
        keywords: meta.keywords.join(", "),
      }} />
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: meta.title, path: `/blog/${meta.slug}` },
      ])} />
      {meta.faq?.length ? <JsonLd data={faqJsonLd(meta.faq)} /> : null}
      <ReadingProgress />

      <div className="post-page">
        <div className="post-page-top">
          <div className="post-layout">
            <article className="post-article" data-post-body>
              <nav className="post-breadcrumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link><span aria-hidden="true">/</span>
                <Link href="/blog">Blog</Link><span aria-hidden="true">/</span>
                <Link href={`/blog?category=${encodeURIComponent(meta.category)}`}>{meta.category}</Link>
              </nav>
              <p className="post-category">{meta.category}</p>
              <h1 className="post-title">{meta.title}</h1>
              <p className="post-subtitle">{meta.description}</p>
              <div className="post-byline">
                <Avatar />
                <span>Pixely Careers Team</span>
                <span aria-hidden="true">·</span>
                <span>{meta.dateLabel}</span>
                {meta.updatedLabel && <><span aria-hidden="true">·</span><span>Updated {meta.updatedLabel}</span></>}
                <span aria-hidden="true">·</span>
                <span>{readingTime}</span>
              </div>
              <div className="post-hero-cover">
                {meta.cover ? (
                  <Image
                    src={meta.cover}
                    alt={meta.coverAlt || `Editorial cover for ${meta.title}`}
                    fill
                    priority
                    sizes="(max-width: 767px) 100vw, 720px"
                  />
                ) : (
                  <BlogCoverFallback category={meta.category} />
                )}
              </div>
              {meta.coverCredit && (
                <p className="post-cover-credit">
                  {meta.coverCreditUrl
                    ? <a href={meta.coverCreditUrl} target="_blank" rel="noreferrer">{meta.coverCredit}</a>
                    : meta.coverCredit}
                </p>
              )}
              {meta.takeaways?.length ? (
                <section className="post-takeaways" aria-labelledby="takeaways-title">
                  <h2 id="takeaways-title">Key takeaways</h2>
                  <ul>
                    {meta.takeaways.slice(0, 3).map((takeaway, itemIndex) => (
                      <li key={`${takeaway}-${itemIndex}`}>
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 10.2 4 4 8-8.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {headings.length > 0 && (
                <details className="post-toc-mobile">
                  <summary>On this page</summary>
                  <nav aria-label="On this page">
                    {headings.map((heading) => (
                      <a key={heading} href={`#${headingSlug(heading)}`}>{heading}</a>
                    ))}
                  </nav>
                </details>
              )}
              <div className="post-body">{content}</div>

              {meta.faq?.length ? (
                <section aria-labelledby="post-faq" className="post-faq">
                  <h2 id="post-faq">FAQ</h2>
                  <BlogFaq items={meta.faq} />
                </section>
              ) : null}

              <section className="post-author" aria-label="About the author">
                <Avatar large />
                <div>
                  <h2 className="post-author-name">Pixely Careers Team</h2>
                  <p>{authorDescription}</p>
                  <Link href="/about">About us <span aria-hidden="true">→</span></Link>
                </div>
              </section>
              <ShareRow title={meta.title} url={url} />

              <nav aria-label="More posts" className="post-pager">
                {previous ? (
                  <Link href={`/blog/${previous.slug}`} className="post-pager-card">
                    <span className="post-pager-direction">← Previous</span>
                    <span className="post-pager-title">{previous.title}</span>
                  </Link>
                ) : <span className="post-pager-card post-pager-empty" aria-hidden="true" />}
                {next ? (
                  <Link href={`/blog/${next.slug}`} className="post-pager-card">
                    <span className="post-pager-direction">Next →</span>
                    <span className="post-pager-title">{next.title}</span>
                  </Link>
                ) : <span className="post-pager-card post-pager-empty" aria-hidden="true" />}
              </nav>
            </article>
            {headings.length > 0 ? <PostToc headings={headings} /> : <div />}
          </div>
        </div>

        <section aria-labelledby="related-title" className="post-related">
          <h2 id="related-title">Related posts</h2>
          <ul className="post-related-grid">
            {related.map((post) => <li key={post.slug}><BlogCard post={post} /></li>)}
          </ul>
        </section>
      </div>
      <MarketFinalCta />
      <Reveal />
    </>
  );
}
