"use client";
/** PK cart drawer, toast and floating WhatsApp button. Rendered on every /pk page (layout). */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { availableAddons, calcOrder, unitAt } from "@/config/addons";
import { MARKETS, formatPricingPrice, marketOfPath } from "@/config/markets";
import { BUNDLE, onlineOpen, onlinePrice, payPlan } from "@/config/offers";
import { cartId, trackFunnel } from "@/lib/analytics";
import { cartCount, removePlan, setAddon, useCart } from "@/lib/cart";
import { whatsappMessage } from "@/lib/site";
import styles from "./CartDrawer.module.css";

export const WA_HELLO = whatsappMessage("Hi, I'm interested in a CV. Can you guide me?");
const m = MARKETS.pk;
const money = (n: number) => formatPricingPrice(m, n);

export const WaGlyph = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.8-1.1-4.6-4-4.8-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.6-.1 1.2Z" /></svg>
);

export default function CartDrawer() {
  const path = usePathname();
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const pkPage = marketOfPath(path) === "pk";
  const onCheckout = path.startsWith("/checkout") || path.startsWith("/order");

  useEffect(() => {
    const o = () => setOpen(true);
    let t: ReturnType<typeof setTimeout>;
    const n = (e: Event) => { setNote((e as CustomEvent<string>).detail); clearTimeout(t); t = setTimeout(() => setNote(""), 2600); };
    window.addEventListener("pixely-cart-open", o);
    window.addEventListener("pixely-toast", n);
    return () => { window.removeEventListener("pixely-cart-open", o); window.removeEventListener("pixely-toast", n); };
  }, []);
  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("cart-open");
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => { document.documentElement.classList.remove("cart-open"); window.removeEventListener("keydown", k); };
  }, [open]);
  useEffect(() => setOpen(false), [path]);
  // Fade the floating button out over the final CTA (it has its own WhatsApp button and the offer card) and the footer's last rows.
  const [footEnd, setFootEnd] = useState(false);
  useEffect(() => {
    const els = [document.getElementById("final-cta"), document.querySelector("[data-foot-end]")].filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const seen = new Set<Element>();
    const io = new IntersectionObserver((list) => { for (const e of list) e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); setFootEnd(seen.size > 0); });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [path]);

  if (!pkPage) return null;
  const bundle = cart.plan === "executive" && cart.offer === BUNDLE.id;
  const sel = bundle ? { ...cart.addons, [BUNDLE.addonId]: 1 } : cart.addons;
  const order = cart.plan ? calcOrder(m, cart.plan, false, sel) : null;
  const lines = order ? order.list.filter((a) => !(bundle && a.id === BUNDLE.addonId)) : [];
  const subtotal = order ? (bundle ? BUNDLE.price : order.pkg.price) + lines.reduce((s, a) => s + a.total, 0) : 0;
  // Every extra for this plan, with its quantity (0 = not added).
  const extras = cart.plan ? availableAddons(m, cart.plan).filter((a) => !(bundle && a.id === BUNDLE.addonId)) : [];
  const online = onlineOpen();
  const payNow = online && !bundle ? payPlan(subtotal, "full").total : subtotal;
  const step = (id: string, name: string, qty: number, next: number) => {
    if (next > qty && cart.plan) trackFunnel("cart", { name, ids: [id], value: unitAt(m.key, id, next, cart.plan), currency: "PKR", items: 1, category: "extra" });
    setAddon(id, next);
  };
  const count = cartCount(cart);

  return (
    <>
      {note && <div className={styles.toast} role="status">{note}</div>}
      {!onCheckout && (
        <a href={WA_HELLO} target="_blank" rel="noopener noreferrer" className={`${styles.fab} ${footEnd ? styles.fabAway : ""}`} aria-label="Chat on WhatsApp" data-cta="floating-whatsapp"><WaGlyph size={28} /></a>
      )}
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label="Your cart" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
            <header className={styles.head}>
              <h2>Your cart{count ? ` (${count})` : ""}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close cart" className={styles.x}>×</button>
            </header>
            {!order ? (
              <div className={styles.body}>
                <div className={styles.empty}>
                  <p>Your cart is empty.</p>
                  <Link href="/pricing#plans" className={styles.primary} onClick={() => setOpen(false)}>See plans</Link>
                </div>
              </div>
            ) : (
              <div className={styles.body}>
                <div className={styles.plan}>
                  <span className={styles.rowText}><b>{bundle ? "11.11 Bundle: Executive Branding + Personal Website" : order.pkg.name}</b><small>Plan</small></span>
                  <span className={styles.planPrice}>{online && !bundle ? <><s>{money(order.pkg.price)}</s><b>{money(onlinePrice(order.pkg.price))}</b></> : <b>{money(bundle ? BUNDLE.price : order.pkg.price)}</b>}</span>
                  <button type="button" className={styles.remove} aria-label="Remove plan" onClick={removePlan}>×</button>
                </div>
                {extras.length > 0 && (
                  <details className={styles.extras} open>
                    <summary>Add extras</summary>
                    <ul>
                      {extras.map((a) => {
                        const qty = cart.addons[a.id] ?? 0;
                        return (
                          <li key={a.id} className={qty ? styles.on : ""}>
                            <span className={styles.rowText}><b>{a.name}</b><small>{a.benefit}</small></span>
                            <span className={styles.extraSide}>
                              <b className={styles.extraPrice}>{money(unitAt(m.key, a.id, Math.max(1, qty), cart.plan!))}</b>
                              <span className={styles.stepper}>
                                <button type="button" onClick={() => step(a.id, a.name, qty, qty - 1)} disabled={qty < 1} aria-label={`Fewer ${a.name}`}>−</button>
                                <output aria-live="polite">{qty}</output>
                                <button type="button" onClick={() => step(a.id, a.name, qty, qty + 1)} disabled={qty >= a.max} aria-label={`Add ${a.name}`} data-cta={`cart-add-${a.id}`}>+</button>
                              </span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                )}
              </div>
            )}
            {order && (
              <footer className={styles.foot}>
                <div className={styles.fSub}><span>Subtotal</span><span>{money(subtotal)}</span></div>
                <div className={styles.fTotal}><span>{online && !bundle ? "Total (pay in full online)" : "Total"}</span><span>{money(payNow)}</span></div>
                <Link href="/checkout" className={styles.fCheckout} data-cta="cart-checkout" onClick={() => { trackFunnel("checkout", { name: bundle ? BUNDLE.title : order.pkg.name, ids: [cart.plan!, ...Object.keys(sel).filter((k) => sel[k] > 0)], value: payNow, currency: "PKR", items: count }, cartId()); setOpen(false); }}>Place your order</Link>
                <button type="button" className={styles.fContinue} onClick={() => setOpen(false)}>Continue browsing</button>
              </footer>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
