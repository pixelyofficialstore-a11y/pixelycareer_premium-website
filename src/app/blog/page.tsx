import BlogIndex from "@/components/blog/BlogIndex";
import MarketFinalCta from "@/components/blog/MarketFinalCta";
import { getPosts } from "@/lib/blog";
import Reveal from "@/components/ui/Reveal";
import { JsonLd, SITE, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import "@/components/blog/blog.css";

export const metadata = pageMetadata(
  "/blog",
  "The Career Playbook: CV, Resume and LinkedIn Advice",
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
          name: "The Career Playbook",
          description: "Practical advice for your next application.",
          url: `${SITE}/blog`,
          publisher: { "@id": `${SITE}/#org` },
        }}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])} />
      <section className="blog-page">
        <div className="blog-intro">
        <div className="blog-heading-block">
          <h1 className="blog-heading display">The career <em>playbook.</em></h1>
          <p className="blog-deck">What recruiters look for, explained simply.</p>
        </div>
        <BlogIndex posts={posts} />
        </div>
      </section>
      <MarketFinalCta />
      <Reveal />
    </>
  );
}
