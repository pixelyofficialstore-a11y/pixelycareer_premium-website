"use client";
import { useEffect, useRef } from "react";
import { WhatsApp } from "@/components/ui/Icons";

export const CODES = ["+92", "+971", "+966", "+974", "+968", "+965", "+973", "+44", "+49", "+1"];

export type Errors = Record<string, string | undefined>;

export function Field({ id, label, required, error, children }: { id: string; label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="form-field">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Attributes shared by every input, so errors are announced and tied to their field. */
export const inputProps = (id: string, error: string | undefined, required?: boolean) => ({
  id,
  name: id,
  required,
  className: "form-input",
  "aria-invalid": error ? (true as const) : undefined,
  "aria-describedby": error ? `${id}-error` : undefined,
});

export const validPhone = (v: string) => /^\d{7,15}$/.test(v.replace(/[\s-]/g, "").replace(/^0/, ""));

export function focusFirstError(form: HTMLFormElement | null) {
  form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
}

/** Shown once a request is made: opens WhatsApp, with a button in case the popup was blocked. */
export function Handoff({ title, url, cta, note, level = "h1" }: { title: string; url: string; cta: string; note?: string; level?: "h1" | "h2" }) {
  const Heading = level;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
    window.scrollTo({ top: 0 });
  }, []);
  return (
    <div className="text-center">
      <meta name="robots" content="noindex" />
      <Heading ref={heading} tabIndex={-1} className="form-title outline-none">
        {title}
      </Heading>
      <p className="mt-4 text-lg text-navy/70">Opening WhatsApp…</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-8 min-h-14 px-8" data-cta={cta}>
        <WhatsApp size={20} />
        Open WhatsApp
      </a>
      {note && <p className="mt-6 text-sm text-navy/70">{note}</p>}
    </div>
  );
}
