"use client";

import { useState } from "react";
import { whatsappMessage } from "@/lib/site";

const QUESTIONS = [
  ["What are your partner rates?", "They depend on document types and monthly volume. We agree exact rates on a 15-minute call."],
  ["Is there a minimum volume?", "No. Start with one candidate."],
  ["Can you use our CV template?", "Yes. Send it and we'll work in your format."],
  ["How fast is delivery?", "First drafts within 24 hours for standard documents. We confirm timelines for bulk orders."],
  ["Will you contact our candidates?", "Not in the white label model. You keep the relationship and we stay behind the scenes."],
  ["Do you offer jobs or visas?", "No. We provide career documentation only."],
];

export default function AgencyFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const callLink = whatsappMessage("Hi, I'm from [agency name]. I'd like to discuss a CV partnership.");

  return (
    <section className="agency-section" aria-labelledby="agency-faq-title">
      <div className="agency-wrap agency-faq-grid">
        <div className="agency-faq-aside">
          <p className="agency-kicker">FAQ</p>
          <h2 className="agency-title" id="agency-faq-title">Questions <em>agencies ask.</em></h2>
          <a href={callLink} target="_blank" rel="noopener noreferrer">Rather talk? Book a 15-minute call →</a>
        </div>
        <div className="agency-faq-list">
          {QUESTIONS.map(([question, answer], index) => {
            const isOpen = openIndex === index;
            const answerId = `agency-faq-answer-${index}`;
            return (
              <div className="agency-faq-item" key={question}>
                <h3>
                  <button className="agency-faq-question" type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setOpenIndex(isOpen ? null : index)}>
                    <span>{question}</span>
                    <span className="agency-faq-plus" aria-hidden="true">+</span>
                  </button>
                </h3>
                <div className="agency-faq-answer" id={answerId} hidden={!isOpen}>{answer}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
