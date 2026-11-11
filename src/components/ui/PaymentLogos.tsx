"use client";
import { useMarket } from "./useMarket";

/** Simple line icons, no logo files. */
const WALLET = "M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zm0 0V6a2 2 0 0 1 2-2h11M16 13h.01";
const PHONE = "M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2";
const BANK = "M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18";

const PK: [string, string][] = [["JazzCash", PHONE], ["Easypaisa", WALLET], ["Bank transfer", BANK]];

/** pk only: "We accept" with small grey text chips. Other markets show nothing until their methods are confirmed. */
export default function PaymentLogos() {
  const market = useMarket();
  if (market !== "pk") return null;
  return (
    <div className="pay-chips" aria-label="Accepted payment methods">
      <span>We accept:</span>
      {PK.map(([name, d]) => (
        <span key={name} className="pay-chip">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
          {name}
        </span>
      ))}
    </div>
  );
}
