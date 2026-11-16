import Link from "next/link";
import { CONTACT_EMAIL, FACEBOOK_URL, LINKEDIN_URL, WHATSAPP_URL } from "@/lib/site";
import styles from "./Footer.module.css";

const INSTAGRAM_URL = "https://www.instagram.com/pixelycareers.pk";
const PHONE = "+92 370 6404900";

const SERVICES = [
  { label: "ATS CV", href: "/services/ats-cv" },
  { label: "Europass CV", href: "/services/europass-cv" },
  { label: "Cover letter", href: "/services/cover-letter" },
  { label: "LinkedIn profile", href: "/services/linkedin" },
];
const COMPANY = [
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "For agencies", href: "/partners" },
];

/** Round social icons: 32px, navy chip, white glyphs (WhatsApp green). */
const SOCIAL = [
  { label: "LinkedIn", href: LINKEDIN_URL, cta: "footer-linkedin", icon: <path fill="currentColor" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" /> },
  { label: "Instagram", href: INSTAGRAM_URL, cta: "footer-instagram", icon: <g fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></g> },
  { label: "Facebook", href: FACEBOOK_URL, cta: "footer-facebook", icon: <path fill="currentColor" d="M13.5 22v-8.2h2.8l.4-3.3h-3.2V8.4c0-.95.27-1.6 1.63-1.6H17V3.86A23 23 0 0 0 14.5 3.7c-2.47 0-4.16 1.5-4.16 4.27v2.53H7.5v3.3h2.84V22h3.16z" /> },
  { label: "WhatsApp", href: WHATSAPP_URL, cta: "footer-whatsapp-icon", green: true, icon: <path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.94.95-3.48-.22-.36a9.43 9.43 0 0 1-1.45-5.02c0-5.2 4.24-9.44 9.45-9.44 2.52 0 4.89.99 6.68 2.77a9.38 9.38 0 0 1 2.76 6.68c0 5.21-4.24 9.43-9.45 9.43zm8.04-17.47A11.3 11.3 0 0 0 12.05.7C5.79.7.69 5.8.69 12.06c0 2 .52 3.96 1.52 5.68L.6 23.6l6.01-1.58a11.3 11.3 0 0 0 5.43 1.38h.01c6.26 0 11.36-5.1 11.36-11.36 0-3.03-1.18-5.89-3.32-8.03z" /> },
];

/** Original brand colours on the navy footer, saved at 40px (2x) and shown 20px tall. UBL stands for bank transfer. */
const PAY: [string, string, number][] = [["jazzcash", "JazzCash", 97], ["easypaisa", "Easypaisa", 84], ["ubl", "UBL bank transfer", 44]];

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      {/* Desktop: an open column */}
      <nav aria-label={title} className={styles.col}>
        <h2 className={styles.title}>{title}</h2>
        <ul className={styles.links}>{children}</ul>
      </nav>
      {/* Phones: a tap to open row */}
      <details className={styles.fold}>
        <summary className={styles.foldHead}>
          {title}
          <svg className={styles.chev} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </summary>
        <ul className={styles.links}>{children}</ul>
      </details>
    </>
  );
}

const links = (items: { label: string; href: string }[]) => items.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>);

export default function Footer() {
  const contact = (
    <>
      <li><a href={`mailto:${CONTACT_EMAIL}`} data-cta="footer-email">{CONTACT_EMAIL}</a></li>
      <li><a href={`tel:${PHONE.replace(/\s/g, "")}`} data-cta="footer-phone">{PHONE}</a></li>
      <li><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={styles.wa} data-cta="footer-whatsapp">Chat on WhatsApp →</a></li>
    </>
  );
  return (
    <footer className={`on-dark bg-navy ${styles.root}`}>
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-light.svg" alt="Pixely Careers" width={150} height={44} loading="lazy" className={styles.logo} />
            <p className={styles.tagline}>CVs, cover letters and LinkedIn profiles that get you shortlisted.</p>
            <ul className={styles.social}>
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} data-cta={s.cta} className={s.green ? styles.green : undefined}>
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">{s.icon}</svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <Column title="Services">{links(SERVICES)}</Column>
          <Column title="Company">{links(COMPANY)}</Column>
          <Column title="Contact">{contact}</Column>
        </div>

        <div data-foot-end>
        <div className={styles.bottom}>
          <p className={styles.legal}>
            © 2026 Pixely Careers · <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> · <Link href="/refund-policy">Refund policy</Link>
          </p>
          <div className={styles.pay} aria-label="Accepted payment methods">
            <span>We accept</span>
            {PAY.map(([id, name, w]) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={id} src={`/payments/logos/${id}.png`} alt={name} width={w} height={20} loading="lazy" decoding="async" />
            ))}
          </div>
        </div>
        <p className={styles.disclaimer}>Pixely Careers provides career documentation only. We do not offer job placement, visa or immigration services.</p>
        </div>
      </div>
    </footer>
  );
}
