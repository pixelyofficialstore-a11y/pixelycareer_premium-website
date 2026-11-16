import { WA_HELLO } from "@/components/cart/CartDrawer";
import styles from "./Pk.module.css";

const STEPS = [
  { n: "1", t: "Pick a plan", d: "Pick a plan and add any extras. Pay online in full and save 20%." },
  { n: "2", t: "Send your details", d: "Share your current CV and the job you want, on WhatsApp or by upload." },
  { n: "3", t: "Get your first draft", d: "Your ATS friendly CV arrives in 2 days, 3 days for Executive." },
  { n: "4", t: "Revise and apply", d: "We revise until you are happy, then you get PDF and Word files." },
];

/** PK How it works: 4 numbered cards and 2 side cards. Used on /pk and /pk/cv. */
export default function PkHowItWorks() {
  return (
    <section id="how-it-works" className={styles.how} aria-labelledby="how-title">
      <div className={styles.wrap}>
        <h2 id="how-title" className={styles.h2}>How it <em>works</em></h2>
        <div className={styles.howGrid}>
          <ol className={styles.steps}>
            {STEPS.map((s) => (
              <li key={s.n} className={styles.step}><span className={styles.num}>{s.n}</span><h3>{s.t}</h3><p>{s.d}</p></li>
            ))}
          </ol>
          <div className={styles.side}>
            <div className={styles.sideCard}><h3>100% money back guarantee</h3><p>Not happy with the first draft? Ask for a refund within 7 days.</p></div>
            <div className={`${styles.sideCard} ${styles.sideWa}`}><h3>Prefer to talk first?</h3><p>Ask us anything before you order.</p><a href={WA_HELLO} target="_blank" rel="noopener noreferrer" data-cta="how-whatsapp">Chat on WhatsApp</a></div>
          </div>
        </div>
      </div>
    </section>
  );
}
