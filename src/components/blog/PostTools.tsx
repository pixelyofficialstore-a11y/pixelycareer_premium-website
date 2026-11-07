"use client";
import { useEffect, useRef, useState } from "react";
import { headingSlug } from "./slug";

export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const paint = () => {
      frame = 0;
      const article = document.querySelector<HTMLElement>("[data-post-body]");
      if (!article || !bar.current) return;
      const r = article.getBoundingClientRect();
      const done = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      bar.current.style.transform = `scaleX(${done})`;
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, []);
  return <div ref={bar} aria-hidden="true" className="read-progress" />;
}

/** Sticky contents on desktop, highlighting the section being read. */
export function PostToc({ headings }: { headings: string[] }) {
  const [active, setActive] = useState(headings[0] ? headingSlug(headings[0]) : "");
  useEffect(() => {
    const els = headings.map((h) => document.getElementById(headingSlug(h))).filter(Boolean) as HTMLElement[];
    const onScroll = () => {
      const passed = els.filter((e) => e.getBoundingClientRect().top < 240);
      setActive((passed.at(-1) ?? els[0])?.id ?? "");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);
  return (
    <nav aria-label="On this page" className="post-toc">
      <p className="post-toc-title">On this page</p>
      {headings.map((h) => {
        const id = headingSlug(h);
        return (
          <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined}>
            {h}
          </a>
        );
      })}
    </nav>
  );
}

export function ShareRow({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(title);
  const link = encodeURIComponent(url);
  const [copyFailed, setCopyFailed] = useState(false);
  const cls = "post-share-button";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
    }
    window.setTimeout(() => {
      setCopied(false);
      setCopyFailed(false);
    }, 2200);
  };
  return (
    <div className="post-share">
      <span className="post-share-label">Share</span>
      <button
        type="button"
        className={cls}
        onClick={copy}
        aria-label="Copy article link"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="11" height="12" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M15 8V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h1" stroke="currentColor" strokeWidth="1.7"/></svg>
        Copy link
      </button>
      <a className={cls} href={`https://wa.me/?text=${text}%20${link}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.7a8 8 0 0 1-11.8 7L4 20l1.3-4A8 8 0 1 1 20 11.7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M9 8.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .4-.1.6l-.5.6c-.2.2-.2.4 0 .6.4.7 1.1 1.3 1.8 1.7.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.3.6c.3.1.4.3.4.5 0 .3-.1 1.1-.7 1.5-.5.4-1 .6-1.7.4-.7-.2-1.6-.6-2.8-1.6-1.5-1.3-2.4-2.9-2.6-3.7-.2-.7.1-1.3.4-1.6Z" fill="currentColor"/></svg>
        WhatsApp
      </a>
      <a className={cls} href={`https://www.linkedin.com/sharing/share-offsite/?url=${link}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.7 8.5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM5.2 10h3v9h-3v-9Zm5 0h2.9v1.2h.1c.4-.8 1.4-1.5 2.8-1.5 3 0 3.5 2 3.5 4.5V19h-3v-4.3c0-1 0-2.3-1.5-2.3s-1.7 1.1-1.7 2.2V19h-3v-9Z"/></svg>
        LinkedIn
      </a>
      <a className={cls} href={`https://x.com/intent/post?text=${text}&url=${link}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.8 3H22l-7 8 8.2 10h-6.4l-5-6.1L6.4 21H3.1l7.5-8.6L2.8 3h6.6l4.5 5.7L18.8 3Zm-1.1 16.2h1.8L8.1 4.7H6.2l11.5 14.5Z"/></svg>
        X
      </a>
      {(copied || copyFailed) && <span className="post-share-toast" role="status" aria-live="polite">{copied ? "Link copied" : "Copy unavailable"}</span>}
    </div>
  );
}
