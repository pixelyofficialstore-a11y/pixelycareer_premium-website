import { createHash, createHmac } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Carts: an unfinished order, saved once the visitor gives a WhatsApp number or email in step 2.
 * Stored as files beside the orders (ORDERS_DIR/carts). Replace with the production database.
 */
export type Cart = {
  id: string;
  status: "abandoned_pending" | "abandoned" | "converted";
  market: string;
  package: string;
  addons: Record<string, number>;
  same_day: boolean;
  offer_id: string;
  total: number;
  currency: string;
  name: string;
  preferred_contact: string;
  whatsapp: string;
  email: string;
  country: string;
  role: string;
  utm_source: string;
  utm_campaign: string;
  fbclid: string;
  fbp?: string;
  fbc?: string;
  ip?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  emails_sent: string[];
  unsubscribed?: boolean;
  contacted?: boolean;
  order_id?: string;
};

export const ABANDON_AFTER_MS = 30 * 60 * 1000;
export const ordersDir = () => process.env.ORDERS_DIR ?? path.join(process.cwd(), ".orders");
const dir = () => path.join(ordersDir(), "carts");
export const validCartId = (id: string) => /^c[a-z0-9]{8,40}$/.test(id);
const file = (id: string) => path.join(dir(), `${id}.json`);

/** A pending cart counts as abandoned after 30 minutes without a submit. */
const settle = (c: Cart): Cart =>
  c.status === "abandoned_pending" && Date.now() - Date.parse(c.updated_at) > ABANDON_AFTER_MS ? { ...c, status: "abandoned" } : c;

export async function getCart(id: string): Promise<Cart | null> {
  if (!validCartId(id)) return null;
  try { return settle(JSON.parse(await readFile(file(id), "utf8")) as Cart); } catch { return null; }
}

export async function saveCart(id: string, patch: Partial<Cart>): Promise<Cart | null> {
  if (!validCartId(id)) return null;
  await mkdir(dir(), { recursive: true });
  let cur: Cart | null = null;
  try { cur = JSON.parse(await readFile(file(id), "utf8")) as Cart; } catch {}
  const now = new Date().toISOString();
  // A finished order is never reopened by a late save from the form.
  if (cur?.status === "converted" && patch.status !== "converted") return cur;
  const next = { emails_sent: [], created_at: now, ...cur, ...patch, id, updated_at: patch.status || !cur ? now : patch.contacted !== undefined || patch.unsubscribed !== undefined || patch.emails_sent ? cur.updated_at : now } as Cart;
  await writeFile(file(id), JSON.stringify(next, null, 2));
  return next;
}

export async function listCarts(): Promise<Cart[]> {
  try {
    const files = (await readdir(dir())).filter((f) => f.endsWith(".json"));
    const carts = await Promise.all(files.map(async (f) => { try { return settle(JSON.parse(await readFile(path.join(dir(), f), "utf8")) as Cart); } catch { return null; } }));
    return carts.filter((c): c is Cart => !!c).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  } catch {
    return [];
  }
}

/** Signs the unsubscribe link, so only the email's recipient can use it. */
export const cartToken = (id: string) => createHmac("sha256", process.env.CRON_SECRET ?? process.env.ADMIN_KEY ?? "pixely").update(id).digest("hex").slice(0, 24);
export const sha256 = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");
