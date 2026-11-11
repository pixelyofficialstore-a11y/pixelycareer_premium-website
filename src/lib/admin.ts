import { createHmac, timingSafeEqual } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { ordersDir } from "@/lib/carts";

/** Admin sign in: the password is ADMIN_PASSWORD (env). The session is a signed, httpOnly cookie that lasts 12 hours. */
export const ADMIN_COOKIE = "pc_admin";
const SESSION_MS = 12 * 60 * 60 * 1000;
const sign = (exp: number) => createHmac("sha256", process.env.ADMIN_PASSWORD ?? "").update(`admin.${exp}`).digest("hex");
const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export const adminEnabled = () => (process.env.ADMIN_PASSWORD ?? "").length >= 8;
const digest = (v: string) => createHmac("sha256", "pixely-admin").update(v).digest("hex");
export const passwordOk = (given: string) => adminEnabled() && same(digest(given), digest(process.env.ADMIN_PASSWORD as string));
export function sessionValue() { const exp = Date.now() + SESSION_MS; return { value: `${exp}.${sign(exp)}`, maxAge: SESSION_MS / 1000 }; }

export async function isAdmin() {
  if (!adminEnabled()) return false;
  const [exp, mac] = ((await cookies()).get(ADMIN_COOKIE)?.value ?? "").split(".");
  return !!exp && !!mac && Number(exp) > Date.now() && same(mac, sign(Number(exp)));
}

/** 5 failed sign ins from one address lock it out for 15 minutes (per server instance). */
const fails = new Map<string, { n: number; until: number }>();
export function lockedOut(ip: string) { const f = fails.get(ip); return !!f && f.until > Date.now() && f.n >= 5; }
export function recordFail(ip: string) {
  const f = fails.get(ip);
  const n = f && f.until > Date.now() ? f.n + 1 : 1;
  fails.set(ip, { n, until: Date.now() + 15 * 60 * 1000 });
}
export const clearFails = (ip: string) => fails.delete(ip);

export type OrderRecord = {
  id: string; market: string; package: string; total: number; currency: string; name: string; whatsapp: string; email: string;
  payment_choice: string; offer_id?: string; utm_source?: string; utm_campaign?: string; fbclid?: string; fbp?: string; fbc?: string; ip?: string; user_agent?: string;
  status?: string; paid_at?: string; created_at: string; addons?: { id: string; qty: number; total: number }[];
};

export async function listOrders(): Promise<OrderRecord[]> {
  try {
    const files = (await readdir(ordersDir())).filter((f) => /^PC-\d+\.json$/.test(f));
    const all = await Promise.all(files.map(async (f) => { try { return JSON.parse(await readFile(path.join(ordersDir(), f), "utf8")) as OrderRecord; } catch { return null; } }));
    return all.filter((o): o is OrderRecord => !!o).sort((a, b) => b.created_at.localeCompare(a.created_at));
  } catch {
    return [];
  }
}

export async function updateOrder(id: string, patch: Partial<OrderRecord>) {
  if (!/^PC-\d+$/.test(id)) return null;
  const file = path.join(ordersDir(), `${id}.json`);
  try {
    const next = { ...(JSON.parse(await readFile(file, "utf8")) as OrderRecord), ...patch };
    await writeFile(file, JSON.stringify(next, null, 2));
    return next;
  } catch {
    return null;
  }
}
