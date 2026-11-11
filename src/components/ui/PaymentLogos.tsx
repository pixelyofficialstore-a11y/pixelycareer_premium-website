"use client";
import { useMarket } from "./useMarket";

/** Horizontal logos in public/payments/logos (64px tall PNGs, shown at 18px). UBL stands for bank transfer. */
const PK: [string, string, number][] = [["jazzcash", "JazzCash", 234], ["easypaisa", "Easypaisa", 239], ["ubl", "UBL bank transfer", 0]];

/** pk only: "We accept" and three small white logo chips, always on one line. */
export default function PaymentLogos() {
  const market = useMarket();
  if (market !== "pk") return null;
  return (
    <div className="pay-logos" aria-label="Accepted payment methods">
      <span>We accept</span>
      {PK.map(([id, name]) => (
        <span key={id} className="pay-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/payments/logos/${id}.png`} alt={name} height={18} loading="lazy" />
        </span>
      ))}
    </div>
  );
}
