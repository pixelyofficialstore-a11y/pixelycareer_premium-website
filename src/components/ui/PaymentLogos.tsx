"use client";
import { useMarket } from "./useMarket";

/** White monochrome logos in public/payments/logos, saved at 40px tall (2x) and shown at 20px. UBL stands for bank transfer. */
const PK: [string, string, number][] = [["jazzcash", "JazzCash", 97], ["easypaisa", "Easypaisa", 84], ["ubl", "UBL bank transfer", 44]];

/** pk only: "We accept" and three small white logo chips, always on one line. */
export default function PaymentLogos() {
  const market = useMarket();
  if (market !== "pk") return null;
  return (
    <div className="pay-logos" aria-label="Accepted payment methods">
      <span>We accept</span>
      {PK.map(([id, name, w]) => (
        <span key={id} className="pay-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/payments/logos/${id}.png`} alt={name} width={w} height={20} loading="lazy" decoding="async" />
        </span>
      ))}
    </div>
  );
}
