import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { calcOrder } from "@/config/addons";
import { MARKETS, getPackages, isMarketKey, type PackageId } from "@/config/markets";
import { getOffer } from "@/config/offers";
import { clearOfferCache, getOfferState } from "@/lib/offer-server";

export const runtime = "nodejs";
const MAX = 10 * 1024 * 1024;
const CV_TYPES = new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);

/**
 * Stores the order as files in ORDERS_DIR (default ./.orders). Replace this with the database,
 * file storage and email provider used in production.
 */
async function persist(id: string, record: Record<string, unknown>, files: Record<string, File | null>) {
  const dir = process.env.ORDERS_DIR ?? path.join(process.cwd(), ".orders");
  await mkdir(path.join(dir, "uploads"), { recursive: true });
  const urls: Record<string, string> = {};
  for (const [key, file] of Object.entries(files)) {
    if (!file) continue;
    const name = `${id}-${key}${path.extname(file.name).slice(0, 8)}`.replace(/[^\w.]/g, "_");
    await writeFile(path.join(dir, "uploads", name), Buffer.from(await file.arrayBuffer()));
    urls[`${key}_url`] = `uploads/${name}`;
  }
  await writeFile(path.join(dir, `${id}.json`), JSON.stringify({ ...record, ...urls, created_at: new Date().toISOString() }, null, 2));
}

const asFile = (v: FormDataEntryValue | null) => (v instanceof File && v.size > 0 ? v : null);

export async function POST(req: Request) {
  const d = await req.formData();
  const s = (k: string) => String(d.get(k) ?? "").trim();
  const market = s("market");
  if (!isMarketKey(market)) return NextResponse.json({ error: "Invalid market." }, { status: 400 });
  const m = MARKETS[market];
  const pkgId = s("package") as PackageId;
  if (!getPackages(m).some((p) => p.id === pkgId)) return NextResponse.json({ error: "Choose a package." }, { status: 400 });
  const phoneOk = /^\d{7,15}$/.test(s("whatsapp").replace(/[\s-]/g, "").replace(/^0/, ""));
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s("email"));
  const byEmail = s("preferred_contact") === "email";
  if (!s("name") || (byEmail ? !emailOk : !phoneOk) || !s("country") || !s("role") || s("terms") !== "yes") {
    return NextResponse.json({ error: "Please check your details." }, { status: 400 });
  }
  const payNow = market === "pk" && s("payment_choice") === "now";
  const cv = asFile(d.get("cv"));
  const shot = asFile(d.get("screenshot"));
  if (payNow && !shot) return NextResponse.json({ error: "Upload your payment screenshot." }, { status: 400 });
  if ((cv && (cv.size > MAX || !CV_TYPES.has(cv.type))) || (shot && (shot.size > MAX || !shot.type.startsWith("image/")))) {
    return NextResponse.json({ error: "Check the file type and size (max 10 MB)." }, { status: 400 });
  }
  let raw: unknown = {};
  try { raw = JSON.parse(s("addons") || "{}"); } catch {}
  const selection: Record<string, number> = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) for (const [k, v] of Object.entries(raw)) selection[k] = Number(v) || 0;
  const { list, total } = calcOrder(m, pkgId, s("same_day") === "yes", selection);
  // The offer is only recorded while it is open and the order really has its package and add-on.
  const offer = getOffer(s("offer_id"));
  const offerOk = !!offer && pkgId === offer.packageId && (selection[offer.addonId] ?? 0) > 0 && !!(await getOfferState(offer.id, market))?.open;
  const id = `PC-${String(randomInt(0, 1000000)).padStart(6, "0")}`;
  const record = {
    id,
    market,
    package: pkgId,
    same_day: s("same_day") === "yes",
    addons: list.map((a) => ({ id: a.id, qty: a.qty, unitBreakdown: a.unitBreakdown, total: a.total })),
    total,
    currency: m.currency,
    name: s("name"),
    whatsapp: byEmail ? "" : `${s("code")}${s("whatsapp")}`,
    email: s("email"),
    preferred_contact: s("preferred_contact") || "whatsapp",
    country: s("country"),
    role: s("role"),
    notes: s("notes").slice(0, 500),
    payment_choice: payNow ? "now" : "later",
    payment_method: payNow ? s("payment_method") : "",
    transaction_id: s("transaction_id"),
    offer_id: offerOk ? offer!.id : "",
    utm_source: s("utm_source").slice(0, 100),
    utm_campaign: s("utm_campaign").slice(0, 100),
  };
  try {
    await persist(id, record, { cv, screenshot: shot });
  } catch (e) {
    console.error("order persist failed", e);
    return NextResponse.json({ error: "We could not save your order. Please try again." }, { status: 500 });
  }
  clearOfferCache();
  // Send the email notification here with the provider configured in production.
  return NextResponse.json({ id, total });
}
