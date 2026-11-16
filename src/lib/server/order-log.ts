import "server-only";
import { db, events } from "@/lib/db";
import { clientIp } from "./request";

/**
 * Checkout problems (failed submits, failed uploads, a security check that could not run) as rows in website.events
 * (name "order_error" or "order_warning"), so they can be read without the hosting logs. Never throws.
 */
export async function logOrderIssue(req: Request, stage: string, detail: Record<string, unknown> = {}, level: "error" | "warning" = "error") {
  const meta = { stage, ...detail };
  (level === "error" ? console.error : console.warn)(`checkout ${level}:`, JSON.stringify(meta));
  try {
    await db().insert(events).values({
      name: level === "error" ? "order_error" : "order_warning", status: level,
      market: typeof detail.market === "string" ? detail.market.slice(0, 4) : null,
      clientIp: clientIp(req), userAgent: (req.headers.get("user-agent") ?? "").slice(0, 300) || null,
      page: (req.headers.get("referer") ?? "").slice(0, 500) || null, meta,
    });
  } catch (e) {
    console.error("checkout log failed:", e instanceof Error ? e.message : e);
  }
}
