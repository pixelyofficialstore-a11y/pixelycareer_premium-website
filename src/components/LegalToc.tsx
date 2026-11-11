"use client";
import { useEffect, useState } from "react";

/** Desktop: sticky list with the active section in blue. Mobile: a collapsible "On this page" box, closed by default. */
export default function LegalToc({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (hit) setActive(hit.target.id);
    }, { rootMargin: "-120px 0px -60% 0px" });
    items.forEach((i) => { const el = document.getElementById(i.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);
  const links = items.map((i) => (
    <a key={i.id} href={`#${i.id}`} className={active === i.id ? "is-active" : undefined} aria-current={active === i.id ? "location" : undefined}>{i.label}</a>
  ));
  return (
    <>
      <nav className="lg-toc" aria-label="On this page">{links}</nav>
      <details className="lg-toc-mobile">
        <summary>On this page</summary>
        <nav aria-label="On this page">{links}</nav>
      </details>
    </>
  );
}
