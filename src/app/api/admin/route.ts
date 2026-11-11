import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminEnabled, clearFails, isAdmin, lockedOut, passwordOk, recordFail, sessionValue, updateOrder } from "@/lib/admin";
import { saveCart } from "@/lib/carts";
import { clearOfferCache } from "@/lib/offer-server";
import { sendPurchase } from "@/lib/recovery";

export const runtime = "nodejs";

const back = (req: Request, query = "") => NextResponse.redirect(new URL(`/admin${query}`, req.url), 303);

/** Admin form actions: sign in, sign out, mark an order paid (sends Purchase through the Conversions API), mark a cart contacted. */
export async function POST(req: Request) {
  if (!adminEnabled()) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const d = await req.formData();
  const action = String(d.get("action") ?? "");
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();

  if (action === "login") {
    if (lockedOut(ip)) return back(req, "?error=locked");
    if (!passwordOk(String(d.get("password") ?? ""))) { recordFail(ip); return back(req, "?error=wrong"); }
    clearFails(ip);
    const s = sessionValue();
    const res = back(req);
    res.cookies.set(ADMIN_COOKIE, s.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: s.maxAge });
    return res;
  }
  if (!(await isAdmin())) return back(req);
  if (action === "logout") { const res = back(req); res.cookies.delete(ADMIN_COOKIE); return res; }

  const id = String(d.get("id") ?? "");
  if (action === "paid") {
    const order = await updateOrder(id, { status: "paid", paid_at: new Date().toISOString() });
    if (order) { clearOfferCache(); await sendPurchase(order).catch(() => false); }
    return back(req, "?tab=orders");
  }
  if (action === "contacted") { await saveCart(id, { contacted: true }); return back(req, "?tab=carts"); }
  return back(req);
}
