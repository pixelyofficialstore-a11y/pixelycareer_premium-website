"use client";
import { useRef, useState } from "react";
import { MARKETS, localize, type MarketKey } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";
import { TARGET_COUNTRIES, whatsappMessage } from "@/lib/site";
import { CODES, Field, Handoff, focusFirstError, inputProps, validPhone, type Errors } from "./Fields";

export default function ReviewForm({ market }: { market: MarketKey }) {
  const m = MARKETS[market];
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
    if (!v("country")) next.country = "Choose your target country.";
    if (!v("role")) next.role = "Enter your target role.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      requestAnimationFrame(() => focusFirstError(form.current));
      return;
    }
    const link = whatsappMessage(localize(m, `Hi, I'd like a free CV review.\nName: ${v("name")}\nTarget: ${v("role")}, ${v("country")}\nI'll attach my CV here.`));
    setUrl(link);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  if (url) return <Handoff title="Request created." url={url} cta="review-open-whatsapp" />;

  return (
    <>
      <h1 className="form-title">{localize(m, "Get a free CV review.")}</h1>
      <p className="mt-4 text-lg text-navy/70">{localize(m, "Send your CV. We’ll tell you what’s holding it back.")}</p>
      <form ref={form} onSubmit={submit} noValidate className="mt-10 grid gap-5">
        <Field id="name" label="Full name" required error={errors.name}>
          <input {...inputProps("name", errors.name, true)} type="text" autoComplete="name" />
        </Field>
        <Field id="whatsapp" label="WhatsApp number" required error={errors.whatsapp}>
          <div className="flex gap-2">
            <select name="code" aria-label="Country code" defaultValue={m.phoneCode} className="form-input w-[104px] flex-none">
              {CODES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input {...inputProps("whatsapp", errors.whatsapp, true)} type="tel" inputMode="tel" autoComplete="tel-national" />
          </div>
        </Field>
        <Field id="country" label="Target country" required error={errors.country}>
          <select {...inputProps("country", errors.country, true)} defaultValue="">
            <option value="" disabled>
              Choose a country
            </option>
            {TARGET_COUNTRIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field id="role" label="Target role" required error={errors.role}>
          <input {...inputProps("role", errors.role, true)} type="text" />
        </Field>
        <button type="submit" className="btn btn-primary mt-3 min-h-14 w-full cursor-pointer text-[1.0625rem]" data-cta="review-send-request">
          Request my free review
          <ArrowRight />
        </button>
      </form>
    </>
  );
}
