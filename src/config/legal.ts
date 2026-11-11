import { BUNDLE } from "./offers";
/** Owner details. An empty value hides the sentence that uses it; nothing renders a placeholder. */
export const LEGAL = {
  legalName: "",
  address: "",
  email: "info@pixelycareers.com",
  /** Empty: renewal is agreed individually. */
  portfolioRenewal: "",
  analyticsTools: ["Google Analytics", "Google Ads", "Meta Pixel"],
  lastUpdated: "11 November 2026",
};
// CONFIRM (owner only, never rendered): legalName and address are hidden until filled in.

export const LAST_UPDATED = LEGAL.lastUpdated;
const WA = "WhatsApp +92 370 6404900";

/** note: an important point, shown in a light box under the section text. */
export type LegalSection = { title: string; text: string; note?: string; id?: string };

const SALE_ENDS = new Date(BUNDLE.endsAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Karachi" });

const list = (items: string[]) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);
const who = LEGAL.legalName ? ` (${LEGAL.legalName}${LEGAL.address ? `, ${LEGAL.address}` : ""})` : "";
const tools = LEGAL.analyticsTools.length ? `, including ${list(LEGAL.analyticsTools)}` : "";

export const PRIVACY: LegalSection[] = [
  { title: "Who we are", text: `Pixely Careers${who} provides career documentation and personal branding services. Contact: ${LEGAL.email} or ${WA}.` },
  { title: "What we collect", text: "Information you give us: name, WhatsApp number, email, target country and role, your CV and career details, and messages you send us. Basic technical data: device, browser, pages visited and how you arrived (for example, from an ad)." },
  { title: "How we use it", text: "To prepare and deliver your documents, communicate with you about your order, provide support, improve our website and services, and measure our advertising. If you start an order and don’t finish it, we may contact you once to help you complete it." },
  { title: "Your CV and career documents", text: "We use them only to provide the service you asked for. We don’t publish them or show them as samples without your written permission. Team members who work on your order can access them.", note: "Payment screenshots are used only to verify your payment." },
  { title: "Sharing", text: "We don’t sell your personal data. We share it only with service providers that help us operate (such as hosting, messaging, analytics and advertising platforms), or when required by law." },
  { title: "Cookies and analytics", text: `We use cookies and similar tools for site function, analytics and advertising measurement${tools}. You can control cookies in your browser settings.` },
  { title: "How long we keep data", text: "We keep your order details and documents only during your support period, so we can provide revisions, free updates and support. We delete them as soon as the support period ends, unless the law requires otherwise. You can ask us to delete them sooner." },
  { title: "Your rights", text: "Depending on where you live (for example, under UK GDPR, or data protection laws in the UAE, Saudi Arabia or Pakistan), you may have the right to access, correct, delete or object to the use of your data. Contact us to make a request." },
  { title: "International transfers", text: "We work remotely and may process data outside your country. We take reasonable steps to protect it." },
  { title: "Security", text: "We use reasonable technical and organizational measures to protect your data. No method is 100% secure." },
  { title: "Children", text: "Our services aren’t directed at children under 16." },
  { title: "Changes", text: "We may update this policy. The “Last updated” date shows the latest version." },
];

export const TERMS: LegalSection[] = [
  { title: "Services", text: "Career documentation and personal branding as described in each package.", note: "We don’t provide job placement, visa or immigration services, and we don’t guarantee interviews or job offers." },
  { title: "Orders", text: "Submitting an order request isn’t a purchase. Your order is confirmed when we confirm the details and receive payment." },
  { title: "Delivery", text: "First drafts are delivered within 2 days (3 days for Executive) after we receive your complete information. Same day delivery is an optional paid extra and covers the package documents only. Extras arrive within 2 to 3 days." },
  { title: "Revisions and free updates", text: "We revise your documents until you’re satisfied, as long as the changes stay within the same role and content. After delivery, you get free updates during your support period: 3 for ATS Career and International Career Pro, 4 for Executive Career Branding.", note: "A new target role needs a new order or an Another ATS CV extra." },
  { title: "Payments and refunds", text: "Work starts once payment is received. The first draft is a watermarked PDF, and the editable Word file follows your approval. If you’re not satisfied with the first draft, request a refund within 7 days of receiving it. See our [Refund Policy](/refund-policy)." },
  { title: "Extras", text: "Extras such as Another CV and Arabic CV are for the same person and experience, tailored for another role or market." },
  { id: "offers", title: "11.11 Sale", text: `The 11.11 Sale is for orders placed in Pakistan. ${BUNDLE.headline} costs Rs ${BUNDLE.price.toLocaleString("en-US")} instead of Rs ${BUNDLE.compareAt.toLocaleString("en-US")}. The offer ends on ${SALE_ENDS} or when all ${BUNDLE.totalSlots} slots are taken, whichever comes first. The domain and hosting for the website are free for the first year.` },
  { title: "Portfolio website", text: `Domain and hosting are free for the first year. ${LEGAL.portfolioRenewal ? `After that, renewal costs ${LEGAL.portfolioRenewal} per year.` : "Renewal after that is agreed with you before the first year ends."}` },
  { title: "Your responsibilities", text: "You confirm that the information you give us is accurate and truthful. We won’t write false qualifications or experience." },
  { title: "Ownership", text: "After full payment, you may use your final documents freely for your job search. We may reuse anonymized formats and layouts." },
  { title: "Liability", text: "Our total liability is limited to the amount you paid for the order." },
  { title: "Contact", text: `${LEGAL.email} · ${WA}` },
];

export const REFUND: LegalSection[] = [
  { title: "Our guarantee", text: "If you’re not satisfied with your first draft, we’ll refund your payment in full." },
  { title: "How to request", text: "Message us on WhatsApp or email within 7 days of receiving your first draft, with your order ID." },
  { title: "What’s refunded", text: "The full amount you paid for the order, including extras and same day delivery." },
  { title: "When it doesn’t apply", text: "After you approve a draft and receive the editable files, after the 7 day window, or when the request is for a new target role." },
  { title: "Timing", text: "Refunds are sent to your original payment method within 7 working days." },
];
