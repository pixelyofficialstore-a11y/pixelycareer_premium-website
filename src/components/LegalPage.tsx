import Link from "next/link";
import { LEGAL, type LegalSection } from "@/config/legal";
import LegalToc from "@/components/LegalToc";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { WHATSAPP_URL } from "@/lib/site";
import "./legal-page.css";

/** Plain text with [label](/path) links. */
function Text({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\]\([^)]+\))/).map((part, i) => {
        const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        return m ? <Link key={i} href={m[2]}>{m[1]}</Link> : part;
      })}
    </>
  );
}

export default function LegalPage({ title, path, summary, sections }: { title: string; path: string; summary: string; sections: LegalSection[] }) {
  const toc = sections.map((s, i) => ({ id: `s${i + 1}`, label: `${i + 1}. ${s.title}` }));
  return (
    <div className="lg">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: title, path }])} />
      <header className="lg-hero">
        <div className="wrap">
          <h1 className="display">{title}</h1>
          <p className="lg-date">Last updated: {LEGAL.lastUpdated}</p>
          <p className="lg-summary">{summary}</p>
        </div>
      </header>
      <div className="wrap lg-grid">
        <LegalToc items={toc} />
        <article className="lg-body">
          {sections.map((s, i) => (
            <section key={s.title} id={`s${i + 1}`} className="lg-section">
              <h2>{i + 1}. {s.title}</h2>
              <p><Text text={s.text} /></p>
              {s.note && <p className="lg-note">{s.note}</p>}
            </section>
          ))}
          <aside className="lg-questions">
            Questions? Email <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> or <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">message us on WhatsApp</a>.
          </aside>
        </article>
      </div>
    </div>
  );
}
