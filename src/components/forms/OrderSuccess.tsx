"use client";
import Link from "next/link";
import { useState } from "react";
import { MARKETS, isMarketKey } from "@/config/markets";
import { whatsappMessage } from "@/lib/site";
import styles from "./OrderForm.module.css";

export default function OrderSuccess({ id, contact, market, paid, amounts }: { id: string; contact: string; market?: string; paid: boolean; amounts?: { total: number; paid: number; discount: number } }) {
  const [copied, setCopied] = useState(false);
  const m = MARKETS[isMarketKey(market) ? market : "us"];
  const orderId = /^[A-F0-9]{8}$/.test(id) ? id : "";
  // pk "Talk first": no payment yet, so a consultant reaches out.
  const talk = m.key === "pk" && !paid;
  const url = whatsappMessage(talk
    ? `Hi, I just placed order ${orderId || ""} and want to talk first`.replace("  ", " ")
    : orderId ? `Hi Pixely Careers, I just placed order ${orderId}.` : "Hi Pixely Careers, I just placed an order.");
  return (
    <div className={styles.success}>
      <svg className={styles.check} viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r="25" />
        <path d="m18 29 7 7 13-14" />
      </svg>
      <h1 className="display">Order received.</h1>
      {orderId && (
        <button
          type="button"
          className={styles.orderPill}
          onClick={() => { navigator.clipboard?.writeText(orderId).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          aria-label={copied ? "Order ID copied" : `Copy order ID ${orderId}`}
        >
          Order {orderId}
          <span aria-hidden="true">{copied ? "✓" : "⧉"}</span>
        </button>
      )}
      <p className={styles.successText}>
        {talk ? "A consultant will WhatsApp you in a few minutes."
          : m.key === "pk" ? "Payment received for verification. We\u2019ll confirm on WhatsApp within a few minutes."
          : contact === "email" ? "We\u2019ll confirm your payment by email within a few minutes." : "We\u2019ll confirm your payment on WhatsApp within a few minutes."}
      </p>
      {paid && amounts && amounts.paid > 0 && <p className={styles.successText}>Paid Rs {amounts.paid.toLocaleString("en-US")}{amounts.discount > 0 ? ` (online discount Rs ${amounts.discount.toLocaleString("en-US")})` : ""}{amounts.total > amounts.paid ? ` · Balance Rs ${(amounts.total - amounts.paid).toLocaleString("en-US")}` : ""}</p>}
      <ol className={styles.timeline}>
        <li><span>1</span>We confirm your order</li>
        <li><span>2</span>First draft in 2 days</li>
        <li><span>3</span>Revisions until you&apos;re satisfied</li>
      </ol>
      <div className={styles.successActions}>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary min-h-14 px-8" data-cta="order-success-whatsapp">{talk ? "Chat now" : "Message us on WhatsApp"}</a>
        <Link href={m.path} className={styles.textLink}>Back to home</Link>
      </div>
    </div>
  );
}
