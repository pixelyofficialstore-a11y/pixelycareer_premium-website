import BlogIndex from "@/components/blog/BlogIndex";
import MarketFinalCta from "@/components/blog/MarketFinalCta";
import { getPosts } from "@/lib/blog";
import Reveal from "@/components/ui/Reveal";
import { JsonLd, SITE, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import "@/components/blog/blog.css";

export const metadata = pageMetadata(
  "/blog",
  "Career Notes: CV, LinkedIn & Job Search Advice",
  "Practical advice on ATS CVs, LinkedIn profiles, cover letters and applying in the US, UK, UAE, Saudi Arabia and Pakistan.",
);

export default function Page() {
  const posts = getPosts();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Career Notes",
          description: "Practical advice for your next application.",
          url: `${SITE}/blog`,
          publisher: { "@id": `${SITE}/#org` },
        }}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])} />
      <section className="blog-page">
        <div className="blog-intro">
        <p className="label">Blog</p>
        <h1 className="blog-heading mt-5">Career <em>notes.</em></h1>
        <p className="blog-deck">Practical advice for your next application.</p>
        <BlogIndex posts={posts} />
        </div>
      </section>
      <MarketFinalCta />
      <Reveal />
    </>
  );
}
