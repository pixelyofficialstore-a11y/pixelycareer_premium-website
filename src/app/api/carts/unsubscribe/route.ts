import { cartToken, getCart, saveCart } from "@/lib/carts";

export const runtime = "nodejs";

/** The unsubscribe link in recovery emails: stops any further email for that cart. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const id = q.get("id") ?? "";
  const ok = q.get("t") === cartToken(id) && !!(await getCart(id));
  if (ok) await saveCart(id, { unsubscribed: true });
  const body = ok ? "You are unsubscribed. We will not email you about this order again." : "This link is not valid.";
  return new Response(`<!doctype html><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width"><body style="font-family:Arial,sans-serif;padding:48px 24px;text-align:center;color:#010c28"><p>${body}</p><p><a href="/" style="color:#0048ff">Pixely Careers</a></p></body>`, { status: ok ? 200 : 400, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
