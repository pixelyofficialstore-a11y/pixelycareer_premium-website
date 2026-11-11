import { NextResponse } from "next/server";
import { getOfferState } from "@/lib/offer-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Live offer state: open, remaining slots and the real end time. Slot counts are cached for 60s. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const state = await getOfferState(q.get("id") ?? "brand-bundle", q.get("market") ?? "pk");
  if (!state) return NextResponse.json({ error: "Unknown offer." }, { status: 404 });
  return NextResponse.json(state, { headers: { "Cache-Control": "public, max-age=30" } });
}
