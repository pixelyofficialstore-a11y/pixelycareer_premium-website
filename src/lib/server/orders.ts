import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db, orders } from "@/lib/db";
import { attribution, honeypot, normalizePhone, opt } from "./request";
import { priceOrder } from "./pricing";

export const ORDER_COOKIE = "px_order_id";
const OPEN = ["cart", "abandoned"] as const;

/** Everything the order form sends while the visitor fills it in. Money never comes from here. */
export const orderBody = z.object({
  ...honeypot,
  market: z.string().max(4),
  package: z.string().max(40),
  addons: z.record(z.string().max(40), z.number().int().min(0).max(10)).default({}),
  sameDay: z.boolean().default(false),
  bundle: z.boolean().default(false),
  payChoice: z.enum(["now", "later"]).nullable().optional(),
  step: z.number().int().min(1).max(4).default(1),
  name: opt(120), code: opt(6), whatsapp: opt(30), email: z.string().trim().max(160).email().optional().nullable().or(z.literal("")).transform((v) => v || null),
  targetCountry: opt(60), targetRole: opt(120), notes: opt(500),
  fbp: opt(100), fbc: opt(400),
  /** A recovery link's order id (from /order?cart=...), used when there is no cookie yet. */
  resume: z.string().uuid().optional().nullable(),
  /** The browser's cart id: the Pixel and the Conversions API share it as the event id. */
  eventId: z.string().regex(/^[a-z0-9]{6,40}$/i).optional(),
});
export type OrderBody = z.infer<typeof orderBody>;

/** The visitor's open order (cart or abandoned) from the px_order_id cookie. */
export async function currentOrderId(resume?: string | null) {
  const id = (await cookies()).get(ORDER_COOKIE)?.value ?? resume ?? undefined;
  if (!id || !z.string().uuid().safeParse(id).success) return null;
  const [row] = await db().select({ id: orders.id }).from(orders).where(and(eq(orders.id, id), inArray(orders.status, [...OPEN]))).limit(1);
  return row?.id ?? null;
}

/** Insert or update the open order. Returns its id and event id, or null when the package or market is invalid. */
export async function saveOrder(req: Request, b: OrderBody, extra: Partial<typeof orders.$inferInsert> = {}) {
  const price = await priceOrder({ market: b.market, package: b.package, addons: b.addons, sameDay: b.sameDay, bundle: b.bundle, payChoice: b.payChoice ?? null });
  if (!price) return null;
  const whatsapp = b.whatsapp ? normalizePhone(b.whatsapp, b.code ?? "") : null;
  const values = {
    ...price,
    payChoice: b.market === "pk" ? b.payChoice ?? null : null,
    name: b.name, whatsapp, email: b.email,
    targetCountry: b.targetCountry, targetRole: b.targetRole, notes: b.notes,
    stepReached: b.step, lastActivityAt: new Date(), updatedAt: new Date(),
    ...extra,
  };
  const id = await currentOrderId(b.resume);
  if (id) {
    const [row] = await db().update(orders).set(values).where(and(eq(orders.id, id), inArray(orders.status, [...OPEN]))).returning({ id: orders.id, eventId: orders.eventId, total: orders.total, status: orders.status });
    if (row) return row;
  }
  const attr = await attribution(req, { fbp: b.fbp, fbc: b.fbc, market: b.market });
  const [row] = await db().insert(orders).values({ ...attr, status: "cart", ...values, eventId: b.eventId ?? `o${randomUUID().replace(/-/g, "").slice(0, 20)}` })
    .returning({ id: orders.id, eventId: orders.eventId, total: orders.total, status: orders.status });
  return row;
}

export const orderCookie = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 30 };

/** An open order for a recovery link. Only the fields the form needs. */
export async function loadOpenOrder(id: string) {
  if (!z.string().uuid().safeParse(id).success) return null;
  const [row] = await db().select({
    id: orders.id, market: orders.market, package: orders.package, addons: orders.addons, isBundle: orders.isBundle, sameDay: orders.sameDay,
    name: orders.name, whatsapp: orders.whatsapp, email: orders.email, targetCountry: orders.targetCountry, targetRole: orders.targetRole,
  }).from(orders).where(and(eq(orders.id, id), inArray(orders.status, [...OPEN]))).limit(1);
  return row ?? null;
}
