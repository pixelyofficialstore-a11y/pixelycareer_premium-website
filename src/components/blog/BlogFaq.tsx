"use client";
import { useState } from "react";

type Question = { q: string; a: string };

export default function BlogFaq({ items }: { items: Question[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      {items.map((item, index) => {
        const expanded = open === index;
        const answerId = `blog-faq-answer-${index}`;
        return (
          <div className="blog-faq-item" key={`${item.q}-${index}`}>
            <button
              type="button"
              className="blog-faq-question"
              aria-expanded={expanded}
              aria-controls={answerId}
              onClick={() => setOpen(expanded ? null : index)}
            >
              <span>{item.q}</span>
              <span className="blog-faq-plus" aria-hidden="true" />
            </button>
            <div id={answerId} className="blog-faq-answer" data-open={expanded} aria-hidden={!expanded}>
              <div><p>{item.a}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
