"use client";
import { useRef, useState } from "react";
import { MARKETS, type MarketKey } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";
import { whatsappMessage } from "@/lib/site";
import { CODES, Field, Handoff, focusFirstError, inputProps, validPhone, type Errors } from "./Fields";

export default function ContactForm({ market }: { market: MarketKey }) {
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [url, setUrl] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? "").trim();
    const next: Errors = {};
    if (!v("name")) next.name = "Enter your full name.";
    if (!validPhone(v("whatsapp"))) next.whatsapp = "Enter a valid WhatsApp number.";
    if (!v("message")) next.message = "Enter your message.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      requestAnimationFrame(() => focusFirstError(form.current));
      return;
    }
    const link = whatsappMessage(`Hi Pixely Careers.\nName: ${v("name")}\n${v("message")}`);
    setUrl(link);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  if (url) return <Handoff title="Message ready." level="h2" url={url} cta="contact-open-whatsapp" />;

  return (
    <form ref={form} onSubmit={submit} noValidate className="grid gap-5">
      <Field id="name" label="Name" required error={errors.name}>
        <input {...inputProps("name", errors.name, true)} type="text" autoComplete="name" />
      </Field>
      <Field id="whatsapp" label="WhatsApp" required error={errors.whatsapp}>
        <div className="flex gap-2">
          <select name="code" aria-label="Country code" defaultValue={MARKETS[market].phoneCode} className="form-input w-[104px] flex-none">
            {CODES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input {...inputProps("whatsapp", errors.whatsapp, true)} type="tel" inputMode="tel" autoComplete="tel-national" />
        </div>
      </Field>
      <Field id="message" label="Message" required error={errors.message}>
        <textarea {...inputProps("message", errors.message, true)} rows={4} className="form-input py-3" />
      </Field>
      <button type="submit" className="btn btn-primary mt-3 min-h-14 w-full cursor-pointer text-[1.0625rem]" data-cta="contact-send">
        Send on WhatsApp
        <ArrowRight />
      </button>
    </form>
  );
}
