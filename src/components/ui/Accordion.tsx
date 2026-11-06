"use client";
import { useId, useState } from "react";
import Rich from "@/components/ui/Rich";
import { refreshScroll } from "@/lib/motion";

export default function Accordion({ items, reveal = true }: { items: { q: string; a: string }[]; reveal?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  return (
    <div className="border-b border-navy/15">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-t border-navy/15" data-reveal={reveal ? true : undefined}>
            <h3>
              <button
                type="button"
                id={`${base}-q${i}`}
                aria-expanded={isOpen}
                aria-controls={`${base}-a${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="font-head flex min-h-20 w-full cursor-pointer items-center justify-between gap-6 py-6 text-left text-[clamp(20px,1.9vw,26px)] leading-tight font-medium tracking-[-0.015em] transition-colors hover:text-vivid"
              >
                {item.q}
                <span aria-hidden="true" className={`relative block h-5 w-5 flex-none transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
                  <span className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-current" />
                  <span className="absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 bg-current" />
                </span>
              </button>
            </h3>
            <div
              id={`${base}-a${i}`}
              role="region"
              aria-labelledby={`${base}-q${i}`}
              inert={!isOpen}
              onTransitionEnd={(e) => {
                if (e.propertyName === "grid-template-rows") refreshScroll();
              }}
              className={`grid transition-[grid-template-rows] duration-500 ease-out-soft ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p className="max-w-[56ch] pb-8 text-base leading-[1.6] text-pretty text-navy/75 lg:text-lg">
                  <Rich text={item.a} />
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
