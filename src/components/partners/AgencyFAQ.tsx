import Accordion from "@/components/ui/Accordion";
import { QUESTIONS } from "./faq-data";

export default function AgencyFAQ() {
  return (
    <section className="agency-section agency-faq" aria-labelledby="agency-faq-title">
      <div className="agency-wrap agency-faq-grid">
        <div className="agency-faq-aside">
          <h2 className="agency-title" id="agency-faq-title">Fair <em>questions.</em></h2>
        </div>
        <div className="agency-faq-list">
          <Accordion items={QUESTIONS.map(([q, a]) => ({ q, a }))} reveal={false} />
        </div>
      </div>
    </section>
  );
}
