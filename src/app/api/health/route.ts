import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Liveness for Railway: the app is up. Never touches the database. */
export function GET() {
  return NextResponse.json({ ok: true });
}
