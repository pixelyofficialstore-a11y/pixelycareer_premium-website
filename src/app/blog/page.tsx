import BlogIndex from "@/components/blog/BlogIndex";
import { getPosts } from "@/lib/blog";
import { JsonLd, SITE, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/blog",
  "Career Notes: CV, LinkedIn & Job Search Advice",
  "Practical advice on ATS CVs, LinkedIn profiles, cover letters and applying in the US, UK, UAE, Saudi Arabia and Pakistan.",
);

export default function Page() {
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
      <section className="page-top wrap pb-24 lg:pb-40">
        <p className="label">Blog</p>
        <h1 className="page-h1 mt-6">Career notes.</h1>
        <p className="page-sub">Practical advice for your next application.</p>
        <BlogIndex posts={getPosts()} />
      </section>
    </>
  );
}
