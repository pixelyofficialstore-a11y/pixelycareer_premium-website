/**
 * Single source of truth for every market: prices, currency, phone format and local copy.
 * PKR is approved. Approval flags remain available to consumers.
 * CONFIRM: USD, GBP, AED, SAR prices and same day fees with the owner.
 */
export const MARKET_KEYS = ["us", "pk", "ae", "sa", "uk"] as const;
export type MarketKey = (typeof MARKET_KEYS)[number];
export type PackageId = "ats-career" | "international-pro" | "executive";

const PAY_CONFIRM = { q: "How do I pay?", a: "After you place your order request, we confirm the details on WhatsApp and share payment options: [CONFIRM payment methods]." };
const WHICH_FORMAT = { q: "Which CV format do I need?", a: "It depends on where you’re applying. Tell us your country and role, and we’ll use the right format." };

export type Market = {
  key: MarketKey;
  path: string;
  hreflang: string;
  code: string;
  region: string; // footer link
  areaServed: string;
  currency: string;
  symbol?: string;
  word: "resume" | "CV";
  phoneCode: string;
  approved: boolean;
  prices: Record<PackageId, number>;
  compareAt: Record<PackageId, number>;
  showCompareAt: boolean;
  sameDay: Record<PackageId, number>;
  pricingResults: Record<PackageId, string>;
  internationalFor: string;
  indeedItem: string;
  indeedRow: string;
  formatsIntro: string;
  reviewsUrl?: string;
  /** The market-specific questions, shown first. */
  faq: { q: string; a: string }[];
  meta: { title: string; description: string; ogDescription?: string };
};

const NAUKRI = { indeedItem: "Indeed & Naukrigulf profiles", indeedRow: "Indeed & Naukrigulf" };
const INDEED = { indeedItem: "Indeed profile", indeedRow: "Indeed profile" };

export const MARKETS: Record<MarketKey, Market> = {
  us: {
    key: "us",
    path: "/",
    hreflang: "en-US",
    code: "US",
    region: "United States",
    areaServed: "United States",
    currency: "USD",
    symbol: "$",
    word: "resume",
    phoneCode: "+1",
    approved: false,
    prices: { "ats-career": 99, "international-pro": 169, executive: 279 },
    compareAt: { "ats-career": 120, "international-pro": 199, executive: 329 },
    showCompareAt: true,
    sameDay: { "ats-career": 20, "international-pro": 20, executive: 25 },
    pricingResults: {
      "ats-career": "A resume that passes ATS and lands your first interviews.",
      "international-pro": "Get shortlisted for competitive roles in the US and abroad.",
      executive: "A leadership resume that wins senior level interviews.",
    },
    internationalFor: "For professionals moving up or changing roles.",
    ...INDEED,
    formatsIntro: "Formats for US employers and applications.",
    faq: [
      { q: "Do you write US-style resumes?", a: "Yes. We use US resume conventions and keywords from US job postings." },
      { q: "Which resume format do I need?", a: "It depends on where you’re applying. Tell us your country and role, and we’ll use the right format." },
      PAY_CONFIRM,
    ],
    meta: {
      title: "Pixely Careers | ATS Resume, LinkedIn & Portfolio Websites",
      description: "ATS resumes, LinkedIn profiles and portfolio websites, written for US job postings. Recruiters skim hundreds of resumes. We build the one they stop at.",
    },
  },
  pk: {
    key: "pk",
    path: "/pk",
    hreflang: "en-PK",
    code: "PK",
    region: "Pakistan",
    areaServed: "Pakistan",
    currency: "PKR",
    word: "CV",
    phoneCode: "+92",
    approved: true,
    prices: { "ats-career": 2999, "international-pro": 4999, executive: 7500 },
    compareAt: { "ats-career": 3999, "international-pro": 5999, executive: 9999 },
    showCompareAt: true,
    sameDay: { "ats-career": 500, "international-pro": 500, executive: 700 },
    pricingResults: {
      "ats-career": "A CV that passes ATS and gets you your first interviews.",
      "international-pro": "Get shortlisted for Gulf and international roles.",
      executive: "A leadership profile that wins senior level interviews.",
    },
    internationalFor: "For professionals applying abroad.",
    ...NAUKRI,
    formatsIntro: "Formats for Pakistani employers and overseas applications.",
    faq: [
      { q: "Can you make my CV for Gulf or overseas jobs?", a: "Yes. We build CVs for the UAE, Saudi Arabia, Qatar, the UK and Europe, as well as for Pakistani employers." },
      { q: "How do I pay?", a: "After you place your order request, we confirm the details on WhatsApp and share payment options: [CONFIRM: JazzCash, Easypaisa, bank transfer]." },
      { q: "Can I share my details in Urdu?", a: "Yes. You can send your details on WhatsApp in Urdu or English. Your final CV is in professional English." },
    ],
    meta: {
      title: "ATS CV Writing Service in Pakistan | Pixely Careers",
      description: "ATS-optimized CVs, cover letters and LinkedIn profiles for jobs in Pakistan and abroad. From PKR 2,999. First draft in 2 days. Order on WhatsApp.",
      ogDescription: "ATS-optimized CVs for jobs in Pakistan and abroad. From PKR 2,999.",
    },
  },
  ae: {
    key: "ae",
    path: "/ae",
    hreflang: "en-AE",
    code: "AE",
    region: "UAE",
    areaServed: "United Arab Emirates",
    currency: "AED",
    word: "CV",
    phoneCode: "+971",
    approved: false,
    prices: { "ats-career": 299, "international-pro": 499, executive: 849 },
    compareAt: { "ats-career": 369, "international-pro": 599, executive: 999 },
    showCompareAt: true,
    sameDay: { "ats-career": 60, "international-pro": 60, executive: 80 },
    pricingResults: {
      "ats-career": "A CV that passes ATS and gets UAE recruiters calling.",
      "international-pro": "Get shortlisted for top roles in Dubai, Abu Dhabi and the Gulf.",
      executive: "A leadership profile that wins senior roles in the UAE.",
    },
    internationalFor: "For professionals targeting Gulf roles.",
    ...NAUKRI,
    formatsIntro: "Formats for UAE employers and Gulf applications.",
    faq: [
      { q: "Do you know the UAE job market?", a: "Yes. We format for what UAE recruiters expect and optimize your Indeed and Naukrigulf profiles." },
      WHICH_FORMAT,
      PAY_CONFIRM,
    ],
    meta: {
      title: "CV Writing Service in UAE | Pixely Careers",
      description: "CVs for UAE roles, LinkedIn profiles and portfolio websites. Applying in the UAE? We build the CV recruiters stop at, with clear prices shown in AED.",
    },
  },
  sa: {
    key: "sa",
    path: "/sa",
    hreflang: "en-SA",
    code: "SA",
    region: "Saudi Arabia",
    areaServed: "Saudi Arabia",
    currency: "SAR",
    word: "CV",
    phoneCode: "+966",
    approved: false,
    prices: { "ats-career": 299, "international-pro": 499, executive: 849 },
    compareAt: { "ats-career": 369, "international-pro": 599, executive: 999 },
    showCompareAt: true,
    sameDay: { "ats-career": 60, "international-pro": 60, executive: 80 },
    pricingResults: {
      "ats-career": "A CV that passes ATS and gets you interviews in Saudi Arabia.",
      "international-pro": "Get shortlisted for roles in Riyadh, Jeddah and across the Gulf.",
      executive: "A leadership profile that wins senior roles in Saudi Arabia.",
    },
    internationalFor: "For professionals targeting Gulf roles.",
    ...NAUKRI,
    formatsIntro: "Formats for Saudi employers and Gulf applications.",
    faq: [
      { q: "Do you know the Saudi job market?", a: "Yes. We format for what Saudi recruiters expect and optimize your Indeed and Naukrigulf profiles." },
      WHICH_FORMAT,
      PAY_CONFIRM,
    ],
    meta: {
      title: "CV Writing Service in Saudi Arabia | Pixely Careers",
      description: "CVs for Saudi roles, LinkedIn profiles and portfolio websites. Applying in Saudi Arabia? We build the CV recruiters stop at, with prices shown in SAR.",
    },
  },
  uk: {
    key: "uk",
    path: "/uk",
    hreflang: "en-GB",
    code: "UK",
    region: "United Kingdom",
    areaServed: "United Kingdom",
    currency: "GBP",
    symbol: "£",
    word: "CV",
    phoneCode: "+44",
    approved: false,
    prices: { "ats-career": 69, "international-pro": 119, executive: 199 },
    compareAt: { "ats-career": 85, "international-pro": 145, executive: 239 },
    showCompareAt: true,
    sameDay: { "ats-career": 15, "international-pro": 15, executive: 20 },
    pricingResults: {
      "ats-career": "A CV that passes ATS and gets you your first UK interviews.",
      "international-pro": "Get shortlisted for competitive UK and European roles.",
      executive: "A leadership CV that wins senior level interviews.",
    },
    internationalFor: "For professionals targeting UK and European roles.",
    ...INDEED,
    formatsIntro: "Formats for UK employers and European applications.",
    faq: [
      { q: "Do you write UK-style CVs?", a: "Yes. UK structure, UK spelling, and Europass if you’re applying in the EU." },
      WHICH_FORMAT,
      PAY_CONFIRM,
    ],
    meta: {
      title: "Professional CV Writing Service UK | Pixely Careers",
      description: "UK CVs, LinkedIn profiles and portfolio websites. Applying in the UK? We build the CV recruiters stop at, with UK structure, spelling and prices in GBP.",
    },
  },
};

export const isMarketKey = (v: unknown): v is MarketKey => typeof v === "string" && (MARKET_KEYS as readonly string[]).includes(v);

/** $99, £69, or AED 299, PKR 2,999. */
export function formatPrice(m: Market, n: number) {
  const value = n.toLocaleString("en-US");
  return m.symbol ? `${m.symbol}${value}` : `${m.currency} ${value}`;
}

/** Pricing uses the customer-facing rupee label; other market copy is unchanged. */
export function formatPricingPrice(m: Market, n: number) {
  return m.key === "pk" ? `Rs ${n.toLocaleString("en-US")}` : formatPrice(m, n);
}

/** US pages say resume. Europass CV is a format name, so it stays. */
export function localize(m: Market, text: string) {
  if (m.word !== "resume") return text;
  return text
    .replace(/(?<!Europass )\bCVs\b/g, "resumes")
    .replace(/(?<!Europass )\bCV\b/g, "resume");
}

/** For names and titles: ATS Resume, Free Resume Review. */
export const localizeTitle = (m: Market, text: string) => localize(m, text).replace(/\bresume(s?)\b/g, "Resume$1");

export const homeHref = (m: Market, hash = "") => (hash ? `${m.path === "/" ? "/" : m.path}${hash}` : m.path);
export const orderHref = (m: Market, id?: PackageId) => `/order?${id ? `package=${id}&` : ""}market=${m.key}`;

const BASE_PACKAGES = [
  {
    id: "ats-career" as const,
    tier: "Starter",
    name: "ATS Career",
    forLine: "Your first strong application, locally or abroad.",
    deliveryDays: "2 days",
    value: [
      { n: "30", label: "days support" },
      { n: "3", label: "revisions" },
      { n: "2", label: "days delivery" },
    ],
    lead: "",
    items: ["ATS CV written for your target role", "Tailored cover letter", "LinkedIn content rewrite", "Keywords matched to your job ads", "PDF and editable Word files"],
    button: "Choose ATS Career",
  },
  {
    id: "international-pro" as const,
    tier: "International",
    name: "International Career Pro",
    forLine: "For professionals applying abroad or to competitive roles.",
    deliveryDays: "2 days",
    value: [
      { n: "3", label: "months support" },
      { n: "3", label: "revisions" },
      { n: "2", label: "days delivery" },
    ],
    lead: "Everything in ATS Career, plus:",
    items: ["International ATS CV for your target country", "Country specific cover letter", "Full LinkedIn makeover", "Indeed profile setup", "Professional bio statement", "Digital contact card"],
    button: "Choose International Pro",
  },
  {
    id: "executive" as const,
    tier: "Executive",
    name: "Executive Career Branding",
    forLine: "For managers, directors and senior leaders.",
    deliveryDays: "3 days",
    value: [
      { n: "6", label: "months support" },
      { n: "4", label: "revisions" },
      { n: "3", label: "days priority" },
    ],
    lead: "Everything in International Pro, plus:",
    items: ["Premium executive CV", "One page visual CV", "Executive cover letter and bio", "LinkedIn makeover with 10 ready posts", "Interview preparation guide", "Priority handling"],
    button: "Choose Executive",
  },
];

/** The three packages as a given market sees them. */
export function getPackages(m: Market) {
  return BASE_PACKAGES.map((p) => ({
    ...p,
    forLine: p.forLine,
    items: [...p.items],
    price: m.prices[p.id],
    compareAt: m.compareAt[p.id],
    compareAtLabel: formatPricingPrice(m, m.compareAt[p.id]),
    showCompareAt: m.showCompareAt,
    sameDay: m.sameDay[p.id],
    priceLabel: formatPricingPrice(m, m.prices[p.id]),
    sameDayLabel: `+${formatPricingPrice(m, m.sameDay[p.id])}`,
  }));
}

const Y = "✓";
const N = "·";
/** Comparison table. Values are from the approved pricing preview. */
export function getComparison(m: Market): [string, string, string, string][] {
  const rows: [string, string, string, string][] = [
    ["ATS CV", "Standard", "International", "Premium executive"],
    ["One page visual CV", N, N, Y],
    ["Cover letter", "Tailored", "Country specific", "Executive"],
    ["LinkedIn", "Content rewrite", "Full makeover", "Makeover and 10 posts"],
    ["Indeed profile", N, Y, Y],
    ["Bio statement", N, Y, "Executive"],
    ["Digital contact card", N, Y, "Premium"],
    ["Interview guide", N, N, Y],
    ["Revisions", "3", "3", "4"],
    ["WhatsApp support", "30 days", "3 months", "6 months"],
    ["Delivery", "2 days", "2 days", "3 days, priority"],
    ["Same day delivery", `+${formatPricingPrice(m, m.sameDay["ats-career"])}`, `+${formatPricingPrice(m, m.sameDay["international-pro"])}`, `+${formatPricingPrice(m, m.sameDay.executive)}`],
  ];
  return rows;
}

const SHARED_FAQ = [
  { q: "What exactly do I get?", a: "Everything listed in your package, delivered as PDF and editable Word files." },
  { q: "How long does it take?", a: "Your first draft arrives in 2 days (3 days for Executive). Same-day delivery is available." },
  { q: "Are revisions included?", a: "Yes. 3 revisions on ATS Career and International Pro, 4 on Executive." },
  {
    q: "Do you guarantee a job or interview?",
    a: "No, and nobody honestly can. We make your application professional, ATS-optimized and right for your market. We don’t offer job placement or visa services.",
  },
];
const PAY = { q: "How do I pay?", a: "Place your order request here. We confirm the details on WhatsApp and share payment options." };

/** Market questions first, then the shared ones. Seven at most. */
export const getHomeFaq = (m: Market) => [...m.faq, ...SHARED_FAQ.map((i) => ({ q: localize(m, i.q), a: localize(m, i.a) }))].slice(0, 7);
// CONFIRM payment methods per market with the owner. Do not expose confirmation notes.
export const getPricingFaq = (_m: Market) => [
  { q: "What exactly do I get?", a: "Your documents as PDF and editable Word files, written for your target role and country. Each package lists exactly what's included above." },
  { q: "How long does it take?", a: "Your first draft arrives in 2 days (3 days for Executive). Same day delivery is available for a small fee." },
  { q: "Are revisions included?", a: "Yes. ATS Career and International Pro include 3 rounds, and Executive includes 4. We adjust until it reflects you properly." },
  { q: "How do I pay?", a: "Place your order online. We confirm your details on WhatsApp and share payment options there." },
  { q: "Which package should I choose?", a: "Applying locally for the first time: ATS Career. Applying abroad or for competitive roles: International Pro. Senior or leadership roles: Executive." },
  { q: "Do you guarantee a job or interview?", a: "No one honestly can. We guarantee a clear, ATS ready CV written for your target role. Interviews depend on the market and your applications." },
  { q: "Can I upgrade later?", a: "Yes. Pay the difference and we'll add the extra items to your order." },
];

/** The label on a market's share image. Prices only once they are approved. */
export const ogLabel = (m: Market) => (m.approved ? `From ${formatPrice(m, m.prices["ats-career"])}` : m.region);
