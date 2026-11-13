"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { availableAddons, calcOrder, totalFor, unitAt, type Selection } from "@/config/addons";
import { MARKETS, formatPricingPrice, getPackages, localize, type MarketKey, type PackageId } from "@/config/markets";
import { PAYMENTS } from "@/config/payments";
import { BUNDLE_ALL_LINE, BUNDLE_ITEMS, onlineOpen, onlinePrice, payPlan, type PayAmountType } from "@/config/offers";
import { cartId, setCartId, trackFunnel, type Commerce } from "@/lib/analytics";
import { useCountdown, useOffer } from "@/components/offer/useOffer";
import { inline } from "@/components/offer/Offer";
import { whatsappMessage } from "@/lib/site";
import CountryPicker from "./CountryPicker";
import { CODES } from "./Fields";
import Turnstile, { type TsStatus } from "./Turnstile";
import styles from "./OrderForm.module.css";

const STEPS = ["Package", "Details", "Payment"];
const COUNTRY: Record<MarketKey, string> = { us: "USA", uk: "UK", ae: "UAE", sa: "Saudi Arabia", pk: "Pakistan" };
/** Short checklist per package: each item fits one line. */
const CHECKLIST = (key: string, id: PackageId) => {
  const gulf = key === "ae" || key === "sa" || key === "pk";
  if (id === "ats-career") return ["ATS / Europass CV", "Cover letter", "LinkedIn content", "Job keywords", "PDF and Word files"];
  if (id === "international-pro") return ["Everything in ATS", "International CV", "LinkedIn makeover", gulf ? "Indeed + Naukrigulf" : "Indeed", "Bio statement", "Contact card"];
  return ["Everything in Pro", "Executive CV", "Visual profile", "10 LinkedIn posts", "Interview guide"];
};
const PACKAGE_ORDER: PackageId[] = ["executive", "international-pro", "ats-career"];
const AUDIENCE: Record<PackageId, string> = {
  "ats-career": "Beginners & early careers",
  "international-pro": "3+ years or applying abroad",
  executive: "Senior & leadership roles",
};
const CV_MAX = 5 * 1024 * 1024;
const SHOT_MAX = 4 * 1024 * 1024;
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

type UpState = "idle" | "uploading" | "done" | "error";
function Dropzone({ id, label, title, note, accept, file, onFile, error, small, state }: { id: string; label: string; title: string; note: string; accept: string; file: File | null; onFile: (f: File | null) => void; error?: string; small?: boolean; state?: UpState }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {file ? (
        <div className={`${styles.fileChip} ${small ? styles.dropSmall : ""}`}>
          <FileIcon />
          <span className={styles.fileName}>{file.name}</span>
          <span className={`${styles.fileSize} ${state === "done" ? styles.upOk : state === "error" ? styles.upErr : ""}`} aria-live="polite">{state === "uploading" ? <><span className={styles.spinnerDark} aria-hidden="true" /> Uploading</> : state === "done" ? "Uploaded ✓" : state === "error" ? "Failed" : size(file.size)}</span>
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

export type Restore = { id: string; name: string; email: string; whatsapp: string; contact: string; country: string; countries?: string[]; role: string; sameDay: boolean };

/** utm_source, utm_campaign and the Meta click ids from the URL, the cookies, or earlier in this visit (saved by the announcement bar). */
function readUtm() {
  try {
    const q = new URLSearchParams(location.search);
    const cookie = (n: string) => document.cookie.match(new RegExp(`(?:^|; )${n}=([^;]+)`))?.[1] ?? "";
    const fbclid = q.get("fbclid") ?? sessionStorage.getItem("pixely-fbclid") ?? "";
    return {
      utm_source: q.get("utm_source") ?? sessionStorage.getItem("pixely-utm-source") ?? "", utm_campaign: q.get("utm_campaign") ?? sessionStorage.getItem("pixely-campaign") ?? "",
      fbclid, fbp: cookie("_fbp"), fbc: cookie("_fbc") || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : ""),
    };
  } catch {
    return { utm_source: "", utm_campaign: "", fbclid: "", fbp: "", fbc: "" };
  }
}

export default function OrderForm({ market, initial, initialAddons, offerParam = false, hasQr = false, restore }: { market: MarketKey; initial?: PackageId; initialAddons?: Selection; offerParam?: boolean; hasQr?: boolean; restore?: Restore }) {
  const m = MARKETS[market];
  const router = useRouter();
  const packages = getPackages(m);
  const pk = market === "pk";
  const [step, setStep] = useState(1);
  const [packageId, setPackageId] = useState<PackageId>(initial ?? "international-pro");
  const [sameDay, setSameDay] = useState(restore?.sameDay ?? false);
  // Add-ons the visitor picked themselves. The bundled website lives in bundleOn, never in here.
  const [addons, setAddons] = useState<Selection>(initialAddons ?? {});
  const [bundleOn, setBundleOn] = useState(offerParam);
  const [countries, setCountries] = useState<string[]>(() => restore?.countries?.length ? restore.countries : [restore?.country || COUNTRY[market]]);
  const [v, setV] = useState(() => {
    // A restored cart stores the number with its country code; the form keeps them apart.
    const code = restore?.whatsapp ? CODES.filter((x) => restore.whatsapp.startsWith(x)).sort((a, b) => b.length - a.length)[0] ?? m.phoneCode : m.phoneCode;
    return { name: restore?.name ?? "", code, whatsapp: restore?.whatsapp ? restore.whatsapp.slice(restore.whatsapp.startsWith(code) ? code.length : 0) : "", email: restore?.email ?? "", contact: restore?.contact === "email" ? "email" : "whatsapp", country: restore?.country || COUNTRY[market], role: restore?.role ?? "", notes: "" };
  });
  const [cv, setCv] = useState<File | null>(null);
  const [later, setLater] = useState(false);
  const [payType, setPayType] = useState<PayAmountType>("full");
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [incOpen, setIncOpen] = useState<string | null>(null);
  const [method, setMethod] = useState<"easypaisa" | "ubl">("easypaisa");
  const [txn, setTxn] = useState("");
  const [shot, setShot] = useState<File | null>(null);
  // The screenshot uploads as soon as it is picked; submit only sends its URL.
  const [shotUp, setShotUp] = useState<{ secure_url: string; public_id: string } | null>(null);
  const [shotState, setShotState] = useState<UpState>("idle");
  const shotSeq = useRef(0);
  const [noteOpen, setNoteOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [qrOk, setQrOk] = useState(hasQr);
  const [terms, setTerms] = useState(false);
  const [tsToken, setTsToken] = useState("");
  const [tsStatus, setTsStatus] = useState<TsStatus>("checking");
  const [tsRetry, setTsRetry] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const touchY = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [footerSeen, setFooterSeen] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [termsHint, setTermsHint] = useState(false);
  const [termsShake, setTermsShake] = useState(0);
  useEffect(() => { const q = window.matchMedia("(max-width: 767px)"); const f = () => setNarrow(q.matches); f(); q.addEventListener("change", f); return () => q.removeEventListener("change", f); }, []);
  useEffect(() => {
    if (!incOpen) return;
    const close = () => setIncOpen(null);
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("click", close);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("click", close); document.removeEventListener("keydown", key); };
  }, [incOpen]);

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
  // Personal Brand Bundle (pk): Executive + portfolio at the normal add-on price, shown as one line.
  const { offer, open: offerOpenNow, remaining: slotsLeft } = useOffer(market);
  const offerClock = useCountdown();
  const offerLive = offerOpenNow && !offerClock.done;
  // An offer link wins over every default: applied once, on load (URL beats anything restored).
  useEffect(() => {
    if (!offerParam) return;
    setPackageId(offer.packageId);
    setBundleOn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerParam]);
  const bundle = offerLive && bundleOn && packageId === offer.packageId;
  // What is priced and sent: the visitor's add-ons, plus the website while the bundle is ticked.
  const eff: Selection = bundle ? { ...addons, [offer.addonId]: 1 } : addons;
  const { pkg, list, total } = calcOrder(m, packageId, sameDay, eff);
  const bundleSave = offer.compareAt - offer.price;
  const shownList = bundle ? list.filter((a) => a.id !== offer.addonId) : list;
  const bundleLine = bundle ? pkg.price + (list.find((a) => a.id === offer.addonId)?.total ?? 0) : 0;
  const money = (n: number) => formatPricingPrice(m, n);
  const options = availableAddons(m, packageId).filter((o) => !(bundle && o.id === offer.addonId));
  const toggleBundle = (on: boolean) => {
    setBundleOn(on);
    if (on) trackFunnel("cart", { name: "11.11 Bundle", ids: [offer.packageId, offer.addonId], value: offer.price, currency: m.currency, items: 1 });
  };
  const put = async (kind: "cv" | "payment", file: File, signal?: AbortSignal) => {
    const d = new FormData();
    d.append("kind", kind);
    d.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: d, signal });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "The upload failed. Please try again.");
    return data as { secure_url: string; public_id: string };
  };
  const onShot = (f: File | null) => {
    const n = ++shotSeq.current;
    setShot(f);
    setShotUp(null);
    if (!f || f.size > SHOT_MAX || !/\.(jpe?g|png|webp|pdf)$/i.test(f.name)) { setShotState("idle"); return; }
    setShotState("uploading");
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 30000);
    put("payment", f, ctl.signal)
      .then((u) => { if (n === shotSeq.current) { setShotUp(u); setShotState("done"); } })
      .catch(() => { if (n === shotSeq.current) setShotState("error"); })
      .finally(() => clearTimeout(t));
  };
  const payNow = pk && !later;
  // Pay now (pk): 50% advance or in full, with the discount from config/offers. Shown from the payment step on.
  const planOf = (t: PayAmountType) => payPlan(total, t, { bundle });
  const online = pk && onlineOpen();
  const plan = payNow ? planOf(payType) : null;
  const due = plan ? plan.total : total;
  const payCategory = !pk ? undefined : later ? "talk_first" : payType === "full" ? "pay_full" : "pay_advance";
  const item: Commerce = { name: bundle ? offer.title : pkg.name, ids: [bundle ? "executive_bundle" : packageId, ...list.filter((a) => !(bundle && a.id === offer.addonId)).map((a) => a.id)], value: due, currency: m.currency, items: 1 + list.length };
  const byEmail = !pk && v.contact === "email";
  const channel = byEmail ? "email" : "WhatsApp";

  // Same day delivery: only for ATS Career and International Career Pro. Cleared for Executive and the Bundle.
  const sameDayOk = !bundle && packageId !== "executive";
  useEffect(() => { if (!sameDayOk) setSameDay(false); }, [sameDayOk]);

  const choosePackage = (id: PackageId) => {
    setPackageId(id);
    if (id !== offer.packageId) setBundleOn(false);
    const ok = new Set(availableAddons(m, id).map((a) => a.id));
    setAddons((a) => Object.fromEntries(Object.entries(a).filter(([k]) => ok.has(k))));
  };

  useEffect(() => { window.scrollTo({ top: 0 }); }, [step]);

  const check = (s: number) => {
    const e: Errors = {};
    if (s === 2) {
      if (!v.name.trim()) e.name = "Enter your full name.";
      if (pk && v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email or leave it empty.";
      if (byEmail) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email.";
      } else {
        const digits = v.whatsapp.replace(/[\s-]/g, "").replace(/^0/, "");
        const ok = /^\d+$/.test(digits) && (v.code === "+92" ? digits.length === 10 : digits.length >= 7 && digits.length <= 15);
        if (!ok) e.whatsapp = v.code === "+92" ? "Enter 10 digits after +92." : "Enter 7 to 15 digits.";
      }
      if (!countries.length) e.country = "Choose at least one target country.";
      if (!v.role.trim()) e.role = "Enter your target role.";
      if (!pk && cv && (cv.size > CV_MAX || !/\.(pdf|docx?)$/i.test(cv.name))) e.cv = "Upload a PDF, DOC or DOCX under 5 MB.";
    }
    if (s === 3 && payNow) {
      if (!shot) e.shot = "Upload your payment screenshot.";
      else if (shot.size > SHOT_MAX || !/\.(jpe?g|png|webp|pdf)$/i.test(shot.name)) e.shot = "Upload a JPG, PNG, WEBP or PDF under 4 MB.";
      else if (shotState === "uploading") e.shot = "Wait a moment, your screenshot is still uploading.";
      else if (shotState === "error") e.shot = "The upload failed. Remove the file and try again.";
    }
    if (s === 3 && !terms) e.terms = "Please agree to continue.";
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
  }, [v, cv, shot, shotState, terms, later, byEmail]);

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

  // Funnel events. AddToCart: a package arrives from a link, or the visitor changes the package, an extra or same day delivery.
  const firstCart = useRef(true);
  useEffect(() => {
    if (firstCart.current) { firstCart.current = false; if (!initial) return; }
    trackFunnel("cart", item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId, JSON.stringify(addons), sameDay]);
  useEffect(() => { if (step === 2) trackFunnel("checkout", item); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [step]);
  useEffect(() => { if (payNow && shot) trackFunnel("payment", { ...item, value: planOf(payType).total, category: payType }); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [shot, payNow]);

  // Draft: the open order is saved on every package, bundle, add-on, step or contact change (debounced). The server prices it.
  useEffect(() => { if (restore?.id) setCartId(restore.id.replace(/-/g, "").slice(0, 20)); }, [restore?.id]);
  const orderPayload = () => {
    const u = readUtm();
    return {
      market, package: bundle ? "executive_bundle" : packageId, addons, sameDay, bundle, payChoice: pk ? (payNow ? "now" : "later") : null, payAmountType: pk && payNow ? payType : null, step,
      name: v.name || null, code: v.code, whatsapp: v.whatsapp || null, email: v.email.trim() || null,
      targetCountry: countries[0] || null, targetCountries: countries, targetRole: v.role || null, notes: v.notes || null,
      fbp: u.fbp || null, fbc: u.fbc || null, eventId: cartId() || undefined, resume: restore?.id ?? null,
    };
  };
  useEffect(() => {
    const t = setTimeout(() => {
      fetch("/api/orders/draft", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify(orderPayload()) }).catch(() => {});
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, v.whatsapp, v.code, v.email, v.name, v.country, JSON.stringify(countries), v.role, packageId, JSON.stringify(addons), sameDay, bundle, later, payType]);
  const cont = () => { if (validate(step)) go(step + 1); };

  const submit = async () => {
    if (busy || !validate(3)) return;
    setBusy(true);
    setFailed(false);
    setSheet(false);
    // Never spin forever: the CV upload and the order together get 20 seconds.
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 20000);
    try {
      const cvUp = !pk && cv ? await put("cv", cv, ctl.signal) : null;
      const res = await fetch("/api/orders/submit", { method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal, body: JSON.stringify({
        ...orderPayload(), step: 4, terms: true, turnstile: tsToken,
        cvUrl: cvUp?.secure_url ?? null, cvPublicId: cvUp?.public_id ?? null,
        paymentMethod: payNow ? method : null, screenshotUrl: payNow ? shotUp?.secure_url ?? null : null, screenshotPublicId: payNow ? shotUp?.public_id ?? null : null, transactionId: payNow ? txn || null : null,
      }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ref) throw new Error(data.error || "failed");
      clearTimeout(timer);
      trackFunnel("lead", { ...item, value: data.total ?? due, category: payCategory });
      try { sessionStorage.removeItem("pixely-cart-id"); } catch {}
      const q = new URLSearchParams({ id: data.ref, c: byEmail ? "email" : "whatsapp", m: market, ...(payNow ? { paid: "1", t: String(data.total ?? due), p: String(plan?.today ?? due), d: String(plan?.discount ?? 0) } : { talk: "1" }) });
      router.push(`/order/success?${q}`);
    } catch (err) {
      clearTimeout(timer);
      const msg = err instanceof Error && err.message !== "failed" && err.name !== "AbortError" && !/fetch|network/i.test(err.message) ? err.message : "";
      setErrors({ submit: msg || "Couldn\u2019t send. Try again or message us on WhatsApp." });
      setFailed(true);
      setBusy(false);
    }
  };
  const waOrder = whatsappMessage([
    "Hi Pixely Careers, I want to place an order.",
    `Package: ${bundle ? offer.headline : pkg.name}`,
    ...shownList.map((a) => `Extra: ${a.name}${a.qty > 1 ? ` x ${a.qty}` : ""}`),
    ...(sameDay ? ["Same day delivery"] : []),
    `Total: ${money(due)}`,
    v.name && `Name: ${v.name}`,
    v.role && `Role: ${v.role}, ${countries.join(", ")}`,
    pk ? (payNow ? `${payType === "full" ? "Paid in full" : "Paid 50%"} by ${method === "ubl" ? "UBL Bank" : "Easypaisa / JazzCash"}${txn ? `, ID ${txn}` : ""}` : "Pay later") : "",
  ].filter(Boolean).join("\n"));

  const last = step === 3;
  const label = last ? (pk && later ? "Send request" : "Place order") : "Continue";
  const continueBtn = (cls: string) => (
    <button type="button" className={`btn btn-primary ${styles.continue} ${cls}`} onClick={last ? submit : cont} disabled={busy || (last && tsStatus !== "ok")} aria-busy={busy || undefined} data-cta={last ? "order-send-request" : "order-continue"}>
      {busy ? <><span className={styles.spinner} aria-hidden="true" /> Sending</> : last && tsStatus === "checking" ? <><span className={styles.spinner} aria-hidden="true" /> Verifying</> : label}
    </button>
  );

  const summaryLines = (
    <>
      <dl className={styles.sumList}>
        <div className={styles.sumLine}><dt>{bundle ? "11.11 Bundle" : pkg.name}</dt><dd>{money(bundle ? bundleLine : pkg.price)}</dd></div>
        {shownList.map((a) => (
          <div key={a.id} className={styles.sumLine}><dt>{a.name}{a.qty > 1 ? ` × ${a.qty}` : ""} (add-on)</dt><dd>{money(a.total)}</dd></div>
        ))}
        {sameDay && <div className={styles.sumLine}><dt>Same day delivery</dt><dd>{pkg.sameDayLabel}</dd></div>}
        {plan && plan.discount > 0 && <div className={styles.sumLine}><dt>{bundle ? "Online discount" : `Online discount (${plan.type === "full" ? "20%" : "10%"})`}</dt><dd>−{money(plan.discount)}</dd></div>}
      </dl>
      <div className={styles.sumTotal}>
        <span>Total payable</span>
        <strong key={due} className={styles.totalNum}>{money(due)}</strong>
      </div>
      {plan && plan.type === "advance" && <dl className={styles.sumList}><div className={styles.sumLine}><dt>Pay today (50%)</dt><dd>{money(plan.today)}</dd></div></dl>}
    </>
  );
  const extrasCount = list.length + (sameDay ? 1 : 0);
  const finish = (
    <>
      {!narrow && <><label className={styles.terms}>
        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} aria-invalid={errors.terms ? true : undefined} />
        <span>I agree to the <Link href="/terms" target="_blank">Terms</Link> &amp; <Link href="/refund-policy" target="_blank">Refund Policy</Link></span>
      </label>
      {(errors.terms || (termsHint && !terms)) && <p className={styles.error}>{errors.terms || "Tick the box to place your order."}</p>}</>}
      <p className={`${styles.tsStatus} ${styles["ts_" + tsStatus]}`} role="status" aria-live="polite" hidden={tsStatus !== "failed"}>
        {tsStatus === "failed" && <>Security check failed. <button type="button" onClick={() => setTsRetry((n) => n + 1)}>Try again</button></>}
      </p>
      {errors.submit && <p className={styles.error} role="alert">{errors.submit}</p>}
      {failed && <a href={waOrder} target="_blank" rel="noopener noreferrer" className={styles.waFallback} data-cta="order-fail-whatsapp"><WaIcon /> Message us on WhatsApp</a>}
    </>
  );

  const pkCards = [
                  ...(pk && offerLive ? [{
                    id: "executive_bundle", name: "11.11 Bundle · Executive Branding + Website", line: "", price: payPlan(offer.price, "full", { bundle: true }).total, was: offer.compareAt as number | undefined,
                    meta: `5 days · ${slotsLeft ?? offer.totalSlots} slot${(slotsLeft ?? offer.totalSlots) === 1 ? "" : "s"} left`, badge: "11.11 Sale", tone: styles.pkSale,
                    items: [...BUNDLE_ITEMS] as string[], note: BUNDLE_ALL_LINE as string | undefined, sel: bundle,
                    pick: () => { choosePackage(offer.packageId); toggleBundle(true); },
                  }] : []),
                  ...PACKAGE_ORDER.map((id) => packages.find((x) => x.id === id)!).map((p) => ({
                    id: p.id as string, name: p.name, line: "", price: online ? onlinePrice(p.price) : p.price, was: (online ? p.price : undefined) as number | undefined, meta: p.deliveryDays,
                    badge: p.id === "executive" ? "Best Results" : p.id === "international-pro" ? "Most Popular" : "", tone: p.id === "executive" ? styles.pkBest : p.id === "international-pro" ? styles.pkPop : "",
                    items: CHECKLIST(m.key, p.id), note: undefined as string | undefined, sel: p.id === packageId && !bundle,
                    pick: () => { choosePackage(p.id); setBundleOn(false); },
                  })),
  ];
  const incCard = pkCards.find((c) => c.id === incOpen) ?? null;
  const extras = (
              <section className={`${styles.card} ${styles.extras}`} aria-label="Extras">
                <button type="button" className={styles.extrasHead} onClick={() => setExtrasOpen((o) => !o)} aria-expanded={extrasOpen}>
                  <span className={styles.extrasTitle}><b>+ Add extras</b></span>
                  <Chevron open={extrasOpen} />
                </button>
                {extrasOpen && (
                  <div className={styles.extrasBody}>
                    {sameDayOk && (
                      <label className={`${styles.card} ${styles.toggle}`}>
                        <input type="checkbox" role="switch" checked={sameDay} onChange={(e) => setSameDay(e.target.checked)} />
                        <span className={styles.switch} aria-hidden="true" />
                        <span className={styles.toggleText}>Same day delivery</span>
                        <span className={styles.toggleFee}>{pkg.sameDayLabel}</span>
                      </label>
                    )}
                    <div className={styles.addons}>
                      {options.map((o) => {
                        const qty = addons[o.id] ?? 0;
                        const on = qty > 0;
                        const set1 = (n: number) => setAddons((s) => { const next = { ...s }; if (n < 1) delete next[o.id]; else next[o.id] = Math.min(10, n); return next; });
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
                                <button type="button" className={`${styles.addBtn} ${styles.ghost}`} onClick={() => set1(1)} aria-label={`Add ${o.name}`}>+ Add</button>
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
                  </div>
                )}
              </section>
  );
  return (
    <div className={`${styles.page} ${step > 1 ? styles.inner : ""}`}>
      <div className={styles.head}>
        <h1 className={`display ${styles.title}`}>Let&apos;s get you <em>shortlisted.</em></h1>
        <ol className={styles.steps} aria-label="Order steps">
          {STEPS.map((s, i) => (
            <li key={s} className={i + 1 === step ? styles.active : i + 1 < step ? styles.complete : ""} aria-current={i + 1 === step ? "step" : undefined}>
              <span>{i + 1 < step ? "✓" : i + 1}</span> {s}
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.layout}>
        <form ref={formRef} className={styles.form} noValidate onSubmit={(e) => e.preventDefault()}>
          {step > 1 && <button type="button" className={styles.backLink} onClick={() => go(step - 1)}>← Back</button>}
          {step === 1 && (
            <>
              <h2 className={styles.stepTitle}>Choose your package</h2>
              {offerParam && !offerLive && <p className={styles.offerEnded}>This offer has ended. You can continue at normal prices.</p>}
              <div className={styles.pgrid} role="radiogroup" aria-label="Package">
                {pkCards.map((c) => (
                  <Fragment key={c.id}>
                  <div id={`pk-${c.id}`} className={`${styles.card} ${styles.pk} ${c.tone} ${c.sel ? styles.pkOn : ""}`}>
                    {c.badge && <span className={styles.pkBadge}>{c.badge}</span>}
                    <label className={styles.pkMain}>
                      <input type="radio" name="package" checked={c.sel} onChange={c.pick} data-cta={`order-package-${c.id}`} />
                      {c.sel && <span className={styles.pkCheck}><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 8.5 3.2 3L13 4.5" /></svg></span>}
                      <b className={styles.pkName}>{c.name}</b>
                      <span className={styles.pkPrice}>{c.was ? <s>{money(c.was)}</s> : null}<strong>{money(c.price)}</strong></span>
                    </label>
                    <div className={styles.pkFoot}>
                      <span suppressHydrationWarning>{c.meta}</span>
                      <span aria-hidden="true">·</span>
                      <button type="button" data-inc onClick={(e) => { e.stopPropagation(); setIncOpen((o) => (o === c.id ? null : c.id)); }} aria-expanded={incOpen === c.id} aria-haspopup="dialog">What&apos;s included <Chevron open={incOpen === c.id} /></button>
                    </div>
                    {incOpen === c.id && !narrow && <div className={styles.incPop} role="dialog" aria-label={`${c.name}: what's included`} onClick={(e) => e.stopPropagation()}><ul className={styles.pkList}>{c.items.map((x) => <li key={x}>{localize(m, x)}</li>)}</ul>{c.note && <p className={styles.incNote}>{c.note}</p>}</div>}
                  </div>
                  {narrow && c.sel && extras}
                  </Fragment>
                ))}
              </div>

              {!narrow && extras}
            </>
          )}

          {step === 2 && (
            <section aria-labelledby="details-title">
              <h2 id="details-title" className={styles.stepTitle}>Your details</h2>
              {!pk && (<div className={styles.field}>
                <span className={styles.label}>How should we contact you?</span>
                <div className={styles.contactCards} role="radiogroup" aria-label="How should we contact you?">
                  {([["whatsapp", "WhatsApp", <WaIcon key="w" />], ["email", "Email", <MailIcon key="m" />]] as const).map(([c, name, icon]) => (
                    <button key={c} type="button" role="radio" aria-checked={v.contact === c} className={`${styles.contactCard} ${v.contact === c ? styles.contactOn : ""}`} onClick={() => set("contact", c)}>
                      {icon}
                      {name}
                    </button>
                  ))}
                </div>
              </div>)}
              <div className={styles.grid2}>
                <Field id="name" label="Full name *" error={errors.name}>
                  <input id="name" className={styles.input} value={v.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={errors.name ? true : undefined} />
                </Field>
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
                <Field id="country" label="Target countries *" error={errors.country}>
                  <CountryPicker id="country" value={countries} onChange={(l) => { setCountries(l); set("country", l[0] ?? ""); }} invalid={!!errors.country} />
                </Field>
                <Field id="role" label="Target role *" error={errors.role}>
                  <input id="role" className={styles.input} placeholder="Project Manager" value={v.role} onChange={(e) => set("role", e.target.value)} aria-invalid={errors.role ? true : undefined} />
                </Field>
              </div>
              {pk && (
                <Field id="email" label="Email (optional)" error={errors.email}>
                  <input id="email" className={styles.input} type="email" value={v.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" aria-invalid={errors.email ? true : undefined} />
                </Field>
              )}
              {!pk && <Dropzone id="cv" label={localize(m, "Current CV (optional)")} title={localize(m, "Upload your CV")} note="PDF, DOC or DOCX · max 5 MB" accept=".pdf,.doc,.docx" file={cv} onFile={setCv} error={errors.cv} small />}
              {noteOpen || v.notes ? (
                <Field id="notes" label="Note">
                  <textarea id="notes" className={`${styles.input} ${styles.textarea}`} maxLength={500} placeholder="Anything we should know?" value={v.notes} onChange={(e) => set("notes", e.target.value)} autoFocus={noteOpen && !v.notes} />
                </Field>
              ) : (
                <button type="button" className={styles.linkBtn} onClick={() => setNoteOpen(true)}>+ Add a note</button>
              )}
            </section>
          )}

          {step === 3 && (
            <section aria-labelledby="pay-title">
              <h2 id="pay-title" className={styles.stepTitle}>Payment</h2>
              {!pk ? (
                <div className={`${styles.card} ${styles.info}`}>
                  <Shield />
                  <p>No payment needed now. We&apos;ll send a secure payment link on WhatsApp.</p>
                </div>
              ) : (
                <>
                <div className={styles.payStack} role="radiogroup" aria-label="How would you like to pay?">
                  {([["full", "Pay in full", money(planOf("full").today), planOf("full").discount], ["advance", "Pay 50% now", `${money(planOf("advance").today)} today`, planOf("advance").discount], ["talk", "Talk to us first (WhatsApp)", money(total), 0]] as const).map(([k, name, price, off]) => {
                    const on = k === "talk" ? later : !later && payType === k;
                    return (
                      <button key={k} type="button" role="radio" aria-checked={on} className={`${styles.card} ${styles.payBox} ${styles.payBoxHead} ${on ? styles.payBoxOn : ""}`} onClick={() => { if (k === "talk") setLater(true); else { setLater(false); setPayType(k); } }} data-cta={`order-pay-${k}`}>
                        <span className={styles.radioDot} aria-hidden="true" />
                        <span className={styles.payName}><b>{name}</b>{k !== "talk" && off > 0 && <small>{bundle ? `${money(off)} off` : k === "full" ? "20% off" : "10% off"}</small>}</span>
                        <strong>{price}</strong>
                      </button>
                    );
                  })}
                </div>
                {!later && (
                <div className={`${styles.card} ${styles.payCard}`}>
                  <div className={styles.tabs} role="tablist" aria-label="Payment method">
                    <button type="button" role="tab" aria-selected={method === "easypaisa"} className={method === "easypaisa" ? styles.tabOn : ""} onClick={() => setMethod("easypaisa")}>Easypaisa / JazzCash</button>
                    <button type="button" role="tab" aria-selected={method === "ubl"} className={method === "ubl" ? styles.tabOn : ""} onClick={() => setMethod("ubl")}>UBL Bank</button>
                  </div>
                  <div className={styles.payGrid}>
                    <div className={styles.acct}>
                      <PayRow label="Account title" value="Muhammad Hamza" copy="Muhammad Hamza" />
                      {method === "easypaisa" ? (
                        <PayRow label="Account number" value={PAYMENTS.easypaisa.number} copy={PAYMENTS.easypaisa.copy} />
                      ) : (
                        <>
                          <PayRow label="Account number" value={PAYMENTS.ubl.number} copy={PAYMENTS.ubl.number} />
                          <PayRow label="IBAN" value={PAYMENTS.ubl.iban.replace(/(.{4})(?=.)/g, "$1 ")} copy={PAYMENTS.ubl.iban} mono />
                        </>
                      )}
                    </div>
                    {method === "easypaisa" && qrOk && (
                      <figure className={styles.qr}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={PAYMENTS.easypaisa.qr} alt="Payment QR code" width={180} height={180} loading="lazy" onError={() => setQrOk(false)} />
                        <figcaption>Scan to pay</figcaption>
                      </figure>
                    )}
                  </div>
                  <div className={styles.payUpload}>
                    <Dropzone id="shot" label="Payment screenshot *" title="Upload screenshot" note="JPG, PNG, WEBP or PDF · max 4 MB" accept="image/jpeg,image/png,image/webp,application/pdf" file={shot} onFile={onShot} error={errors.shot} state={shotState} small />
                    <Field id="txn" label="Transaction ID (optional)">
                      <input id="txn" className={styles.input} value={txn} onChange={(e) => setTxn(e.target.value)} />
                    </Field>
                  </div>
                </div>
                )}
                </>
              )}
              <div className={styles.mOnly}>{finish}</div>
            </section>
          )}

        </form>

        <aside className={`${styles.card} ${styles.summary}`} aria-label="Order summary">
          <h2>Order summary</h2>
          {summaryLines}
          {last && <div className={styles.sumFinish}>{finish}</div>}
          <Turnstile onToken={setTsToken} onStatus={setTsStatus} retry={tsRetry} />
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
          {narrow && incCard && (
            <>
              <div className={`${styles.scrim} ${styles.scrimOn}`} aria-hidden="true" />
              <div className={`${styles.sheet} ${styles.sheetOn}`} role="dialog" aria-modal="true" aria-label={incCard.name} onClick={(e) => e.stopPropagation()}>
                <span className={styles.handle} aria-hidden="true" />
                <h2>{incCard.name}</h2>
                <div className={styles.incSheetBody}><ul className={styles.pkList}>{incCard.items.map((x) => <li key={x}>{localize(m, x)}</li>)}</ul>{incCard.note && <p className={styles.incNote}>{incCard.note}</p>}</div>
                <button type="button" className={`btn btn-primary ${styles.continue} ${styles.sheetContinue}`} onClick={() => { incCard.pick(); setIncOpen(null); }}>Select this package</button>
              </div>
            </>
          )}
          <div className={styles.mbar} role="region" aria-label="Order total">
            {last && (
              <div className={styles.mterms}>
                <label key={termsShake} className={`${styles.terms} ${termsHint && !terms ? styles.termsShake : ""}`}>
                  <input type="checkbox" checked={terms} onChange={(e) => { setTerms(e.target.checked); if (e.target.checked) setTermsHint(false); }} aria-invalid={termsHint && !terms ? true : undefined} />
                  <span>I agree to the <Link href="/terms" target="_blank">Terms</Link> &amp; <Link href="/refund-policy" target="_blank">Refund Policy</Link></span>
                </label>
                {termsHint && !terms && <p className={styles.mtermsErr} role="alert">Please accept the terms</p>}
              </div>
            )}
            <button type="button" className={styles.mtotal} onClick={() => setSheet((s) => !s)} aria-expanded={sheet}>
              <span>Total payable ⌃</span>
              <strong key={due}>{money(due)}</strong>
              {plan && plan.type === "advance" && <span>Pay today {money(plan.today)}</span>}
            </button>
            {last && !terms ? (
              <button type="button" className={`btn btn-primary ${styles.continue} ${styles.mcontinue} `} aria-disabled="true" onClick={() => { setTermsHint(true); setTermsShake((n) => n + 1); }}>{label}</button>
            ) : continueBtn(styles.mcontinue)}
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return <svg className={`${styles.chev} ${open ? styles.chevOpen : ""}`} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>;
}
