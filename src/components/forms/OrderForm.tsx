"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { availableAddons, calcOrder, totalFor, unitAt, type Selection } from "@/config/addons";
import { MARKETS, formatPricingPrice, getPackages, localize, type MarketKey, type PackageId } from "@/config/markets";
import { PAYMENTS } from "@/config/payments";
import { trackEvent } from "@/lib/analytics";
import { useCountdown, useOffer } from "@/components/offer/useOffer";
import { inline } from "@/components/offer/Offer";
import { TARGET_COUNTRIES } from "@/lib/site";
import { CODES } from "./Fields";
import styles from "./OrderForm.module.css";

const STEPS = ["Package", "Your details", "Payment", "Review"];
const COUNTRY: Record<MarketKey, string> = { us: "USA", uk: "UK", ae: "UAE", sa: "Saudi Arabia", pk: "Pakistan" };
/** Short checklist per package: each item fits one line. */
const CHECKLIST = (key: string, id: PackageId) => {
  const gulf = key === "ae" || key === "sa" || key === "pk";
  if (id === "ats-career") return ["ATS CV", "Cover letter", "LinkedIn content", "Job keywords", "PDF and Word files"];
  if (id === "international-pro") return ["Everything in ATS", "International CV", "LinkedIn makeover", gulf ? "Indeed + Naukrigulf" : "Indeed", "Bio statement", "Contact card"];
  return ["Everything in Pro", "Executive CV", "Visual profile", "10 LinkedIn posts", "Interview guide"];
};
const PACKAGE_ORDER: PackageId[] = ["international-pro", "executive", "ats-career"];
const AUDIENCE: Record<PackageId, string> = {
  "ats-career": "For beginners and early careers",
  "international-pro": "For 3+ years of experience or applying abroad",
  executive: "For senior and leadership roles",
};
const MAX = 10 * 1024 * 1024;
type Errors = Record<string, string | undefined>;

const I = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const Shield = () => <svg width="15" height="15" viewBox="0 0 24 24" {...I} aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.4 3.2 8 7.5 9.5 4.3-1.5 7.5-5.1 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></svg>;
const CopyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" {...I} aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>;
const Upload = () => <svg width="22" height="22" viewBox="0 0 24 24" {...I} aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" /></svg>;
const WaIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z" /></svg>;
const MailIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" {...I} aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></svg>;
const FileIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" {...I} aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5" /></svg>;
const size = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      {children}
      {error && <p className={styles.error} id={`${id}-error`}>{error}</p>}
    </div>
  );
}

function Dropzone({ id, label, title, note, accept, file, onFile, error, small }: { id: string; label: string; title: string; note: string; accept: string; file: File | null; onFile: (f: File | null) => void; error?: string; small?: boolean }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {file ? (
        <div className={`${styles.fileChip} ${small ? styles.dropSmall : ""}`}>
          <FileIcon />
          <span className={styles.fileName}>{file.name}</span>
          <span className={styles.fileSize}>{size(file.size)}</span>
          <button type="button" onClick={() => onFile(null)} aria-label={`Remove ${file.name}`}>✕</button>
        </div>
      ) : (
        <label className={`${styles.drop} ${small ? styles.dropSmall : ""}`} data-error={error ? "true" : undefined}>
          <input id={id} type="file" accept={accept} onChange={(e) => onFile(e.target.files?.[0] ?? null)} aria-invalid={error ? true : undefined} />
          <Upload />
          <span className={styles.dropTitle}>{title}</span>
          <span className={styles.dropHint}>{note}</span>
        </label>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

function PayRow({ label, value, copy, mono }: { label: string; value: string; copy?: string; mono?: boolean }) {
  const [ok, setOk] = useState(false);
  return (
    <div className={styles.payRow}>
      <div className={styles.payText}>
        <span>{label}</span>
        <strong className={mono ? styles.iban : undefined}>{value}</strong>
      </div>
      {copy !== undefined && (
        <button
          type="button"
          className={styles.copyBtn}
          aria-label={ok ? `${label} copied` : `Copy ${label}`}
          onClick={() => {
            navigator.clipboard?.writeText(copy).catch(() => {});
            setOk(true);
            setTimeout(() => setOk(false), 1500);
          }}
        >
          {ok ? "✓" : <CopyIcon />}
        </button>
      )}
    </div>
  );
}

/** utm_source and utm_campaign from the URL, or from earlier in this visit (saved by the announcement bar). */
function readUtm() {
  try {
    const q = new URLSearchParams(location.search);
    return { utm_source: q.get("utm_source") ?? sessionStorage.getItem("pixely-utm-source") ?? "", utm_campaign: q.get("utm_campaign") ?? sessionStorage.getItem("pixely-campaign") ?? "" };
  } catch {
    return { utm_source: "", utm_campaign: "" };
  }
}

export default function OrderForm({ market, initial, initialAddons, offerParam = false, hasQr = false }: { market: MarketKey; initial?: PackageId; initialAddons?: Selection; offerParam?: boolean; hasQr?: boolean }) {
  const m = MARKETS[market];
  const router = useRouter();
  const packages = getPackages(m);
  const pk = market === "pk";
  const [step, setStep] = useState(1);
  const [packageId, setPackageId] = useState<PackageId>(initial ?? "international-pro");
  const [sameDay, setSameDay] = useState(false);
  const [addons, setAddons] = useState<Selection>(initialAddons ?? {});
  const [viewOpen, setViewOpen] = useState<PackageId[]>([]);
  const [v, setV] = useState({ name: "", code: m.phoneCode, whatsapp: "", email: "", contact: "whatsapp", country: COUNTRY[market], role: "", notes: "" });
  const [cv, setCv] = useState<File | null>(null);
  const [later, setLater] = useState(false);
  const [method, setMethod] = useState<"easypaisa" | "ubl">("easypaisa");
  const [txn, setTxn] = useState("");
  const [shot, setShot] = useState<File | null>(null);
  const [qrOk, setQrOk] = useState(hasQr);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const touchY = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [footerSeen, setFooterSeen] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  // Hide the bar only once the footer is well into view. Measured on scroll, so it also holds after a step change.
  useEffect(() => {
    const onScroll = () => {
      const f = document.querySelector("footer");
      setFooterSeen(!!f && f.getBoundingClientRect().top < window.innerHeight - 140);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [step]);
  useEffect(() => {
    document.documentElement.style.overflow = sheet ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [sheet]);

  const set = (k: keyof typeof v, value: string) => setV((s) => ({ ...s, [k]: value }));
  const { pkg, list, total } = calcOrder(m, packageId, sameDay, addons);
  // Personal Brand Bundle (pk): Executive + portfolio at the normal add-on price, shown as one line.
  const { offer, open: offerOpenNow } = useOffer(market);
  const offerClock = useCountdown();
  const offerLive = offerOpenNow && !offerClock.done;
  const bundle = offerLive && packageId === offer.packageId && (addons[offer.addonId] ?? 0) > 0;
  const bundleSave = offer.compareAt - offer.price;
  const shownList = bundle ? list.filter((a) => a.id !== offer.addonId) : list;
  const bundleLine = bundle ? pkg.price + (list.find((a) => a.id === offer.addonId)?.total ?? 0) : 0;
  const money = (n: number) => formatPricingPrice(m, n);
  const options = availableAddons(m, packageId);
  const payNow = pk && !later;
  const byEmail = v.contact === "email";
  const channel = byEmail ? "email" : "WhatsApp";

  const choosePackage = (id: PackageId) => {
    setPackageId(id);
    const ok = new Set(availableAddons(m, id).map((a) => a.id));
    setAddons((a) => Object.fromEntries(Object.entries(a).filter(([k]) => ok.has(k))));
  };

  useEffect(() => { window.scrollTo({ top: 0 }); }, [step]);

  const check = (s: number) => {
    const e: Errors = {};
    if (s === 2) {
      if (!v.name.trim()) e.name = "Enter your full name.";
      if (byEmail) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email.";
      } else {
        const digits = v.whatsapp.replace(/[\s-]/g, "").replace(/^0/, "");
        const ok = /^\d+$/.test(digits) && (v.code === "+92" ? digits.length === 10 : digits.length >= 7 && digits.length <= 15);
        if (!ok) e.whatsapp = v.code === "+92" ? "Enter 10 digits after +92." : "Enter 7 to 15 digits.";
      }
      if (!v.country) e.country = "Choose your target country.";
      if (!v.role.trim()) e.role = "Enter your target role.";
      if (cv && (cv.size > MAX || !/\.(pdf|docx?)$/i.test(cv.name))) e.cv = "Upload a PDF, DOC or DOCX under 10 MB.";
    }
    if (s === 3 && payNow) {
      if (!shot) e.shot = "Upload your payment screenshot.";
      else if (shot.size > MAX || !shot.type.startsWith("image/")) e.shot = "Upload an image under 10 MB.";
    }
    if (s === 4 && !terms) e.terms = "Please agree to continue.";
    return e;
  };

  // Errors clear as soon as the field becomes valid.
  useEffect(() => {
    setErrors((cur) => {
      const keys = Object.keys(cur).filter((k) => cur[k]);
      if (!keys.length) return cur;
      const fresh = check(step);
      const nextErr: Errors = {};
      keys.forEach((k) => { if (fresh[k]) nextErr[k] = fresh[k]; else if (k === "submit") nextErr[k] = cur[k]; });
      return Object.keys(nextErr).length === keys.length && keys.every((k) => nextErr[k] === cur[k]) ? cur : nextErr;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v, cv, shot, terms, later, byEmail]);

  const validate = (s: number) => {
    const e = check(s);
    setErrors(e);
    if (!Object.keys(e).length) return true;
    setSheet(false);
    requestAnimationFrame(() => {
      const el = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-error="true"]');
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - 140;
      const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number) => void } }).__lenis;
      if (lenis) lenis.scrollTo(y); else window.scrollTo({ top: y, behavior: "smooth" });
      (el.matches("input,select,textarea") ? el : el.querySelector<HTMLElement>("input"))?.focus({ preventScroll: true });
      el.classList.remove(styles.shake);
      void el.offsetWidth;
      el.classList.add(styles.shake);
      setTimeout(() => el.classList.remove(styles.shake), 320);
    });
    return false;
  };

  const go = (to: number) => { setErrors({}); setSheet(false); setStep(to); };
  const cont = () => { if (validate(step)) go(step + 1); };

  const submit = async () => {
    if (busy || !validate(4)) return;
    setBusy(true);
    setSheet(false);
    const d = new FormData();
    const f: Record<string, string> = {
      market, package: packageId, same_day: sameDay ? "yes" : "no", addons: JSON.stringify(addons), name: v.name, code: v.code, whatsapp: v.whatsapp, email: v.email,
      preferred_contact: v.contact, country: v.country, role: v.role, notes: v.notes, terms: "yes",
      payment_choice: payNow ? "now" : "later", payment_method: payNow ? method : "", transaction_id: txn,
      offer_id: bundle ? offer.id : "", ...readUtm(),
    };
    Object.entries(f).forEach(([k, val]) => d.append(k, val));
    if (cv) d.append("cv", cv);
    if (payNow && shot) d.append("screenshot", shot);
    try {
      const res = await fetch("/api/orders", { method: "POST", body: d });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      trackEvent("generate_lead", { package: packageId, market, ...(bundle ? { promotion_id: offer.id } : {}) });
      const q = new URLSearchParams({ id: data.id, c: byEmail ? "email" : "whatsapp", m: market, ...(payNow ? { paid: "1" } : {}) });
      router.push(`/order/success?${q}`);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Something went wrong." });
      setBusy(false);
    }
  };

  const last = step === 4;
  const label = last ? (payNow ? "Place order →" : "Send order request →") : "Continue →";
  const continueBtn = (cls: string) => (
    <button type="button" className={`btn btn-primary ${styles.continue} ${cls}`} onClick={last ? submit : cont} disabled={busy} aria-busy={busy || undefined} data-cta={last ? "order-send-request" : "order-continue"}>
      {busy ? <><span className={styles.spinner} aria-hidden="true" /> Sending</> : label}
    </button>
  );

  const summaryLines = (
    <>
      <dl className={styles.sumList}>
        {bundle ? (
          <div className={styles.sumBundle}><dt>{offer.title}</dt><dd><s>{money(offer.compareAt)}</s>{money(bundleLine)}</dd></div>
        ) : <div><dt>{pkg.name}</dt><dd>{money(pkg.price)}</dd></div>}
        {shownList.map((a) => (
          <div key={a.id} className={styles.sumLine}>
            <dt><span className={styles.sumName}>{a.name}</span>{a.qty > 1 && <span className={styles.sumQty}>× {a.qty}</span>}</dt>
            <dd>{money(a.total)}</dd>
          </div>
        ))}
        {sameDay && <div className={styles.sumLine}><dt>Same day delivery</dt><dd>{pkg.sameDayLabel}</dd></div>}
        <div className={styles.sumMuted}><dt>Delivery</dt><dd>{sameDay ? "Same day" : pkg.deliveryDays}</dd></div>
      </dl>
      <div className={styles.sumTotal}>
        <span>Total</span>
        <strong key={total} className={styles.totalNum}>{money(total)}</strong>
      </div>
      <p className={styles.guarantee}><Shield /> 100% money back guarantee</p>
    </>
  );
  const extrasCount = list.length + (sameDay ? 1 : 0);

  return (
    <div className={`${styles.page} ${step > 1 ? styles.inner : ""}`}>
      <div className={styles.head}>
        <h1 className={`display ${styles.title}`}>Let&apos;s get you <em>shortlisted.</em></h1>
        <p className={styles.sub}>Tell us about yourself. We&apos;ll contact you on your preferred channel.</p>
        <div className={styles.stepRow}>
          {step > 1 && <button type="button" className={styles.roundBack} onClick={() => go(step - 1)} aria-label="Back">←</button>}
          <ol className={styles.steps} aria-label="Order steps">
            {STEPS.map((s, i) => (
              <li key={s} className={i + 1 === step ? styles.active : i + 1 < step ? styles.complete : ""} aria-current={i + 1 === step ? "step" : undefined}>
                <span>{i + 1 < step ? "✓" : i + 1}</span> {s}
              </li>
            ))}
          </ol>
          <p className={styles.stepCount}>Step {step} of 4</p>
          <div className={styles.bar}><i style={{ width: `${step * 25}%` }} /></div>
        </div>
      </div>

      <div className={styles.layout}>
        <form ref={formRef} className={styles.form} noValidate onSubmit={(e) => e.preventDefault()}>
          {step === 1 && (
            <>
              {bundle && <p className={styles.offerBanner} suppressHydrationWarning><b>{offer.title} applied</b> · You save {money(bundleSave)} · ends in {inline(offerClock)}</p>}
              {offerParam && !offerLive && <p className={styles.offerEnded}>This offer has ended. You can continue at normal prices.</p>}
              <div className={styles.packs} role="radiogroup" aria-label="Package">
                {PACKAGE_ORDER.map((id) => packages.find((x) => x.id === id)!).map((p) => {
                  const sel = p.id === packageId;
                  const open = sel || viewOpen.includes(p.id);
                  const items = CHECKLIST(m.key, p.id);
                  return (
                    <div key={p.id} className={`${styles.card} ${styles.pcard} ${sel ? styles.cardOn : ""} ${p.id === "international-pro" ? styles.hasBadge : ""}`}>
                      {p.id === "international-pro" && <span className={styles.pbadge}>Recommended</span>}
                      <label className={styles.ptop}>
                        <input type="radio" name="package" checked={sel} onChange={() => choosePackage(p.id)} />
                        <b className={styles.pname}>{p.name}</b>
                        <strong className={styles.pprice}>{p.priceLabel}</strong>
                        <small className={styles.paud}>{AUDIENCE[p.id]}</small>
                        {p.id === "executive" && addons.portfolio ? <small className={styles.ptag}>Best value with a website</small> : null}
                      </label>
                      <div className={`${styles.collapse} ${open ? styles.collapseOpen : ""}`}>
                        <div className={styles.collapseIn}>
                          <ul className={styles.checks}>
                            {items.map((x) => <li key={x}>{localize(m, x)}</li>)}
                          </ul>
                        </div>
                      </div>
                      {!open && (
                        <p className={styles.pmore}>
                          Includes {items.length} items · <button type="button" onClick={() => setViewOpen((s) => [...s, p.id])}>View</button>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className={styles.group}>
                <label className={`${styles.card} ${styles.toggle}`}>
                  <input type="checkbox" role="switch" checked={sameDay} onChange={(e) => setSameDay(e.target.checked)} />
                  <span className={styles.switch} aria-hidden="true" />
                  <span className={styles.toggleText}>Same day delivery</span>
                  <span className={styles.toggleFee}>{pkg.sameDayLabel}</span>
                </label>
                <p className={styles.help}>Package documents only.</p>
              </div>

              <section className={styles.group} aria-labelledby="extras-title">
                <div className={styles.groupHead}>
                  <h2 id="extras-title">Add extras</h2>
                  <span>Optional</span>
                </div>
                <div className={styles.addons}>
                  {options.map((o) => {
                    const qty = addons[o.id] ?? 0;
                    const on = qty > 0;
                    const set1 = (n: number) => setAddons((s) => { const next = { ...s }; if (n < 1) { if (!(offerParam && offerLive && o.id === offer.addonId && packageId === offer.packageId)) delete next[o.id]; } else next[o.id] = Math.min(10, n); return next; });
                    let sub: string;
                    if (!o.qty) sub = `${o.benefit} · ${money(totalFor(m.key, o.id, 1, packageId))}`;
                    else if (!on) sub = `${o.benefit} · ${money(unitAt(m.key, o.id, 1, packageId))}`;
                    else sub = `${money(totalFor(m.key, o.id, qty, packageId))} for ${qty}${qty < 10 ? ` · next ${money(unitAt(m.key, o.id, qty + 1, packageId))}` : ""}`;
                    return (
                      <div key={o.id} className={`${styles.arow} ${on ? styles.arowOn : ""}`}>
                        <div className={styles.aleft}>
                          {o.badge && <span className={styles.apill}>{o.badge}</span>}
                          <b>{o.name}</b>
                          <small>{sub}</small>
                        </div>
                        <div className={styles.actrl}>
                          {!on ? (
                            <button type="button" className={styles.addBtn} onClick={() => set1(1)} aria-label={`Add ${o.name}`}>+ Add</button>
                          ) : o.qty ? (
                            <span className={styles.stepper}>
                              <button type="button" onClick={() => set1(qty - 1)} aria-label={`Fewer ${o.name}`}>–</button>
                              <output aria-live="polite">{qty}</output>
                              <button type="button" onClick={() => set1(qty + 1)} disabled={qty >= 10} aria-label={`More ${o.name}`}>+</button>
                            </span>
                          ) : (
                            <button type="button" className={`${styles.addBtn} ${styles.added}`} onClick={() => set1(0)} aria-label={`Remove ${o.name}`}>✓ Added</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {offerLive && packageId === offer.packageId && !bundle && (
                  <button type="button" className={styles.offerNudge} onClick={() => setAddons((a) => ({ ...a, [offer.addonId]: 1 }))}>
                    Add your website for {money(unitAt(market, offer.addonId, 1, packageId))} and get the 11.11 price →
                  </button>
                )}
              </section>
            </>
          )}

          {step === 2 && (
            <section aria-labelledby="details-title">
              <h2 id="details-title" className={styles.stepTitle}>Your details</h2>
              <div className={styles.field}>
                <span className={styles.label}>How should we contact you?</span>
                <div className={styles.contactCards} role="radiogroup" aria-label="How should we contact you?">
                  {([["whatsapp", "WhatsApp", <WaIcon key="w" />], ["email", "Email", <MailIcon key="m" />]] as const).map(([c, name, icon]) => (
                    <button key={c} type="button" role="radio" aria-checked={v.contact === c} className={`${styles.contactCard} ${v.contact === c ? styles.contactOn : ""}`} onClick={() => set("contact", c)}>
                      {icon}
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div key={v.contact} className={styles.swap}>
                {byEmail ? (
                  <Field id="email" label="Email *" error={errors.email}>
                    <input id="email" className={styles.input} type="email" value={v.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" aria-invalid={errors.email ? true : undefined} />
                  </Field>
                ) : (
                  <Field id="whatsapp" label="WhatsApp number *" error={errors.whatsapp}>
                    <div className={styles.phone}>
                      <select className={styles.input} aria-label="Country code" value={v.code} onChange={(e) => set("code", e.target.value)}>{CODES.map((c) => <option key={c}>{c}</option>)}</select>
                      <input id="whatsapp" className={styles.input} type="tel" inputMode="numeric" value={v.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} aria-invalid={errors.whatsapp ? true : undefined} />
                    </div>
                  </Field>
                )}
              </div>
              <Field id="name" label="Full name *" error={errors.name}>
                <input id="name" className={styles.input} value={v.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={errors.name ? true : undefined} />
              </Field>
              <Field id="country" label="Target country *" error={errors.country}>
                <select id="country" className={styles.input} value={v.country} onChange={(e) => set("country", e.target.value)} aria-invalid={errors.country ? true : undefined}>
                  {TARGET_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field id="role" label="Target role *" error={errors.role}>
                <input id="role" className={styles.input} placeholder="Project Manager" value={v.role} onChange={(e) => set("role", e.target.value)} aria-invalid={errors.role ? true : undefined} />
              </Field>
              <Dropzone id="cv" label={localize(m, "Current CV (optional)")} title={localize(m, "Upload your CV")} note="PDF, DOC or DOCX · max 10 MB" accept=".pdf,.doc,.docx" file={cv} onFile={setCv} error={errors.cv} />
              <Field id="notes" label="Notes (optional)">
                <textarea id="notes" className={`${styles.input} ${styles.textarea}`} maxLength={500} placeholder="Anything we should know?" value={v.notes} onChange={(e) => set("notes", e.target.value)} />
              </Field>
            </section>
          )}

          {step === 3 && (
            <section aria-labelledby="pay-title">
              <h2 id="pay-title" className={styles.stepTitle}>Payment</h2>
              {!pk ? (
                <div className={`${styles.card} ${styles.info}`}>
                  <Shield />
                  <p>No payment needed now. We&apos;ll send a secure payment link on your preferred channel.</p>
                </div>
              ) : later ? (
                <div className={`${styles.card} ${styles.info}`}>
                  <Shield />
                  <p>
                    We&apos;ll send you payment details after confirming your order. Work starts once payment is received.{" "}
                    <button type="button" className={styles.linkBtn} onClick={() => setLater(false)}>Pay now instead</button>
                  </p>
                </div>
              ) : (
                <div className={`${styles.card} ${styles.payCard}`}>
                  <div className={styles.due}>
                    <span>Amount due</span>
                    <strong>{money(total)}</strong>
                  </div>
                  <div className={styles.tabs} role="tablist" aria-label="Payment method">
                    <button type="button" role="tab" aria-selected={method === "easypaisa"} className={method === "easypaisa" ? styles.tabOn : ""} onClick={() => setMethod("easypaisa")}>Easypaisa / JazzCash</button>
                    <button type="button" role="tab" aria-selected={method === "ubl"} className={method === "ubl" ? styles.tabOn : ""} onClick={() => setMethod("ubl")}>UBL Bank</button>
                  </div>
                  {method === "easypaisa" && qrOk && (
                    <figure className={styles.qr}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={PAYMENTS.easypaisa.qr} alt="Easypaisa QR code" width={150} height={150} onError={() => setQrOk(false)} />
                    </figure>
                  )}
                  <div className={styles.payRows}>
                    <PayRow label="Account title" value="Muhammad Hamza" />
                    {method === "easypaisa" ? (
                      <PayRow label="Account number" value={PAYMENTS.easypaisa.number} copy={PAYMENTS.easypaisa.copy} />
                    ) : (
                      <>
                        <PayRow label="Account number" value={PAYMENTS.ubl.number} copy={PAYMENTS.ubl.number} />
                        <PayRow label="IBAN" value={PAYMENTS.ubl.iban.replace(/(.{4})(?=.)/g, "$1 ")} copy={PAYMENTS.ubl.iban} mono />
                      </>
                    )}
                  </div>
                  <div className={styles.payUpload}>
                    <Dropzone id="shot" label="Payment screenshot *" title="Upload screenshot" note="PNG or JPG · max 10 MB" accept="image/*" file={shot} onFile={setShot} error={errors.shot} small />
                    <Field id="txn" label="Transaction ID (optional)">
                      <input id="txn" className={styles.input} value={txn} onChange={(e) => setTxn(e.target.value)} />
                    </Field>
                  </div>
                  <div className={styles.payFoot}>
                    <p><Shield /> Your payment is safe. Confirmed on WhatsApp within a few hours.</p>
                    <p>Prefer to pay later? <button type="button" className={styles.linkBtn} onClick={() => setLater(true)}>Send details later</button></p>
                  </div>
                </div>
              )}
            </section>
          )}

          {step === 4 && (
            <section aria-labelledby="review-title">
              <h2 id="review-title" className={styles.stepTitle}>Review your order</h2>
              <div className={styles.review}>
                <div className={styles.card}>
                  <div className={styles.rHead}><h3>Package</h3><button type="button" onClick={() => go(1)}>Edit</button></div>
                  <dl className={styles.rList}>
                    {bundle ? <div className={styles.sumBundle}><dt>{offer.title}</dt><dd><s>{money(offer.compareAt)}</s>{money(bundleLine)}</dd></div> : <div><dt>{pkg.name}</dt><dd>{money(pkg.price)}</dd></div>}
                    {shownList.map((a) => <div key={a.id}><dt>{a.name}{a.qty > 1 && <span className={styles.sumQty}> × {a.qty}</span>}</dt><dd>{money(a.total)}</dd></div>)}
                    {sameDay && <div><dt>Same day delivery</dt><dd>{pkg.sameDayLabel}</dd></div>}
                  </dl>
                </div>
                <div className={styles.card}>
                  <div className={styles.rHead}><h3>Your details</h3><button type="button" onClick={() => go(2)}>Edit</button></div>
                  <ul className={styles.rText}>
                    <li>{byEmail ? `Email · ${v.email}` : `WhatsApp · ${v.code} ${v.whatsapp}`}</li>
                    <li>{v.name}</li>
                    <li>{v.country} · {v.role}</li>
                    {cv && <li>{cv.name}</li>}
                  </ul>
                </div>
                <div className={styles.card}>
                  <div className={styles.rHead}><h3>Payment</h3><button type="button" onClick={() => go(3)}>Edit</button></div>
                  <ul className={styles.rText}>
                    {!pk ? <li>Payment link on {channel}</li> : later ? <li>Pay after confirmation</li> : (
                      <>
                        <li>{method === "ubl" ? "UBL Bank" : "Easypaisa / JazzCash"}</li>
                        {shot && <li className={styles.ok}>Screenshot uploaded ✓</li>}
                        {txn && <li>Transaction ID · {txn}</li>}
                      </>
                    )}
                  </ul>
                </div>
              </div>
              <div className={styles.totalBox}>
                <div><span>Total</span><strong key={total} className={styles.totalNum}>{money(total)}</strong></div>
                <p><Shield /> 100% money back guarantee</p>
              </div>
              <label className={styles.terms}>
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} aria-invalid={errors.terms ? true : undefined} />
                <span>I agree to the <Link href="/terms" target="_blank">Terms</Link>, <Link href="/privacy" target="_blank">Privacy Policy</Link> and <Link href="/refund-policy" target="_blank">Refund Policy</Link></span>
              </label>
              {errors.terms && <p className={styles.error}>{errors.terms}</p>}
              {errors.submit && <p className={styles.error} role="alert">{errors.submit}</p>}
              {continueBtn(styles.finalBtn)}
            </section>
          )}
        </form>

        <aside className={`${styles.card} ${styles.summary}`} aria-label="Order summary">
          <h2>Order summary</h2>
          {summaryLines}
          {continueBtn(styles.summaryContinue)}
        </aside>
      </div>

      {mounted && createPortal(
        <>
          <div className={`${styles.scrim} ${sheet ? styles.scrimOn : ""}`} onClick={() => setSheet(false)} aria-hidden="true" />
          <div
            className={`${styles.sheet} ${sheet ? styles.sheetOn : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Order summary"
            inert={!sheet}
            onTouchStart={(e) => { touchY.current = e.touches[0].clientY; }}
            onTouchEnd={(e) => { if (touchY.current !== null && e.changedTouches[0].clientY - touchY.current > 60) setSheet(false); touchY.current = null; }}
          >
            <span className={styles.handle} aria-hidden="true" />
            <h2>Order summary</h2>
            {summaryLines}
            {continueBtn(styles.sheetContinue)}
          </div>
          <div className={`${styles.mbar} ${footerSeen && !sheet ? styles.mbarHidden : ""}`} role="region" aria-label="Order total">
            <button type="button" className={styles.mtotal} onClick={() => setSheet((s) => !s)} aria-expanded={sheet}>
              <strong key={total}>{money(total)}</strong>
              <span>{pkg.name}{extrasCount ? ` + ${extrasCount} extra${extrasCount > 1 ? "s" : ""}` : ""} ⌃</span>
            </button>
            {continueBtn(styles.mcontinue)}
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}
