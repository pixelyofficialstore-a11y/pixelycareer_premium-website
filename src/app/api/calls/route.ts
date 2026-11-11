import { z } from "zod";
import { calls, db } from "@/lib/db";
import { handleLead, leadBase } from "@/lib/server/lead";
import { opt } from "@/lib/server/request";

export const runtime = "nodejs";

const schema = z.object({ ...leadBase, preferredDate: opt(40), preferredTime: opt(40), timezone: opt(60), targetRole: opt(120) });

/** 15 minute call request. */
export async function POST(req: Request) {
  return handleLead(req, "calls", schema, async (b, attr) => {
    const [row] = await db().insert(calls).values({
      ...attr, market: b.market, name: b.name, whatsapp: b.whatsapp, email: b.email,
      preferredDate: b.preferredDate, preferredTime: b.preferredTime, timezone: b.timezone, targetRole: b.targetRole, notes: b.notes,
    }).returning({ id: calls.id });
    return row;
  });
}
