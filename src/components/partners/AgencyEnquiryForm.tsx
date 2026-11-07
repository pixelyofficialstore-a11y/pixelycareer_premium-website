"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { whatsappMessage } from "@/lib/site";

type Enquiry = {
  agency: string;
  name: string;
  number: string;
  city: string;
  volume: string;
};

export default function AgencyEnquiryForm() {
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<Enquiry>({
    agency: "",
    name: "",
    number: "+92",
    city: "",
    volume: "1–10",
  });

  const update = (field: keyof Enquiry, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const agency = form.agency.trim();
    const name = form.name.trim();
    const number = form.number.trim();
    const digits = number.replace(/\D/g, "").length;
    if (!agency || !name || !/^\+?[\d\s().-]+$/.test(number) || digits < 7 || digits > 15) {
      setMessage("Enter your agency, name and a valid WhatsApp number.");
      return;
    }
    const text = [
      `New agency enquiry: ${agency}, ${name}, ${form.city.trim() || "Not provided"}, ${form.volume} candidates/month`,
      `WhatsApp number: ${number}`,
    ].join("\n");
    const handoff = window.open(whatsappMessage(text), "_blank");
    if (handoff) {
      handoff.opener = null;
      setMessage("Thanks. We'll reply on WhatsApp shortly.");
      return;
    }
    setMessage("Your browser blocked the WhatsApp window. Allow pop-ups and submit again.");
  };

  return (
    <div className="agency-enquiry">
      <form className="agency-form-card" onSubmit={submit} noValidate>
        <div className="agency-form-grid">
          <div className="agency-field agency-field-wide">
            <label htmlFor="agency-name">Agency name*</label>
            <input id="agency-name" name="agency" value={form.agency} onChange={(event) => update("agency", event.target.value)} autoComplete="organization" required />
          </div>
          <div className="agency-field">
            <label htmlFor="your-name">Your name*</label>
            <input id="your-name" name="name" value={form.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" required />
          </div>
          <div className="agency-field">
            <label htmlFor="whatsapp-number">WhatsApp number*</label>
            <input id="whatsapp-number" name="number" type="tel" inputMode="tel" value={form.number} onChange={(event) => update("number", event.target.value)} autoComplete="tel" required />
          </div>
          <div className="agency-field">
            <label htmlFor="agency-city">City</label>
            <input id="agency-city" name="city" value={form.city} onChange={(event) => update("city", event.target.value)} autoComplete="address-level2" />
          </div>
          <div className="agency-field">
            <label htmlFor="monthly-volume">Candidates per month</label>
            <select id="monthly-volume" name="volume" value={form.volume} onChange={(event) => update("volume", event.target.value)}>
              <option>1–10</option>
              <option>11–50</option>
              <option>51–100</option>
              <option>100+</option>
            </select>
          </div>
        </div>
        <button className="agency-form-submit" type="submit" data-cta="partners-form-submit">Request a call →</button>
        <p className="agency-form-message" role="status" aria-live="polite">{message}</p>
      </form>
      <div className="agency-contact-lines">
        <a href={whatsappMessage("Hi, I'm from [agency name]. I'd like to discuss a CV partnership.")} target="_blank" rel="noopener noreferrer">WhatsApp +92 370 6404900</a>
        <a href="https://www.instagram.com/pixelycareers.pk/" target="_blank" rel="noopener noreferrer">Instagram @pixelycareers.pk</a>
        <span>Facebook: Pixely Careers PK</span>
      </div>
    </div>
  );
}
