function CategoryIcon({ category }: { category: string }) {
  if (category === "LinkedIn") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.5 9.2v8.3M6.5 6.6v.1M10.2 17.5v-8h3.2v1.2c.5-.9 1.4-1.4 2.5-1.4 2 0 3 1.3 3 3.5v4.7h-3.2v-4.2c0-1.1-.4-1.7-1.3-1.7s-1.2.7-1.2 1.7v4.2h-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6.5" cy="6.6" r="1" fill="currentColor"/></svg>;
  }
  if (category === "Gulf jobs") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 19.5h15M7 19V9.5l5-4 5 4V19M10 19v-5h4v5M9.5 10.5h.1m4.8 0h.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }
  if (category === "UK & Europe") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7"/><path d="M3.8 10h16.4M5.3 15h13.4M12 3.5c2.2 2.2 3.2 5 3.2 8.5s-1 6.3-3.2 8.5C9.8 18.3 8.8 15.5 8.8 12s1-6.3 3.2-8.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
  }
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 4.5h7l4 4V19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 4.8V9h4M9 12h6M9 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

export default function BlogCoverFallback({ category }: { category: string }) {
  const family = category === "LinkedIn" ? "linkedin" : category === "Gulf jobs" ? "gulf" : category === "UK & Europe" ? "europe" : "cv";
  return (
    <div className={`blog-cover-fallback blog-cover-${family}`} role="img" aria-label={`${category} editorial illustration`}>
      <span className="blog-cover-icon"><CategoryIcon category={category} /></span>
      <span className="blog-cover-sheet" aria-hidden="true">
        <i /><i /><i /><i /><i /><i />
      </span>
    </div>
  );
}
