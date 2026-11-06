import { LAST_UPDATED, type LegalSection } from "@/config/legal";
import Rich from "@/components/ui/Rich";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";

export default function LegalPage({ title, path, sections }: { title: string; path: string; sections: LegalSection[] }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: title, path }])} />
      <div className="page-top wrap pb-24 lg:pb-40">
        <div className="doc-grid">
          <nav aria-label="On this page" className="doc-toc">
            {sections.map((s, i) => (
              <a key={s.title} href={`#s${i + 1}`}>
                {i + 1}. {s.title}
              </a>
            ))}
          </nav>
          <article>
            {process.env.NODE_ENV === "development" && <p className="confirm mb-6">Draft. Have this reviewed by a lawyer before launch.</p>}
            <h1 className="page-h1 text-[clamp(44px,5vw,72px)]">{title}</h1>
            <p className="mt-4 text-sm text-navy/70">Last updated: {LAST_UPDATED}</p>
            <div className="prose-doc mt-4">
              {sections.map((s, i) => (
                <section key={s.title}>
                  <h2 id={`s${i + 1}`}>
                    {i + 1}. {s.title}
                  </h2>
                  <p>
                    <Rich text={s.text} />
                  </p>
                </section>
              ))}
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
