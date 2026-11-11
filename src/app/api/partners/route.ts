import { z } from "zod";
import { db, partners } from "@/lib/db";
import { handleLead, leadBase } from "@/lib/server/lead";
import { opt } from "@/lib/server/request";

export const runtime = "nodejs";

const schema = z.object({
  ...leadBase,
  orgName: z.string().trim().min(1).max(160), orgType: opt(80), designation: opt(120),
  countryHq: opt(80), destinations: opt(300), monthlyVolume: opt(60), model: opt(80),
});

/** Agency partnership enquiry. `name` is the contact person. */
export async function POST(req: Request) {
  return handleLead(req, "partners", schema, async (b, attr) => {
    const [row] = await db().insert(partners).values({
      ...attr, market: b.market, orgName: b.orgName, orgType: b.orgType, contactName: b.name, designation: b.designation,
      whatsapp: b.whatsapp, email: b.email, countryHq: b.countryHq, destinations: b.destinations, monthlyVolume: b.monthlyVolume, model: b.model, notes: b.notes,
    }).returning({ id: partners.id });
    return row;
  });
}
