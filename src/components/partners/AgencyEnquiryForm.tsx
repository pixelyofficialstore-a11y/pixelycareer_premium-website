"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { whatsappMessage } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";
import Turnstile from "@/components/forms/Turnstile";
import "./enquiry-form.css";

const ORGANIZATIONS = ["Recruitment agency", "OEP", "Career coach", "Employer or HR", "Training institute", "Other"];
const COUNTRIES = ["Pakistan", "Qatar", "Saudi Arabia", "UAE", "Kuwait", "Oman", "Bahrain", "UK", "Other"];
const VOLUMES = ["1 to 10", "10 to 30", "30 to 100", "100+"];
const CODES = [["PK", "+92"], ["SA", "+966"], ["AE", "+971"], ["QA", "+974"], ["OM", "+968"], ["KW", "+965"], ["BH", "+973"], ["UK", "+44"], ["US / CA", "+1"], ["IN", "+91"], ["BD", "+880"], ["PH", "+63"], ["NP", "+977"], ["LK", "+94"], ["EG", "+20"]];

type Enquiry = {
  organization: string; organizationType: string; name: string;
  code: string; phone: string; email: string; country: string;
  volume: string; model: string; notes: string;
};
type Errors = Partial<Record<keyof Enquiry, string>>;
const initial: Enquiry = {
  organization: "", organizationType: "", name: "", code: "+92", phone: "", email: "",
  country: "", volume: "", model: "", notes: "",
};

function validate(form: Enquiry, step: number): Errors {
  const errors: Errors = {};
  if (step === 1) {
    if (!form.name.trim()) errors.name = "Enter your name.";
    if (!form.organization.trim()) errors.organization = "Enter your agency name.";
    if (!form.organizationType) errors.organizationType = "Choose an organization type.";
    if (!form.country) errors.country = "Choose your country.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid work email address.";
    const digits = `${form.code}${form.phone}`.replace(/\D/g, "").length;
    if (!form.phone.trim() || !/^[\d\s().-]+$/.test(form.phone) || digits < 7 || digits > 15) errors.phone = "Enter a valid WhatsApp number without the country code.";
  } else {
    if (!form.volume) errors.volume = "Choose your monthly volume.";
    if (!form.model) errors.model = "Choose a partnership model.";
  }
  return errors;
}

function messageFor(form: Enquiry) {
  return [
    "New agency enquiry",
    `Contact: ${form.name.trim()}`,
    `Agency: ${form.organization.trim()} (type: ${form.organizationType})`,
    `WhatsApp: ${form.code} ${form.phone.trim()} | Email: ${form.email.trim()}`,
    `Country: ${form.country}`,
    `Monthly candidates: ${form.volume}`,
    `Preferred model: ${form.model}`,
    `Notes: ${form.notes.trim() || "Not provided"}`,
  ].join("\n");
}

export default function AgencyEnquiryForm({ preferredModel }: { preferredModel: { model: string; request: number } | null }) {
  const [form, setForm] = useState<Enquiry>(initial);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [handoffUrl, setHandoffUrl] = useState("");
  const [ts, setTs] = useState("");
  const hp = useRef<HTMLInputElement>(null);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus({ preventScroll: true });
  }, [step, submitted]);
  useEffect(() => {
    if (preferredModel) setForm((current) => ({ ...current, model: preferredModel.model }));
  }, [preferredModel]);
  useEffect(() => {
    const onSample = () => setForm((current) => ({ ...current, notes: current.notes.includes("Sample pack") ? current.notes : `Sample pack${current.notes ? `. ${current.notes}` : ""}` }));
    window.addEventListener("agency-sample-pack", onSample);
    return () => window.removeEventListener("agency-sample-pack", onSample);
  }, []);

  const update = <K extends keyof Enquiry>(field: K, value: Enquiry[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form, step);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      window.setTimeout(() => document.querySelector<HTMLElement>(".agency-form-card [aria-invalid='true']")?.focus(), 0);
      return;
    }
    if (step === 1) { setStep(2); return; }
    const firstStepErrors = validate(form, 1);
    if (Object.keys(firstStepErrors).length) { setErrors(firstStepErrors); setStep(1); return; }
    const message = messageFor(form);
    const url = whatsappMessage(message);
    setHandoffUrl(url);
    // Saved for the CRM in the background; the WhatsApp handoff never waits for it.
    const ck = (n: string) => document.cookie.match(new RegExp(`(?:^|; )${n}=([^;]+)`))?.[1] ?? null;
    fetch("/api/partners", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify({
      turnstile: ts, name: form.name, orgName: form.organization, orgType: form.organizationType || null, code: form.code, whatsapp: form.phone, email: form.email || null,
      countryHq: form.country || null, monthlyVolume: form.volume || null, model: form.model || null, notes: form.notes || null, website: hp.current?.value ?? "", fbp: ck("_fbp"), fbc: ck("_fbc"),
    }) }).catch(() => {});
    try {
      localStorage.setItem("pixely:agency-enquiry", JSON.stringify({ ...form, message, createdAt: new Date().toISOString() }));
    } catch { setStorageUnavailable(true); }
    try {
      trackEvent("generate_lead", { form_name: "agency_partnership", method: "WhatsApp" });
    } catch { /* Optional analytics must never block the enquiry. */ }
    setSubmitted(true);
    const handoff = window.open(url, "_blank");
    if (handoff) handoff.opener = null;
  };

  const error = (field: keyof Enquiry) => errors[field] ? <span className="agency-input-error" id={`error-${field}`} role="alert">{errors[field]}</span> : null;
  const fieldProps = (field: keyof Enquiry) => ({
    "aria-invalid": Boolean(errors[field]), "aria-describedby": errors[field] ? `error-${field}` : undefined,
  });
  const choices = (field: "volume" | "model", label: string, options: string[], required = false) => (
    <fieldset className="agency-choice-group" aria-describedby={errors[field] ? `error-${field}` : undefined}>
      <legend>{label}{required && <span aria-hidden="true"> *</span>}</legend>
      <div className="agency-choice-list" role="radiogroup" aria-label={label} aria-required={required || undefined}>
        {options.map((option) => {
          const selected = form[field] === option;
          return <button type="button" key={option} className="agency-choice" role="radio" aria-checked={selected} aria-invalid={Boolean(errors[field])}
            onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const index = options.indexOf(option);
              const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + options.length) % options.length;
              update(field, options[next]);
              (event.currentTarget.parentElement?.children[next] as HTMLElement)?.focus();
            }}
            onClick={() => update(field, option)}>{option}</button>;
        })}
      </div>
      {error(field)}
    </fieldset>
  );

  if (submitted) return (
    <div className="agency-enquiry agency-form-card agency-form-confirmation" role="status">
      <svg className="agency-success-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" /><path d="m14 24 7 7 14-15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <h3 ref={headingRef} tabIndex={-1}>Thanks, {form.name.trim()}. We&apos;ll reply on WhatsApp shortly.</h3>
      <p>Send the prepared message in WhatsApp to complete your enquiry.</p>
      <a href={handoffUrl} target="_blank" rel="noopener noreferrer" className="agency-form-submit">Open WhatsApp now <span className="agency-button-arrow">→</span></a>
      {storageUnavailable && <p className="agency-backup-note">Your browser could not save a backup. Your WhatsApp message is still ready.</p>}
    </div>
  );

  return (
    <div className="agency-enquiry">
      <form className="agency-form-card" onSubmit={submit} noValidate aria-label="Agency partnership enquiry">
        <h2 className="agency-form-heading">Book a 15 minute partner call</h2>
        <ol className="agency-form-progress" aria-label="Enquiry progress">
          <li aria-current={step === 1 ? "step" : undefined} data-complete={step > 1}><span aria-hidden="true">1</span>About you</li>
          <li aria-current={step === 2 ? "step" : undefined}><span aria-hidden="true">2</span>Your needs</li>
        </ol>
        <div className="agency-form-stage" key={step}>
          <h3 ref={headingRef} tabIndex={-1} className="agency-form-step-title">Step {step} of 2: {step === 1 ? "About you" : "Your needs"}</h3>
          {step === 1 ? (
            <div className="agency-form-grid">
              <div className="agency-field"><label htmlFor="your-name">Your name *</label><input id="your-name" autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} required {...fieldProps("name")} />{error("name")}</div>
              <div className="agency-field"><label htmlFor="agency-name">Agency name *</label><input id="agency-name" name="organization" autoComplete="organization" value={form.organization} onChange={(e) => update("organization", e.target.value)} required {...fieldProps("organization")} />{error("organization")}</div>
              <div className="agency-field agency-field-wide"><label htmlFor="organization-type">Agency type *</label><select id="organization-type" value={form.organizationType} onChange={(e) => update("organizationType", e.target.value)} required {...fieldProps("organizationType")}><option value="">Select agency type</option>{ORGANIZATIONS.map((item) => <option key={item}>{item}</option>)}</select>{error("organizationType")}</div>
              <div className="agency-field agency-field-wide"><label htmlFor="agency-country">Country *</label><select id="agency-country" value={form.country} autoComplete="country-name" onChange={(e) => update("country", e.target.value)} required {...fieldProps("country")}><option value="">Select country</option>{COUNTRIES.map((item) => <option key={item}>{item}</option>)}</select>{error("country")}</div>
              <div className="agency-field agency-field-wide"><label htmlFor="agency-email">Work email *</label><input id="agency-email" type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} required {...fieldProps("email")} />{error("email")}</div>
              <div className="agency-field agency-field-wide"><label htmlFor="whatsapp-number">WhatsApp number *</label><div className="agency-phone-input"><select aria-label="Country calling code" autoComplete="tel-country-code" value={form.code} onChange={(e) => update("code", e.target.value)}>{CODES.map(([country, code]) => <option value={code} key={country}>{country} {code}</option>)}</select><input id="whatsapp-number" type="tel" inputMode="tel" autoComplete="tel-national" value={form.phone} onChange={(e) => update("phone", e.target.value)} required {...fieldProps("phone")} /></div>{error("phone")}</div>
            </div>
          ) : (
            <div className="agency-needs-fields">
              {choices("volume", "Monthly candidates", VOLUMES, true)}
              {choices("model", "Preferred model", ["White label", "Referral", "Both"], true)}
              <div className="agency-field"><label htmlFor="agency-notes">Notes (optional)</label><textarea id="agency-notes" rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} /></div>
            </div>
          )}
          <div className="agency-form-navigation">
            {step === 2 && <button type="button" className="agency-form-back" onClick={() => { setErrors({}); setStep(1); }}>Back</button>}
            {step === 2 && <><input ref={hp} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }} /><Turnstile onToken={setTs} /></>}
            <button className="agency-form-submit" type="submit" data-cta={step === 1 ? "agency-form-next" : "agency-form-schedule"}>{step === 1 ? "Next" : "Schedule my call"} <span className="agency-button-arrow">→</span></button>
          </div>
        </div>
      </form>
    </div>
  );
}
