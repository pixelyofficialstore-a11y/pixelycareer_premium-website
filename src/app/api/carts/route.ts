import { NextResponse } from "next/server";
import { calcOrder } from "@/config/addons";
import { MARKETS, getPackages, isMarketKey, type PackageId } from "@/config/markets";
import { getOffer } from "@/config/offers";
import { saveCart, validCartId } from "@/lib/carts";
import { getOfferState } from "@/lib/offer-server";

export const runtime = "nodejs";

const text = (v: unknown, max = 120) => String(v ?? "").replace(/[<>]/g, "").trim().slice(0, max);

/** Saves or updates an unfinished order once the visitor has given a valid WhatsApp number or email. The total is always recalculated here. */
export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }
  const id = text(b.id, 50);
  const market = text(b.market, 4);
  if (!validCartId(id) || !isMarketKey(market)) return NextResponse.json({ error: "Bad request." }, { status: 400 });
  const m = MARKETS[market];
  const pkgId = text(b.package, 40) as PackageId;
  if (!getPackages(m).some((p) => p.id === pkgId)) return NextResponse.json({ error: "Bad request." }, { status: 400 });
  const email = text(b.email);
  const digits = text(b.whatsapp, 30).replace(/[\s-]/g, "");
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneOk = /^\+?\d{9,16}$/.test(digits);
  if (!emailOk && !phoneOk) return NextResponse.json({ error: "No contact yet." }, { status: 400 });
  const selection: Record<string, number> = {};
  if (b.addons && typeof b.addons === "object" && !Array.isArray(b.addons)) for (const [k, v] of Object.entries(b.addons)) selection[text(k, 40)] = Math.min(10, Math.max(0, Number(v) || 0));
  const sameDay = b.same_day === true;
  const { total } = calcOrder(m, pkgId, sameDay, selection);
  const offer = getOffer(text(b.offer_id, 40));
  const offerOk = !!offer && pkgId === offer.packageId && (selection[offer.addonId] ?? 0) > 0 && !!(await getOfferState(offer.id, market))?.open;
  const cart = await saveCart(id, {
    status: "abandoned_pending", market, package: pkgId, addons: selection, same_day: sameDay, offer_id: offerOk ? offer!.id : "", total, currency: m.currency,
    name: text(b.name), preferred_contact: b.preferred_contact === "email" ? "email" : "whatsapp", whatsapp: phoneOk ? digits : "", email: emailOk ? email : "",
    country: text(b.country, 60), role: text(b.role),
    utm_source: text(b.utm_source, 100), utm_campaign: text(b.utm_campaign, 100), fbclid: text(b.fbclid, 300),
    fbp: text(b.fbp, 100), fbc: text(b.fbc, 400),
    ip: (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim().slice(0, 60), user_agent: text(req.headers.get("user-agent"), 300),
  });
  return NextResponse.json({ ok: !!cart });
}
