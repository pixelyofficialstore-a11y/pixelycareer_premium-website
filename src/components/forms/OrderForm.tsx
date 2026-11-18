"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { availableAddons, calcOrder, totalFor, unitAt, type Selection } from "@/config/addons";
import { MARKETS, formatPricingPrice, getPackages, localize, type MarketKey, type PackageId } from "@/config/markets";
import { PAYMENTS } from "@/config/payments";
import { claritySet } from "@/components/ui/Clarity";
import { BUNDLE_ALL_LINE, BUNDLE_ITEMS, onlineOpen, onlinePrice, payPlan } from "@/config/offers";
import { cartId, setCartId, trackFunnel, type Commerce } from "@/lib/analytics";
import { send } from "@/lib/track";
import { rememberUser } from "@/lib/meta";
import { useCountdown, useOffer } from "@/components/offer/useOffer";
import { inline } from "@/components/offer/Offer";
import { whatsappMessage } from "@/lib/site";
import { clearCart, getCart, openCart, saveCart } from "@/lib/cart";
import CountryPicker from "./CountryPicker";
import { CODES } from "./Fields";
import Turnstile, { type TsStatus } from "./Turnstile";
import styles from "./OrderForm.module.css";

const STEPS = ["Cart", "Details", "Payment"];
/** PK: the cart drawer is the package step, so checkout opens on Details. */
const PK_STEPS = ["Details", "Payment", "Place order"];
const COUNTRY: Record<MarketKey, string> = { us: "USA", uk: "UK", ae: "UAE", sa: "Saudi Arabia", pk: "Pakistan" };
/** Short checklist per package: each item fits one line. */
const CHECKLIST = (key: string, id: PackageId) => {
  const gulf = key === "ae" || key === "sa" || key === "pk";
  if (id === "cv-starter") return ["ATS CV", "Cover letter", "Job keywords", "PDF and Word files"];
  if (id === "ats-career") return ["ATS / Europass CV", "Cover letter", "LinkedIn content", "Job keywords", "PDF and Word files"];
  if (id === "international-pro") return ["Everything in ATS", "International CV", "LinkedIn makeover", gulf ? "Indeed + Naukrigulf" : "Indeed", "Bio statement", "Contact card"];
  return ["Everything in Pro", "Executive CV", "Visual profile", "10 LinkedIn posts", "Interview guide"];
};
const PACKAGE_ORDER: PackageId[] = ["executive", "international-pro", "ats-career", "cv-starter"];
const CV_MAX = 5 * 1024 * 1024;
const SHOT_MAX = 10 * 1024 * 1024;
/** Phones often name files without an extension (Android) or use HEIC (iPhone): accept by name or by type; the server checks the bytes. */
const shotOk = (f: File) => /\.(jpe?g|png|webp|heic|heif|pdf)$/i.test(f.name) || /^image\/(jpeg|png|webp|heic|heif)$|^application\/pdf$/i.test(f.type) || (!/\.[a-z0-9]{2,5}$/i.test(f.name) && /^image\//i.test(f.type));
/** A checkout failure goes to the server log and website.events. Never throws. */
const report = (detail: Record<string, unknown>) => {
  try { fetch("/api/orders/error", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify(detail) }).catch(() => {}); } catch {}
};
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
      {label && <span className={styles.label}>{label}</span>}
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

function AcctRow({ method, number, copy, title }: { method: string; number: string; copy: string; title: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className={styles.acctRow}>
      <div className={styles.acctText}><span>{method}</span><strong>{number}</strong><small>{title}</small></div>
      <button type="button" className={styles.copyPill} aria-label={ok ? `${method} number copied` : `Copy ${method} number`} onClick={() => { navigator.clipboard?.writeText(copy).catch(() => {}); setOk(true); setTimeout(() => setOk(false), 1500); }}>
        {ok ? "✓ Copied" : <><CopyIcon /> Copy</>}
      </button>
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
  const [step, setStep] = useState(market === "pk" ? 2 : 1);
  const [packageId, setPackageId] = useState<PackageId>(initial ?? "international-pro");
  const [sameDay, setSameDay] = useState(restore?.sameDay ?? false);
  // Add-ons the visitor picked themselves. The bundled website lives in bundleOn, never in here.
  const [addons, setAddons] = useState<Selection>(initialAddons ?? {});
  const [bundleOn, setBundleOn] = useState(offerParam);
  // International Career Pro starts with no target country (the visitor picks one); other packages start with the market's country.
  const [countries, setCountries] = useState<string[]>(() => restore?.countries?.length ? restore.countries : restore?.country ? [restore.country] : (initial ?? "international-pro") === "international-pro" ? [] : [COUNTRY[market]]);
  const countriesTouched = useRef(!!(restore?.countries?.length || restore?.country));
  useEffect(() => {
    if (countriesTouched.current) return;
    setCountries(packageId === "international-pro" ? [] : [COUNTRY[market]]);
  }, [packageId, market]);
  const [v, setV] = useState(() => {
    // A restored cart stores the number with its country code; the form keeps them apart.
    const code = restore?.whatsapp ? CODES.filter((x) => restore.whatsapp.startsWith(x)).sort((a, b) => b.length - a.length)[0] ?? m.phoneCode : m.phoneCode;
    return { name: restore?.name ?? "", code, whatsapp: restore?.whatsapp ? restore.whatsapp.slice(restore.whatsapp.startsWith(code) ? code.length : 0) : "", email: restore?.email ?? "", contact: restore?.contact === "email" ? "email" : "whatsapp", country: restore?.country || COUNTRY[market], role: restore?.role ?? "", notes: "" };
  });
  const [cv, setCv] = useState<File | null>(null);
  const [later, setLater] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [incOpen, setIncOpen] = useState<string | null>(null);
  const [method, setMethod] = useState<"easypaisa" | "ubl">("easypaisa");
  const [txn, setTxn] = useState("");
  const [shot, setShot] = useState<File | null>(null);
  // The screenshot uploads as soon as it is picked; submit only sends its URL.
  const [shotUp, setShotUp] = useState<{ secure_url: string; public_id: string } | null>(null);
  const [shotState, setShotState] = useState<UpState>("idle");
  const [shotMsg, setShotMsg] = useState("");
  const shotSeq = useRef(0);
  const [noteOpen, setNoteOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [qrOk, setQrOk] = useState(hasQr);
  // Turnstile never blocks the order: the token is sent when there is one, and the server rate-limits orders without one.
  const tsRef = useRef("");
  const tsState = useRef<TsStatus>("checking");
  const setTsToken = (t: string) => { tsRef.current = t; };
  const setTsStatus = (st: TsStatus) => { tsState.current = st; };
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [yoOpen, setYoOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const touchY = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [footerSeen, setFooterSeen] = useState(false);
  const [narrow, setNarrow] = useState(false);
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
  // PK cart: the checkout opens with what is in the cart (a link with ?package wins), and every change goes back to it.
  const [cartReady, setCartReady] = useState(!pk);
  useEffect(() => {
    if (!pk) return;
    const c = getCart();
    // The PK cart wins over a restored draft; a link with ?package or ?offer wins over the cart.
    const q = new URLSearchParams(location.search);
    if (!q.has("package") && !q.has("offer") && c.plan) {
      setPackageId(c.plan);
      setBundleOn(c.offer === offer.id);
      setAddons(c.addons);
    }
    // An empty cart has nothing to check out: back to the plans.
    if (!q.has("package") && !q.has("offer") && !c.plan) { router.replace("/#plans"); return; }
    setCartReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!cartReady || !pk) return;
    const sync = () => {
      const c = getCart();
      if (!c.plan) { router.replace("/#plans"); return; }
      setPackageId(c.plan);
      setAddons((a) => (JSON.stringify(a) === JSON.stringify(c.addons) ? a : c.addons));
    };
    window.addEventListener("pixely-cart", sync);
    return () => window.removeEventListener("pixely-cart", sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartReady]);
  useEffect(() => {
    if (!cartReady || !pk) return;
    const c = getCart();
    const next = { plan: packageId, offer: bundle ? offer.id : undefined, addons };
    if (JSON.stringify(next) !== JSON.stringify({ plan: c.plan, offer: c.offer, addons: c.addons })) saveCart(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartReady, packageId, bundle, JSON.stringify(addons)]);
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
    setShotMsg("");
    if (!f) { setShotState("idle"); return; }
    // Say what is wrong straight away, never silently.
    if (f.size > SHOT_MAX || !shotOk(f)) {
      setShotState("error");
      setShotMsg(f.size > SHOT_MAX ? "This file is over 10 MB. Take a screenshot instead and upload that." : "Upload a photo or screenshot (JPG, PNG, HEIC) or a PDF.");
      report({ stage: "upload_rejected_in_browser", market, file: { type: f.type, size: f.size, name: f.name.slice(-40) } });
      return;
    }
    setShotState("uploading");
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 60000);
    put("payment", f, ctl.signal)
      .then((u) => { if (n === shotSeq.current) { setShotUp(u); setShotState("done"); } })
      .catch((err) => {
        if (n !== shotSeq.current) return;
        setShotState("error");
        const timeout = err instanceof Error && err.name === "AbortError";
        setShotMsg(timeout ? "The upload is taking too long. Check your internet and try again." : err instanceof Error && !/fetch|network/i.test(err.message) ? err.message : "The upload failed. Check your internet and try again.");
        report({ stage: timeout ? "upload_timeout" : "upload_failed", market, message: err instanceof Error ? err.message : String(err), file: { type: f.type, size: f.size, name: f.name.slice(-40) } });
      })
      .finally(() => clearTimeout(t));
  };
  const payNow = pk && !later;
  // pk: Pay now (in full) and Order on WhatsApp both get the online discount from config/offers.
  const planOf = () => payPlan(total, "full", { bundle });
  const online = pk && onlineOpen();
  const plan = pk ? planOf() : null;
  const talkPlan = plan ?? planOf();
  const due = plan ? plan.total : total;
  const item: Commerce = { name: bundle ? offer.title : pkg.name, ids: [bundle ? "executive_bundle" : packageId, ...list.filter((a) => !(bundle && a.id === offer.addonId)).map((a) => a.id)], value: due, currency: m.currency, items: 1 + list.length };
  const byEmail = !pk && v.contact === "email";
  const channel = byEmail ? "email" : "WhatsApp";

  // Same day delivery: only for ATS Career and International Career Pro. Cleared for Executive and the Bundle.
  const sameDayOk = !bundle && packageId !== "executive";
  useEffect(() => { if (!sameDayOk) setSameDay(false); }, [sameDayOk]);

  const choosePackage = (id: PackageId) => {
    setPackageId(id);
    claritySet("package", id);
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
      if (!pk && cv && (cv.size > CV_MAX || !/\.(pdf|docx?)$/i.test(cv.name))) e.cv = "Upload a PDF, DOC or DOCX under 5 MB.";
    }
    if (s === 3 && payNow) {
      // The screenshot is optional: it can be sent on WhatsApp after the order is placed.
      if (shot && shotState === "uploading") e.shot = "Wait a moment, your screenshot is still uploading.";
      else if (shotState === "error") e.shot = shotMsg || "The upload failed. Remove the file and try again.";
    }
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
  }, [v, cv, shot, shotState, shotMsg, later, byEmail]);

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

  // Funnel events. AddToCart is sent only from an explicit Add to cart click, never here.
  // InitiateCheckout: once when the checkout opens (after the cart has loaded), once per cart id for the visit,
  // however the visitor got here (cart drawer, a direct /checkout link, a recovery link).

  // Draft: the open order is saved on every package, bundle, add-on, step or contact change (debounced). The server prices it.
  useEffect(() => { if (restore?.id) setCartId(restore.id.replace(/-/g, "").slice(0, 20)); }, [restore?.id]);
  const checkoutSent = useRef(false);
  useEffect(() => {
    if (!cartReady || checkoutSent.current) return;
    checkoutSent.current = true;
    trackFunnel("checkout", item, cartId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartReady]);
  const orderPayload = () => {
    const u = readUtm();
    return {
      market, package: bundle ? "executive_bundle" : packageId, addons, sameDay, bundle, payChoice: pk ? (payNow ? "now" : "talk_first") : null, payAmountType: pk && payNow ? "full" : null, step,
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
  }, [step, v.whatsapp, v.code, v.email, v.name, v.country, JSON.stringify(countries), v.role, packageId, JSON.stringify(addons), sameDay, bundle, later]);
  const cont = () => {
    if (!validate(step)) return;
    // Details step done: keep name and phone for this session so later events match (Meta hashes them).
    if (step === 2) {
      const [first, ...rest] = v.name.trim().split(/\s+/).filter(Boolean);
      const phone = byEmail ? null : `${v.code}${v.whatsapp.replace(/\D/g, "").replace(/^0/, "")}`;
      rememberUser({ phone, email: v.email.trim() || null, firstName: first ?? null, lastName: rest.length ? rest[rest.length - 1] : null });
    }
    go(step + 1);
  };

  const submit = async () => {
    if (busy || !validate(3)) return;
    const viaWa = pk && later;
    // Phones and in-app browsers (Facebook, Instagram) block or swallow new windows: there WhatsApp opens from this tab,
    // after the order is saved. On a computer a tab is opened now (still inside the click) and pointed at WhatsApp once saved.
    const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    const waWin = viaWa && !touch ? window.open("about:blank", "_blank") : null;
    setBusy(true);
    setFailed(false);
    setSheet(false);
    // The security check gets a few seconds to finish; after that the order goes without it (the server rate-limits those).
    for (let i = 0; i < 20 && !tsRef.current && tsState.current === "checking"; i++) await new Promise((r) => setTimeout(r, 200));
    // Never spin forever: the CV upload and the order together get 25 seconds.
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 25000);
    let status = 0;
    try {
      const cvUp = !pk && cv ? await put("cv", cv, ctl.signal) : null;
      const res = await fetch("/api/orders/submit", { method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal, body: JSON.stringify({
        ...orderPayload(), step: 4, terms: true, turnstile: tsRef.current || null,
        cvUrl: cvUp?.secure_url ?? null, cvPublicId: cvUp?.public_id ?? null,
        paymentMethod: payNow ? method : null, screenshotUrl: payNow ? shotUp?.secure_url ?? null : null, screenshotPublicId: payNow ? shotUp?.public_id ?? null : null, transactionId: payNow ? txn || null : null,
      }) });
      status = res.status;
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ref) throw new Error(data.error || "failed");
      clearTimeout(timer);
      // AddPaymentInfo for both options, once per order, valued at the discounted total. Orders never send Lead.
      trackFunnel("payment", { ...item, value: data.total ?? due, category: payNow ? "pay_now" : "whatsapp", orderId: data.ref }, data.ref);
      try { sessionStorage.removeItem("pixely-cart-id"); } catch {}
      const q = new URLSearchParams({ id: data.ref, c: byEmail ? "email" : "whatsapp", m: market, ...(payNow ? { paid: "1", t: String(data.total ?? due), p: String(plan?.today ?? due), d: String(plan?.discount ?? 0) } : { talk: "1", t: String(data.total ?? due), n: bundle ? "November Bundle" : pkg.name }) });
      if (pk) clearCart();
      // Order on WhatsApp: saved first (above), now the chat opens with the order and the success page shows here.
      if (viaWa) {
        const off = plan && plan.discount > 0 ? (bundle ? `, ${money(plan.discount)} off` : ", 20% off") : "";
        send("Contact", { key: "wa:order:" + data.ref, name: "order-on-whatsapp", ga: { method: "whatsapp", cta: "order-on-whatsapp" } });
        const wa = whatsappMessage(`Hi, I'd like to order ${bundle ? "the November Bundle" : pkg.name} (${money(data.total ?? due)}${off}). Order no. PX-${data.ref}.`);
        if (waWin) { try { waWin.location.href = wa; } catch { waWin.close(); } }
        // On a phone the success page opens WhatsApp itself, once, as soon as it shows.
        else { try { sessionStorage.setItem("pixely-open-wa", wa); } catch {} }
      }
      router.push(`/order/success?${q}`);
    } catch (err) {
      clearTimeout(timer);
      const aborted = err instanceof Error && err.name === "AbortError";
      const network = err instanceof Error && /fetch|network|load failed/i.test(err.message);
      report({ stage: "submit", status: status || null, market, payChoice: viaWa ? "talk_first" : pk ? "now" : null, package: bundle ? "executive_bundle" : packageId, eventId: cartId() || null, message: aborted ? "timeout" : err instanceof Error ? err.message.slice(0, 300) : String(err) });
      const msg = err instanceof Error && err.message !== "failed" && !aborted && !network ? err.message : "";
      setErrors({ submit: msg ? `${/[.!?]$/.test(msg) ? msg : `${msg}.`} You can also send your order on WhatsApp below.` : aborted ? "This is taking too long. Send your order on WhatsApp below and we\u2019ll take it from there." : "We couldn\u2019t save your order. Send it on WhatsApp below and we\u2019ll take it from there." });
      setFailed(true);
      setBusy(false);
      // Order on WhatsApp still goes to WhatsApp, with every detail of the order in the message.
      if (viaWa) {
        if (waWin) { try { waWin.location.href = waOrder; } catch { waWin.close(); } }
        else window.location.href = waOrder;
      } else waWin?.close();
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
    pk ? (payNow ? `Paid in full by ${method === "ubl" ? "UBL Bank" : "Easypaisa / JazzCash"}${txn ? `, ID ${txn}` : ""}` : "Pay later") : "",
  ].filter(Boolean).join("\n"));

  const last = step === 3;
  const waBtn = last && pk && later;
  const label = waBtn ? <><WaIcon /> Continue on WhatsApp</> : last ? (pk ? <>Place order · {money(due)}</> : "Place order") : "Continue";
  const continueBtn = (cls: string) => (
    <button type="button" className={`btn btn-primary ${styles.continue} ${waBtn ? styles.waBtn : ""} ${cls}`} onClick={last ? submit : cont} disabled={busy} aria-busy={busy || undefined} data-cta={last ? "order-send-request" : "order-continue"}>
      {busy ? <><span className={styles.spinner} aria-hidden="true" /> Sending</> : label}
    </button>
  );

  const summaryLines = (
    <>
      <dl className={styles.sumList}>
        <div className={styles.sumLine}><dt>{bundle ? "November Bundle" : pkg.name}</dt><dd>{money(bundle ? bundleLine : pkg.price)}</dd></div>
        {shownList.map((a) => (
          <div key={a.id} className={styles.sumLine}><dt>{a.name}{a.qty > 1 ? ` × ${a.qty}` : ""} (add-on)</dt><dd>{money(a.total)}</dd></div>
        ))}
        {sameDay && <div className={styles.sumLine}><dt>Same day delivery</dt><dd>{pkg.sameDayLabel}</dd></div>}
        {plan && plan.discount > 0 && <div className={styles.sumLine}><dt>{bundle ? "Online discount" : "Online discount (20%)"}</dt><dd>−{money(plan.discount)}</dd></div>}
      </dl>
      <div className={styles.sumTotal}>
        <span>Total payable</span>
        <strong key={due} className={styles.totalNum}>{money(due)}</strong>
      </div>
    </>
  );
  const agree = <p className={styles.agree}>By placing your order you agree to the <Link href="/terms" target="_blank">Terms</Link> &amp; <Link href="/refund-policy" target="_blank">Refund Policy</Link>.</p>;
  const extrasCount = list.length + (sameDay ? 1 : 0);
  const finish = (
    <>
      {errors.submit && <p className={styles.error} role="alert">{errors.submit}</p>}
      {(failed || (payNow && shotState === "error")) && <a href={waOrder} target="_blank" rel="noopener noreferrer" className={styles.waFallback} data-cta="order-fail-whatsapp"><WaIcon /> Message us on WhatsApp</a>}
    </>
  );

  const pkCards = [
                  ...(pk && offerLive ? [{
                    id: "executive_bundle", name: "November Bundle · Executive Branding + Website", line: "", price: payPlan(offer.price, "full", { bundle: true }).total, was: offer.compareAt as number | undefined,
                    meta: `5 days · ${slotsLeft ?? offer.totalSlots} slot${(slotsLeft ?? offer.totalSlots) === 1 ? "" : "s"} left`, badge: "November Sale", tone: styles.pkSale,
                    items: [...BUNDLE_ITEMS] as string[], note: BUNDLE_ALL_LINE as string | undefined, sel: bundle,
                    pick: () => { choosePackage(offer.packageId); toggleBundle(true); },
                  }] : []),
                  ...PACKAGE_ORDER.map((id) => packages.find((x) => x.id === id)).filter((p): p is (typeof packages)[number] => !!p).map((p) => ({
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
                        const set1 = (n: number) => setAddons((s) => { const next = { ...s }; if (n < 1) delete next[o.id]; else next[o.id] = Math.min(o.max, n); return next; });
                        let sub: string;
                        if (!o.qty) sub = `${o.benefit} · ${money(totalFor(m.key, o.id, 1, packageId))}`;
                        else if (!on) sub = `${o.benefit} · ${money(unitAt(m.key, o.id, 1, packageId))}`;
                        else sub = `${money(totalFor(m.key, o.id, qty, packageId))} for ${qty}${qty < o.max ? ` · next ${money(unitAt(m.key, o.id, qty + 1, packageId))}` : ""}`;
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
                                  <button type="button" onClick={() => set1(qty + 1)} disabled={qty >= o.max} aria-label={`More ${o.name}`}>+</button>
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
  if (pk && !cartReady) return <div className={styles.page} style={{ minHeight: "60vh" }} />;
  return (
    <div className={`${styles.page} ${step > 1 ? styles.inner : ""}`}>
      <div className={styles.head}>
        <h1 className={`display ${styles.title}`}>Let&apos;s get you <em>shortlisted.</em></h1>
        <ol className={styles.steps} aria-label="Order steps">
          {(pk ? PK_STEPS : STEPS).map((s, i) => {
            const n = pk ? i + 2 : i + 1;
            return (
              <li key={s} className={n === step ? styles.active : n < step ? styles.complete : ""} aria-current={n === step ? "step" : undefined}>
                {n < step ? <button type="button" className={styles.stepBack} onClick={() => go(n)}><span>✓</span> {s}</button> : <><span>{i + 1}</span> {s}</>}
              </li>
            );
          })}
        </ol>
      </div>

      <div className={styles.layout}>
        <form ref={formRef} className={styles.form} noValidate data-clarity-mask="true" onSubmit={(e) => e.preventDefault()}>
          {pk && narrow && step > 1 && (
            <div className={`${styles.card} ${styles.yourOrder}`}>
              <button type="button" className={styles.yoToggle} onClick={() => setYoOpen((o) => !o)} aria-expanded={yoOpen}>
                <span>Your order: {bundle ? "November Bundle" : pkg.name}{shownList.length ? ` + ${shownList.length} extra${shownList.length > 1 ? "s" : ""}` : ""} · {money(due)}</span>
                <Chevron open={yoOpen} />
              </button>
              <button type="button" className={styles.yoEdit} onClick={openCart} data-cta="checkout-edit-order">Edit</button>
              {yoOpen && <div className={styles.yoList}>{summaryLines}</div>}
            </div>
          )}
          {!pk && step > 1 && <button type="button" className={styles.backLink} onClick={() => go(step - 1)}>← Back</button>}
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
                <Field id="role" label="Target role (optional)" error={errors.role}>
                  <input id="role" className={styles.input} placeholder="Not sure yet? Leave blank" value={v.role} onChange={(e) => set("role", e.target.value)} aria-invalid={errors.role ? true : undefined} />
                </Field>
                <Field id="country" label="Target countries *" error={errors.country}>
                  <CountryPicker id="country" value={countries} onChange={(l) => { countriesTouched.current = true; setCountries(l); set("country", l[0] ?? ""); }} invalid={!!errors.country} />
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
              {!pk && <h2 id="pay-title" className={styles.stepTitle}>Payment</h2>}
              {!pk ? (
                <div className={`${styles.card} ${styles.info}`}>
                  <Shield />
                  <p>No payment needed now. We&apos;ll send a secure payment link on WhatsApp.</p>
                </div>
              ) : (
                <>
                <div className={styles.opts}>
                  <h2 id="pay-title" className={styles.optsTitle}>How would you like to order?</h2>
                  <div className={styles.optRow} role="radiogroup" aria-labelledby="pay-title">
                    {([[false, "Pay now", "Easypaisa, JazzCash or UBL"], [true, "Order on WhatsApp", "Chat first, pay after"]] as const).map(([t, name, sub]) => (
                      <button key={name} type="button" role="radio" aria-checked={later === t} className={`${styles.opt} ${later === t ? styles.optOn : ""}`} onClick={() => setLater(t)} data-cta={t ? "order-pay-talk" : "order-pay-now"}>
                        <span className={styles.radioDot} aria-hidden="true" />
                        <span className={styles.optText}><b>{name}</b><small>{sub}</small></span>
                        {t && <span className={styles.optWa}><WaIcon /></span>}
                      </button>
                    ))}
                  </div>
                  <p className={styles.sameLine}>Same {money(talkPlan.total)} either way{talkPlan.discount > 0 ? (bundle ? ` · ${money(talkPlan.discount)} off` : " · 20% off") : ""}</p>
                  {later ? (
                    <p className={styles.waNote}>We&apos;ll open WhatsApp with your order. Our CV expert replies within 30 minutes, and you pay after the chat.</p>
                  ) : (
                    <div className={styles.howPay}>
                      <p className={styles.howTitle}>Send {money(talkPlan.total)} to either account</p>
                      <div className={styles.accts}>
                        <AcctRow method="Easypaisa / JazzCash" number={PAYMENTS.easypaisa.number} copy={PAYMENTS.easypaisa.copy} title="Muhammad Hamza" />
                        <AcctRow method="UBL Bank" number={PAYMENTS.ubl.number} copy={PAYMENTS.ubl.number} title="Muhammad Hamza" />
                      </div>
                      <p className={styles.acctsNote}>Official Pixely Careers accounts</p>
                      <div className={styles.shotBox}>
                        <Dropzone id="shot" label="" title="Upload payment screenshot" note="" accept="image/*,.heic,.heif,application/pdf" file={shot} onFile={onShot} error={errors.shot} state={shotState} small />
                        <p className={styles.shotHint}>Optional. You can also send it on WhatsApp later.</p>
                      </div>
                    </div>
                  )}
                </div>
                </>
              )}
              <div className={styles.mOnly}>{finish}</div>
            </section>
          )}
          {/* The security check lives in the form, which shows on every screen size. It used to sit in the order summary,
              which is hidden on phones, so a check that needed a tap could never be passed there. */}
          <Turnstile onToken={setTsToken} onStatus={setTsStatus} />
        </form>

        <aside className={`${styles.card} ${styles.summary}`} aria-label="Order summary">
          {pk ? <div className={styles.sumHeadRow}><h2>Your order</h2><button type="button" onClick={openCart} className={styles.editLink} data-cta="checkout-edit-order">Edit</button></div> : <h2>Order summary</h2>}
          {summaryLines}
          {last && <div className={styles.sumFinish}>{finish}</div>}
          {continueBtn(styles.summaryContinue)}
          {last && agree}
          {pk && last && !later && <p className={styles.secure}>🔒 Secure payment · Money back guarantee</p>}
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
            <button type="button" className={styles.mtotal} onClick={() => setSheet((s) => !s)} aria-expanded={sheet}>
              <span>Total payable ⌃</span>
              <strong key={due}>{money(due)}</strong>
            </button>
            {continueBtn(styles.mcontinue)}
            {last && agree}
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
