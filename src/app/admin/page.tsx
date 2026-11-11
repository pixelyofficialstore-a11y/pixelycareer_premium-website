import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MARKETS, formatPricingPrice, getPackages, isMarketKey } from "@/config/markets";
import { BUNDLE } from "@/config/offers";
import { adminEnabled, isAdmin, listOrders } from "@/lib/admin";
import { listCarts, type Cart } from "@/lib/carts";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin | Pixely Careers", robots: { index: false, follow: false } };

const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" });
const money = (market: string, n: number) => formatPricingPrice(isMarketKey(market) ? MARKETS[market] : MARKETS.us, n);
const pkgName = (market: string, id: string, offer?: string) =>
  offer === BUNDLE.id ? `${BUNDLE.title}: ${BUNDLE.short}` : getPackages(isMarketKey(market) ? MARKETS[market] : MARKETS.us).find((p) => p.id === id)?.name ?? id;

function waLink(c: Cart) {
  const text = `Hi ${c.name ? c.name.split(" ")[0] : "there"}, you were checking out ${pkgName(c.market, c.package, c.offer_id)} on Pixely Careers. Can I help you finish your order?`;
  return `https://wa.me/${c.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

const css = `
.ad { max-width: 1100px; margin: 0 auto; padding: calc(80px + var(--bar-h, 0px) + 40px) 20px 80px; color: #010c28; font-size: 14px; }
.ad h1 { margin: 0 0 20px; font-size: 28px; font-weight: 600; }
.ad-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
.ad-tabs { display: flex; gap: 8px; }
.ad-tabs a { padding: 8px 16px; border: 1px solid #e6ecf5; border-radius: 999px; color: #3a465b; text-decoration: none; font-weight: 500; }
.ad-tabs a[aria-current] { border-color: #0048ff; background: #0048ff; color: #fff; }
.ad table { width: 100%; border-collapse: collapse; }
.ad th, .ad td { padding: 10px 8px; border-bottom: 1px solid #e6ecf5; text-align: left; vertical-align: top; }
.ad th { color: #6b7280; font-size: 12px; font-weight: 500; }
.ad-scroll { overflow-x: auto; }
.ad small { display: block; color: #6b7280; }
.ad-btn { display: inline-block; padding: 7px 14px; border: 0; border-radius: 999px; background: #0048ff; color: #fff; font: inherit; font-weight: 600; text-decoration: none; cursor: pointer; white-space: nowrap; }
.ad-btn-ghost { border: 1px solid #e6ecf5; background: #fff; color: #010c28; }
.ad-pill { display: inline-block; padding: 2px 9px; border-radius: 999px; background: #f6f8fc; color: #3a465b; font-size: 12px; white-space: nowrap; }
.ad-login { max-width: 360px; margin: 0 auto; display: grid; gap: 12px; }
.ad-login input { height: 48px; padding: 0 14px; border: 1px solid #e6ecf5; border-radius: 12px; font: inherit; }
.ad-err { color: #c2410c; }
.ad-actions { display: flex; gap: 8px; flex-wrap: wrap; }
`;

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string; error?: string }> }) {
  if (!adminEnabled()) notFound();
  const q = await searchParams;
  if (!(await isAdmin())) {
    return (
      <div className="ad">
        <style>{css}</style>
        <form method="post" action="/api/admin" className="ad-login">
          <h1>Admin sign in</h1>
          <input type="hidden" name="action" value="login" />
          <input type="password" name="password" placeholder="Password" autoComplete="current-password" required aria-label="Password" />
          {q.error === "wrong" && <p className="ad-err">Wrong password.</p>}
          {q.error === "locked" && <p className="ad-err">Too many attempts. Try again in 15 minutes.</p>}
          <button className="ad-btn" type="submit">Sign in</button>
        </form>
      </div>
    );
  }
  const tab = q.tab === "orders" ? "orders" : "carts";
  const carts = (await listCarts()).filter((c) => c.status !== "converted");
  const orders = await listOrders();
  return (
    <div className="ad">
      <style>{css}</style>
      <div className="ad-top">
        <h1>Admin</h1>
        <form method="post" action="/api/admin"><input type="hidden" name="action" value="logout" /><button className="ad-btn ad-btn-ghost" type="submit">Sign out</button></form>
      </div>
      <nav className="ad-tabs" aria-label="Admin sections">
        <a href="/admin?tab=carts" aria-current={tab === "carts" ? "page" : undefined}>Abandoned carts ({carts.filter((c) => c.status === "abandoned").length})</a>
        <a href="/admin?tab=orders" aria-current={tab === "orders" ? "page" : undefined}>Orders ({orders.length})</a>
      </nav>

      {tab === "carts" ? (
        <div className="ad-scroll">
          <table>
            <thead><tr><th>Contact</th><th>Package</th><th>Total</th><th>Last change</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {carts.length === 0 && <tr><td colSpan={6}>No carts yet.</td></tr>}
              {carts.map((c) => (
                <tr key={c.id}>
                  <td>{c.name || "No name yet"}<small>{c.whatsapp || c.email}</small>{c.utm_campaign && <small>{c.utm_source} / {c.utm_campaign}</small>}</td>
                  <td>{pkgName(c.market, c.package, c.offer_id)}</td>
                  <td>{money(c.market, c.total)}</td>
                  <td>{when(c.updated_at)}</td>
                  <td><span className="ad-pill">{c.status === "abandoned" ? "Abandoned" : "In progress"}</span>{c.contacted && <small>Contacted</small>}{c.emails_sent.length > 0 && <small>Emails: {c.emails_sent.join(", ")}</small>}</td>
                  <td>
                    <div className="ad-actions">
                      {c.whatsapp && <a className="ad-btn" href={waLink(c)} target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>}
                      {!c.contacted && <form method="post" action="/api/admin"><input type="hidden" name="action" value="contacted" /><input type="hidden" name="id" value={c.id} /><button className="ad-btn ad-btn-ghost" type="submit">Mark contacted</button></form>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="ad-scroll">
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Package</th><th>Total</th><th>Payment</th><th>Action</th></tr></thead>
            <tbody>
              {orders.length === 0 && <tr><td colSpan={6}>No orders yet.</td></tr>}
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}<small>{when(o.created_at)}</small></td>
                  <td>{o.name}<small>{o.whatsapp || o.email}</small>{o.utm_campaign && <small>{o.utm_source} / {o.utm_campaign}</small>}</td>
                  <td>{pkgName(o.market, o.package, o.offer_id)}</td>
                  <td>{money(o.market, o.total)}</td>
                  <td><span className="ad-pill">{o.status === "paid" ? "Paid" : o.payment_choice === "now" ? "Screenshot sent" : "Pay later"}</span></td>
                  <td>{o.status !== "paid" && <form method="post" action="/api/admin"><input type="hidden" name="action" value="paid" /><input type="hidden" name="id" value={o.id} /><button className="ad-btn" type="submit">Mark paid</button></form>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
