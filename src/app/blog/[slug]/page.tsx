import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import remarkGfm from "remark-gfm";
import BeforeAfter from "@/components/blog/BeforeAfter";
import BlogCard from "@/components/blog/BlogCard";
import BlogCoverFallback from "@/components/blog/BlogCoverFallback";
import BlogFaq from "@/components/blog/BlogFaq";
import BlogPostMarket from "@/components/blog/BlogPostMarket";
import BackButton from "@/components/ui/BackButton";
import MarketFinalCta from "@/components/blog/MarketFinalCta";
import MidCta from "@/components/blog/MidCta";
import { PostToc, ReadingProgress, ShareRow } from "@/components/blog/PostTools";
import { headingSlug } from "@/components/blog/slug";
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
    title: { absolute: `${seoTitle(meta.title, meta.keyword)} | Pixely Careers` },
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

/** The post title, or when it is over 60 characters, a shorter one that leads with the target keyword. */
function seoTitle(title: string, keyword?: string) {
  if (title.length <= 60) return title;
  const cap = (s: string) => s.replace(/\b\w/g, (ch) => ch.toUpperCase());
  if (keyword) {
    const escaped = keyword.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&");
    const rest = title.replace(new RegExp(escaped, "i"), "").replace(/^[\s:,.]+|[\s:,.]+$/g, "");
    const lead = cap(keyword);
    const both = rest ? lead + ": " + rest : lead;
    if (both.length <= 60) return both;
    return lead.slice(0, 60);
  }
  return title.slice(0, 60).replace(/\s+\S*$/, "");
}

/** Links the first mention of a few key terms to their guide: at most 3 per post, never to itself. */
const INTERNAL_LINKS: [RegExp, string][] = [
  [/\bATS\b/, "/blog/ats-friendly-resume-checklist"],
  [/\bLinkedIn profile\b/i, "/blog/linkedin-profile-optimization"],
  [/\bresume format\b/i, "/blog/resume-format-2026"],
  [/\bkeywords\b/i, "/blog/resume-keywords"],
  [/\bcover letter\b/i, "/blog/cover-letter-guide"],
];
function addInternalLinks(source: string, slug: string) {
  const lines = source.split("\n");
  let added = 0;
  for (const [term, href] of INTERNAL_LINKS) {
    if (added >= 3 || href === "/blog/" + slug) continue;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Body text only: no headings, tables, components, quotes or lines that already hold links.
      if (/^\s*(#|\||<|>|\[|!|-{3})/.test(line) || line.includes("](")) continue;
      const match = line.match(term);
      if (!match || match.index === undefined) continue;
      lines[i] = line.slice(0, match.index) + "[" + match[0] + "](" + href + ")" + line.slice(match.index + match[0].length);
      added++;
      break;
    }
  }
  return lines.join("\n");
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

function addMidCta(source: string) {
  const matches = [...source.matchAll(/^## .+$/gm)];
  if (matches.length < 2) return source;
  const insertion = matches[2]?.index ?? source.length;
  return `${source.slice(0, insertion)}\n<MidArticleCTA />\n${source.slice(insertion)}`;
}

/** The brand mark (the favicon) next to "Pixely Careers Team". */
function Avatar() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/icon.png" alt="Pixely Careers" width={24} height={24} className="post-avatar-img" />;
}

export default async function Page({ params }: Props) {
  const loaded = getPost((await params).slug);
  if (!loaded) notFound();
  const meta = loaded.meta;
  const { content: originalSource } = loaded;
  const source = addMidCta(addInternalLinks(originalSource, meta.slug));
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
      MidArticleCTA: MidCta,
    },
  });
  const headings = getHeadings(originalSource);
  const all = getPosts();
  const others = all.filter((post) => post.slug !== meta.slug);
  const related = [
    ...others.filter((post) => post.category === meta.category),
    ...others.filter((post) => post.category !== meta.category),
  ].slice(0, 3);
  const url = `${SITE}/blog/${meta.slug}`;
  const coverAbsolute = meta.cover ? `${SITE}${meta.cover}` : `${url}/opengraph-image`;

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
        { name: meta.category, path: "/blog" },
      ])} />
      {meta.faq?.length ? <JsonLd data={faqJsonLd(meta.faq)} /> : null}
      <ReadingProgress />
      <BlogPostMarket market={meta.market} />

      <div className="post-page">
        <div className="post-page-top">
          <div className="post-layout">
            <article className="post-article" data-post-body>
              <div className="crumbs-row">
                <BackButton fallback="/blog" />
                <nav className="post-breadcrumbs" aria-label="Breadcrumb">
                  <Link href="/">Home</Link><span aria-hidden="true">/</span>
                  <Link href="/blog">Blog</Link><span aria-hidden="true">/</span>
                  <span>{meta.category}</span>
                </nav>
              </div>
              <p className="post-category">{meta.category}</p>
              <h1 className="post-title">{meta.title}</h1>
              <p className="post-subtitle">{meta.description}</p>
              <div className="post-byline">
                <Avatar />
                <span>Pixely Careers Team</span>
                <span aria-hidden="true">·</span>
                <span><span className="date-long">{meta.dateLabel}</span><span className="date-short">{new Date(`${meta.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</span></span>
                {meta.updatedLabel && <span className="date-long"><span aria-hidden="true">· </span>Updated {meta.updatedLabel}</span>}
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

              <p className="post-by"><Avatar /> By Pixely Careers Team <span aria-hidden="true">·</span> <Link href="/about">About us <span aria-hidden="true">→</span></Link></p>
              <ShareRow title={meta.title} url={url} />
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
