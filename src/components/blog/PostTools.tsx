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
      <p className="mb-3 text-sm font-semibold">On this page</p>
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
  const cls = "inline-flex min-h-11 items-center underline underline-offset-4 hover:text-vivid";
  return (
    <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-1 text-[15px] font-medium">
      <span className="text-navy/70">Share:</span>
      <button
        type="button"
        className={`${cls} cursor-pointer`}
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        }}
      >
        <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
      </button>
      <a className={cls} href={`https://wa.me/?text=${text}%20${link}`} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
      <a className={cls} href={`https://www.linkedin.com/sharing/share-offsite/?url=${link}`} target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a>
      <a className={cls} href={`https://x.com/intent/post?text=${text}&url=${link}`} target="_blank" rel="noopener noreferrer">
        X
      </a>
    </div>
  );
}
