import { MARKETS, formatPricingPrice, getPackages, isMarketKey } from "@/config/markets";
import { BUNDLE, offerOpen, timeLeft } from "@/config/offers";
import { cartToken, listCarts, saveCart, sha256, type Cart } from "@/lib/carts";
import { SITE } from "@/lib/seo";

const HOUR = 60 * 60 * 1000;

function describe(c: Cart) {
  const m = isMarketKey(c.market) ? MARKETS[c.market] : MARKETS.us;
  const pkg = getPackages(m).find((p) => p.id === c.package);
  const name = c.offer_id === BUNDLE.id ? `${BUNDLE.title}: ${BUNDLE.headline}` : pkg?.name ?? "Your package";
  return { name, total: formatPricingPrice(m, c.total) };
}

/** Sends one email through Resend. Does nothing (and reports it) when RESEND_API_KEY is not set. */
async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.RESEND_FROM ?? "Pixely Careers <info@pixelycareers.com>", to, subject, html }),
  });
  return res.ok;
}

function email(c: Cart, kind: "1h" | "24h") {
  const { name, total } = describe(c);
  const link = `${SITE}/order?cart=${c.id}`;
  const unsub = `${SITE}/api/carts/unsubscribe?id=${c.id}&t=${cartToken(c.id)}`;
  const sale = c.offer_id === BUNDLE.id && offerOpen(BUNDLE, "pk");
  const t = timeLeft(BUNDLE.endsAt);
  const hi = c.name ? `Hi ${c.name.split(" ")[0]},` : "Hi,";
  const lead = kind === "1h"
    ? "You started an order with Pixely Careers. We saved it for you, so you can finish in a minute."
    : sale ? `Your 11.11 price is still waiting. The sale ends in ${t.d} days and ${t.h} hours.` : "Your order is still saved. You can finish it whenever you are ready.";
  const subject = kind === "1h" ? "Your order is saved" : "Still thinking? Your 11.11 price is waiting";
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#010c28;line-height:1.6">
<p>${hi}</p><p>${lead}</p>
<table style="width:100%;border:1px solid #e6ecf5;border-radius:12px;padding:14px 16px;margin:16px 0"><tr><td>${name}</td><td style="text-align:right;font-weight:700">${total}</td></tr></table>
<p><a href="${link}" style="display:inline-block;padding:14px 26px;border-radius:999px;background:#0048ff;color:#fff;text-decoration:none;font-weight:600">Complete your order →</a></p>
<p style="color:#6b7280;font-size:13px">100% money back guarantee.</p>
<p style="color:#8792a5;font-size:12px;margin-top:28px">You are getting this because you started an order on pixelycareers.com. <a href="${unsub}" style="color:#8792a5">Unsubscribe</a></p></div>`;
  return { subject: kind === "24h" && !sale ? "Still thinking? Your order is waiting" : subject, html };
}

/**
 * Run by the scheduler (/api/cron/carts). For carts with an email that never became an order:
 * one email after 1 hour, one after 24 hours. Stops on conversion or unsubscribe.
 */
export async function runRecovery() {
  let sent = 0, skipped = 0;
  for (const c of await listCarts()) {
    if (c.status === "converted" || c.unsubscribed || !c.email) continue;
    const age = Date.now() - Date.parse(c.updated_at);
    const due = age >= 24 * HOUR ? "24h" : age >= HOUR ? "1h" : null;
    // After 24 hours only the second email goes out; a cart never gets the same email twice.
    if (!due || c.emails_sent.includes(due) || age > 72 * HOUR) continue;
    const { subject, html } = email(c, due);
    if (await send(c.email, subject, html)) { await saveCart(c.id, { emails_sent: [...c.emails_sent, due] }); sent++; } else skipped++;
  }
  return { sent, skipped, resend: !!process.env.RESEND_API_KEY };
}

/**
 * Meta Conversions API: Purchase, sent only when an order is marked paid. The event id matches the order id,
 * so Meta can match it with the browser's Lead event for the same order.
 */
export async function sendPurchase(order: { id: string; total: number; currency: string; email?: string; whatsapp?: string; fbclid?: string; created_at?: string }) {
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID, token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token) return false;
  const user_data: Record<string, unknown> = {};
  if (order.email) user_data.em = [sha256(order.email)];
  if (order.whatsapp) user_data.ph = [sha256(order.whatsapp.replace(/\D/g, ""))];
  if (order.fbclid) user_data.fbc = `fb.1.${Date.parse(order.created_at ?? "") || Date.now()}.${order.fbclid}`;
  const res = await fetch(`https://graph.facebook.com/v21.0/${pixel}/events?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [{ event_name: "Purchase", event_time: Math.floor(Date.now() / 1000), event_id: `Purchase_${order.id}`, action_source: "website", event_source_url: `${SITE}/order`, user_data, custom_data: { value: order.total, currency: order.currency, order_id: order.id } }] }),
  });
  return res.ok;
}
