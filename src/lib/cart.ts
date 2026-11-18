"use client";
/**
 * The PK cart: one plan at most, plus extras. Kept in localStorage ("pixely-cart") so it survives reloads;
 * the checkout saves it to the order draft row on the server, where every price is worked out again.
 */
import { useSyncExternalStore } from "react";
import type { PackageId } from "@/config/markets";
import { cartId } from "./analytics";
import { blocked } from "./track";

export type Cart = { plan?: PackageId; offer?: string; addons: Record<string, number> };
const KEY = "pixely-cart";
const EMPTY: Cart = { addons: {} };
let cache: Cart = EMPTY;
let raw: string | null = null;

function read(): Cart {
  if (typeof window === "undefined") return EMPTY;
  try {
    const r = localStorage.getItem(KEY);
    if (r !== raw) { raw = r; cache = r ? { addons: {}, ...JSON.parse(r) } : EMPTY; }
  } catch {}
  return cache;
}
function write(c: Cart) {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
  window.dispatchEvent(new Event(KEY));
}
function subscribe(cb: () => void) {
  window.addEventListener(KEY, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(KEY, cb); window.removeEventListener("storage", cb); };
}
/**
 * Every Add to cart click (plan or extra) saves the cart to the server as an open order, anonymous allowed,
 * so the CRM sees carts that never reach checkout. The checkout later updates the SAME row (px_order_id cookie).
 * Only the package, extras and price go up from here; details and the step come from the checkout.
 */
let syncTimer: ReturnType<typeof setTimeout> | undefined;
function syncCart() {
  if (typeof window === "undefined" || blocked()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const c = read();
    if (!c.plan) return;
    const cookie = (n: string) => document.cookie.match(new RegExp(`(?:^|; )${n}=([^;]+)`))?.[1] || null;
    const bundle = c.plan === "executive" && !!c.offer;
    try {
      fetch("/api/orders/draft", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify({
        market: "pk", package: bundle ? "executive_bundle" : c.plan, addons: c.addons, bundle, step: 1, cart: true,
        eventId: cartId() || undefined, fbp: cookie("_fbp"), fbc: cookie("_fbc"),
      }) }).catch(() => {});
    } catch {}
  }, 400);
}

export const useCart = () => useSyncExternalStore(subscribe, read, () => EMPTY);
export const getCart = read;
export const cartCount = (c: Cart) => (c.plan ? 1 : 0) + Object.values(c.addons).filter((q) => q > 0).length;

export function toast(text: string) { window.dispatchEvent(new CustomEvent("pixely-toast", { detail: text })); }
export function openCart() { window.dispatchEvent(new Event("pixely-cart-open")); }

/** One plan per cart: a new plan replaces the old one. */
export function addPlan(id: PackageId, name: string, offer?: string) {
  const c = read();
  write({ ...c, plan: id, offer, addons: { ...c.addons } });
  syncCart();
  openCart();
}
export function setAddon(id: string, qty: number) {
  const c = read();
  const addons = { ...c.addons };
  if (qty > 0) addons[id] = qty; else delete addons[id];
  write({ ...c, addons });
  syncCart();
}
export function removePlan() { const c = read(); write({ ...c, plan: undefined, offer: undefined }); }
/** Replace the whole cart (the checkout keeps it in step with the form). */
export function saveCart(c: Cart) { write({ ...c, addons: { ...c.addons } }); }
export function clearCart() { write(EMPTY); }
