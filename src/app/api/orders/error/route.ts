import { NextResponse } from "next/server";
import { z } from "zod";
import { logOrderIssue } from "@/lib/server/order-log";
import { fail, limited, readJson } from "@/lib/server/request";

export const runtime = "nodejs";

const body = z.object({
  stage: z.string().max(40),
  message: z.string().max(300).optional().nullable(),
  status: z.number().int().optional().nullable(),
  market: z.string().max(4).optional().nullable(),
  payChoice: z.string().max(20).optional().nullable(),
  package: z.string().max(40).optional().nullable(),
  eventId: z.string().max(40).optional().nullable(),
  file: z.object({ type: z.string().max(60), size: z.number(), name: z.string().max(120) }).optional().nullable(),
});

/** The browser reports a checkout step that failed (submit, upload), so no failure goes unseen. */
export async function POST(req: Request) {
  if (limited(req, "order-error", 20)) return fail(429);
  const b = await readJson(req, body);
  if (!b) return fail();
  await logOrderIssue(req, `client_${b.stage}`, { ...b, stage: undefined });
  return NextResponse.json({ ok: true });
}
