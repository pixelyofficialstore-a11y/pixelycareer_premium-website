"use client";
import { useRef, useState } from "react";
import { MARKETS, formatPrice, getPackages, type MarketKey, type PackageId } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";
import { trackEvent } from "@/lib/analytics";
import { TARGET_COUNTRIES, whatsappMessage } from "@/lib/site";
import { CODES, Field, Handoff, focusFirstError, inputProps, validPhone, type Errors } from "./Fields";

const makeId = () => {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  return `PC-${String(n[0] % 1000000).padStart(6, "0")}`;
};

export default function OrderForm({ market, initial }: { market: MarketKey; initial?: PackageId }) {
  const m = MARKETS[market];
  const packages = getPackages(m);
  const form = useRef<HTMLFormElement>(null);
  const [packageId, setPackageId] = useState<PackageId | undefined>(initial);
  const [sameDay, setSameDay] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<{ id: string; url: string } | null>(null);

  const pkg = packages.find((p) => p.id === packageId);
  const total = pkg ? pkg.price + (sameDay ? pkg.sameDay : 0) : 0;
  const addOns = [...new Set(packages.map((p) => p.sameDayLabel))].join(" or ");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? "").trim();
    const next: Errors = {};
    if (!pkg) next.package = "Choose a package.";
    if (!v("name")) next.name = "Enter your full name.";
    if (!validPhone(v("whatsapp"))) next.whatsapp = "Enter a valid WhatsApp number.";
    if (v("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) next.email = "Enter a valid email, or leave it empty.";
    if (!v("country")) next.country = "Choose your target country.";
    if (!v("role")) next.role = "Enter your target role.";
    setErrors(next);
    if (Object.keys(next).length > 0 || !pkg) {
      requestAnimationFrame(() => focusFirstError(form.current));
      return;
    }

    const id = makeId();
    const url = whatsappMessage(
      [
        "Hi Pixely Careers, I'd like to place an order.",
        `Order ID: ${id}`,
        `Package: ${pkg.name} (${pkg.priceLabel})`,
        `Delivery: ${sameDay ? `Same day (${pkg.sameDayLabel})` : "Standard"}`,
        `Name: ${v("name")}`,
        ...(v("email") ? [`Email: ${v("email")}`] : []),
        `Target country: ${v("country")}`,
        `Target role: ${v("role")}`,
        `I'll attach my current ${m.word} in this chat.`,
      ].join("\n"),
    );
    trackEvent("generate_lead", { package: pkg.id, market: m.key });
    setDone({ id, url });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (done) {
    return <Handoff title={`Request ${done.id} created.`} url={done.url} cta="order-open-whatsapp" note="Your order isn't confirmed until we reply on WhatsApp." />;
  }

  return (
    <>
      <h1 className="form-title">Start your order.</h1>
      <p className="mt-4 text-lg text-navy/70">Takes 1 minute. We’ll confirm everything on WhatsApp.</p>

      <form ref={form} onSubmit={submit} noValidate className="mt-10">
        <fieldset aria-describedby={errors.package ? "package-error" : undefined}>
          <legend className="form-label">
            Package<span aria-hidden="true"> *</span>
          </legend>
          <div className="mt-2 grid gap-3">
            {packages.map((p) => (
              <label key={p.id} className={`order-pack ${p.id === packageId ? "is-on" : ""}`}>
                <input type="radio" name="package" value={p.id} checked={p.id === packageId} aria-invalid={errors.package ? true : undefined} onChange={() => setPackageId(p.id)} />
                <span className="flex-1 font-medium">{p.name}</span>
                <span className="font-semibold tabular-nums">{p.priceLabel}</span>
              </label>
            ))}
          </div>
          {errors.package && (
            <p id="package-error" className="form-error">
              {errors.package}
            </p>
          )}
        </fieldset>

        <label className="order-toggle">
          <input type="checkbox" role="switch" checked={sameDay} onChange={(e) => setSameDay(e.target.checked)} />
          <span aria-hidden="true" className="order-switch" />
          <span className="flex-1">Same-day delivery</span>
          <span className="text-navy/70 tabular-nums">{pkg ? pkg.sameDayLabel : addOns}</span>
        </label>

        <div className="mt-8 grid gap-5">
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
          <Field id="email" label="Email" error={errors.email}>
            <input {...inputProps("email", errors.email)} type="email" autoComplete="email" />
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
        </div>

        <dl className="order-summary" aria-live="polite">
          <div>
            <dt>Package</dt>
            <dd>{pkg ? pkg.name : "Not chosen yet"}</dd>
          </div>
          <div>
            <dt>Delivery</dt>
            <dd>{sameDay ? "Same day" : pkg ? pkg.deliveryDays : "Standard"}</dd>
          </div>
          <div className="order-total">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(m, total)}</dd>
          </div>
        </dl>

        <button type="submit" className="btn btn-primary mt-8 min-h-14 w-full cursor-pointer text-[1.0625rem]" data-cta="order-send-request">
          Send order request
          <ArrowRight />
        </button>
      </form>
    </>
  );
}
