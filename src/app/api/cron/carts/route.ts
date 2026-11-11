import { NextResponse } from "next/server";
import { runRecovery } from "@/lib/recovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Abandoned cart emails. Call this every 15 minutes from the host's scheduler with
 * "Authorization: Bearer CRON_SECRET" (Vercel Cron sends that header by itself).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json(await runRecovery());
}
