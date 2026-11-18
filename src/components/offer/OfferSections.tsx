/** /offer sections: Proof (three review cards), How it works (one strip) and the guarantee row. */
export { OfferProof } from "./OfferProof";
import "./landing.css";

const STEPS = ["Choose package", "CV expert WhatsApps you", "First draft in 2 days", "Final PDF + Word"];

/** id="process" stays, so old #process links still land here. */
export function OfferSteps() {
  return (
    <section id="process" className="ol-steps" aria-labelledby="ol-steps-title">
      <div className="wrap">
        <h2 id="ol-steps-title" className="ol-steps-title" data-anchor>What happens after you order</h2>
        <ol className="ol-steps-list">
          {STEPS.map((s, i) => (
            <li key={s}><span className="ol-num" aria-hidden="true">{i + 1}</span><span>{s}</span></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const Shield = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6z" /><path d="m9 12 2 2 4-4" /></svg>;
const Loop = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8" /><path d="M4 4v4h4" /><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16" /><path d="M20 20v-4h-4" /></svg>;
const Clock = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;

export function OfferGuarantee() {
  return (
    <section className="ol-guar" aria-label="Our guarantee">
      <ul className="wrap ol-guar-list">
        <li><Shield /><span>100% money back</span></li>
        <li><Loop /><span>Free revisions</span></li>
        <li><Clock /><span>Draft in 2 days</span></li>
      </ul>
    </section>
  );
}
