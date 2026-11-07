"use client";

import { useState } from "react";
import { QUESTIONS } from "./faq-data";

export default function AgencyFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="agency-section agency-faq" aria-labelledby="agency-faq-title">
      <div className="agency-wrap agency-faq-grid">
        <div className="agency-faq-aside">
          <h2 className="agency-title" id="agency-faq-title">Common <em>questions.</em></h2>
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
