"use client";
import { useState } from "react";
import { useMarket } from "./useMarket";

// Official logo files go in /public/payments/logos/ (easypaisa.svg, jazzcash.svg, ubl.svg, visa.svg, mastercard.svg).
// CONFIRM card payments are accepted before showing Visa and Mastercard.
const LOGOS: Record<string, [string, string][]> = {
  pk: [["easypaisa", "Easypaisa"], ["jazzcash", "JazzCash"], ["ubl", "UBL"]],
  // CONFIRM card payments are live before adding Visa and Mastercard here.
  other: [],
};

/** "We accept" plus small grey logos. A logo whose file is missing is skipped, and the row hides if none load. */
export default function PaymentLogos() {
  const market = useMarket();
  const [failed, setFailed] = useState<string[]>([]);
  const list = (market === "pk" ? LOGOS.pk : LOGOS.other).filter(([id]) => !failed.includes(id));
  if (!list.length) return null;
  return (
    <div className="pay-logos" aria-label="Accepted payment methods">
      <span>We accept</span>
      {list.map(([id, name]) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={id} src={`/payments/logos/${id}.svg`} alt={name} height={20} onError={() => setFailed((f) => [...f, id])} />
      ))}
    </div>
  );
}
