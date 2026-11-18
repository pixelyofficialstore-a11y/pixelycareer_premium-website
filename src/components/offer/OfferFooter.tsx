"use client";
/** /offer gets a short landing footer; every other page keeps the full footer (passed in as children). */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { CONTACT_EMAIL, WHATSAPP_URL } from "@/lib/site";
import "./footer.css";

const PHONE = "+92 370 6404900";
const PAY: [string, string, number][] = [["jazzcash", "JazzCash", 97], ["easypaisa", "Easypaisa", 84], ["ubl", "UBL bank transfer", 44]];

const FLAG = "pixely-from-offer";

/** /offer, plus checkout pages for visitors who came from /offer (flag kept for the browser session). */
export default function FooterSwitch({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [fromOffer, setFromOffer] = useState(false);
  useEffect(() => {
    try {
      if (path === "/offer") sessionStorage.setItem(FLAG, "1");
      setFromOffer(sessionStorage.getItem(FLAG) === "1");
    } catch {}
  }, [path]);
  const landing = path === "/offer" || (fromOffer && (path.startsWith("/order") || path.startsWith("/checkout")));
  if (!landing) return <>{children}</>;
  return (
    <footer className="on-dark bg-navy of-foot">
      <div className="wrap" data-foot-end>
        <div className="of-top">
          <div className="of-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-light.svg" alt="Pixely Careers" width={130} height={38} loading="lazy" />
            <p>CVs and LinkedIn profiles that get you shortlisted.</p>
          </div>
          <div className="of-pay">
            <p className="of-label">We accept</p>
            <div className="of-logos" aria-label="Accepted payment methods">
              {PAY.map(([id, name, w]) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={id} src={`/payments/logos/${id}.png`} alt={name} width={w} height={20} loading="lazy" decoding="async" />
              ))}
            </div>
            <p>Secure payment · 100% money back</p>
          </div>
          <div className="of-contact-wrap">
          <p className="of-label">Contact us</p>
          <ul className="of-contact">
            <li><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" data-cta="footer-whatsapp"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12.05 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.1-1.3A9.9 9.9 0 1 0 12.05 2zm5.4 13.9c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-1.7-.1-1.6-.5-3.6-1.6-4.9-3.5-.6-.8-1.1-1.9-1.1-2.9 0-1.1.6-1.6.8-1.9.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.4.5c-.1.2-.3.3-.1.6.6 1 1.5 1.9 2.6 2.4.3.1.4.1.6-.1l.8-1c.2-.2.3-.2.6-.1l1.8.9c.3.1.4.2.4.3.1.1.1.6-.2 1.1z" /></svg>{PHONE}</a></li>
            <li><a href={`mailto:${CONTACT_EMAIL}`} data-cta="footer-email"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>{CONTACT_EMAIL}</a></li>
          </ul>
          </div>
        </div>
        <div className="of-bottom">
          <p className="of-legal"><span className="of-links"><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> · <Link href="/refund-policy">Refund policy</Link></span><span className="of-copy">© 2026 Pixely Careers</span></p>
          <p className="of-note">Career documentation only. No job placement, visa or immigration services.</p>
        </div>
      </div>
    </footer>
  );
}
