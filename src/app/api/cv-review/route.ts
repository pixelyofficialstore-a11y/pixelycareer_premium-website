import { z } from "zod";
import { cvReviews, db } from "@/lib/db";
import { ownUpload } from "@/lib/server/cloudinary";
import { handleLead, leadBase } from "@/lib/server/lead";
import { opt } from "@/lib/server/request";

export const runtime = "nodejs";

const schema = z.object({ ...leadBase, targetRole: opt(120), targetCountry: opt(60), cvUrl: opt(500), cvPublicId: opt(200), cvFilename: opt(200) });

/** Free CV review request. The CV is optional (most people send it on WhatsApp). */
export async function POST(req: Request) {
  return handleLead(req, "cv-review", schema, async (b, attr) => {
    const cv = ownUpload("cv", b.cvUrl, b.cvPublicId);
    const [row] = await db().insert(cvReviews).values({
      ...attr, market: b.market, name: b.name, whatsapp: b.whatsapp, email: b.email, targetRole: b.targetRole, targetCountry: b.targetCountry, targetCountries: b.targetCountry ? [b.targetCountry] : null,
      cvUrl: cv ? b.cvUrl : null, cvPublicId: cv ? b.cvPublicId : null, cvFilename: cv ? b.cvFilename : null, notes: b.notes,
    }).returning({ id: cvReviews.id });
    return row;
  });
}
