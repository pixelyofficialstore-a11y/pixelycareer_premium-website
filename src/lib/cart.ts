"use client";
/**
 * The PK cart: one plan at most, plus extras. Kept in localStorage ("pixely-cart") so it survives reloads;
 * the checkout saves it to the order draft row on the server, where every price is worked out again.
 */
import { useSyncExternalStore } from "react";
import type { PackageId } from "@/config/markets";

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
export const useCart = () => useSyncExternalStore(subscribe, read, () => EMPTY);
export const getCart = read;
export const cartCount = (c: Cart) => (c.plan ? 1 : 0) + Object.values(c.addons).filter((q) => q > 0).length;

export function toast(text: string) { window.dispatchEvent(new CustomEvent("pixely-toast", { detail: text })); }
export function openCart() { window.dispatchEvent(new Event("pixely-cart-open")); }

/** One plan per cart: a new plan replaces the old one (with a toast). */
export function addPlan(id: PackageId, name: string, offer?: string) {
  const c = read();
  const had = c.plan && (c.plan !== id || c.offer !== offer);
  write({ ...c, plan: id, offer, addons: { ...c.addons } });
  toast(had ? `Plan replaced with ${name}` : `${name} added to cart`);
  openCart();
}
export function setAddon(id: string, qty: number) {
  const c = read();
  const addons = { ...c.addons };
  if (qty > 0) addons[id] = qty; else delete addons[id];
  write({ ...c, addons });
}
export function removePlan() { const c = read(); write({ ...c, plan: undefined, offer: undefined }); }
/** Replace the whole cart (the checkout keeps it in step with the form). */
export function saveCart(c: Cart) { write({ ...c, addons: { ...c.addons } }); }
export function clearCart() { write(EMPTY); }
