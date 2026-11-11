import { NextResponse } from "next/server";
import { ORDER_COOKIE, orderBody, orderCookie, saveOrder } from "@/lib/server/orders";
import { fail, limited, readJson } from "@/lib/server/request";

export const runtime = "nodejs";

/** Autosave of the order form (package, bundle, add-ons, step, contact). Keeps one open order per visitor via the px_order_id cookie. */
export async function POST(req: Request) {
  if (limited(req, "draft", 60)) return fail(429, "Too many requests. Please wait a moment.");
  const b = await readJson(req, orderBody);
  if (!b || b.website) return fail();
  try {
    const row = await saveOrder(req, b);
    if (!row) return fail();
    const res = NextResponse.json({ ok: true, eventId: row.eventId, total: row.total });
    res.cookies.set(ORDER_COOKIE, row.id, orderCookie);
    return res;
  } catch (e) {
    console.error("draft save failed:", e instanceof Error ? e.message : "unknown");
    return fail(500, "Something went wrong. Please try again.");
  }
}
