/**
 * Single source of truth for every market: prices, currency, phone format and local copy.
 * PKR is approved. Approval flags remain available to consumers.
 * CONFIRM: USD, GBP, AED, SAR prices and same day fees with the owner.
 */
export const MARKET_KEYS = ["us", "pk", "ae", "sa", "uk"] as const;
export type MarketKey = (typeof MARKET_KEYS)[number];
export type PackageId = "ats-career" | "international-pro" | "executive";

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
      { q: "Do you write US style resumes?", a: "Yes. One or two pages, no photo, and results first, the way US recruiters expect." },
      { q: "What are the payment methods?", a: "After you order, we send you secure payment options on WhatsApp or email." },
      { q: "Do you work with US time zones?", a: "Yes. We reply on WhatsApp and email throughout your day." },
    ],
    meta: {
      title: "Resume Writing for US Recruiters | Pixely Careers",
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
      { q: "Can you make my CV for Gulf or Europe jobs?", a: "Yes. Gulf, UK, Europass and international formats." },
      { q: "What are the payment methods?", a: "JazzCash, Easypaisa or bank transfer. Upload your payment screenshot with your order." },
      { q: "How do I know my payment was received?", a: "We verify it manually and confirm on WhatsApp, usually within a few minutes." },
    ],
    meta: {
      title: "CV Writing for Global Recruiters | Pixely Careers",
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
      { q: "Should my CV include a photo?", a: "Usually yes in the UAE. We add a professional one, or leave it out if the role requires that." },
      { q: "Do you write Arabic CVs?", a: "Yes. We write Arabic CVs on request, alongside your English CV." },
      { q: "What are the payment methods?", a: "After you order, we send you secure payment options on WhatsApp or email." },
    ],
    meta: {
      title: "CV Writing for UAE Recruiters | Pixely Careers",
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
      { q: "Do you write CVs for Saudi nationals and expats?", a: "Yes. We write for both, matched to the roles you’re targeting." },
      { q: "Do you write Arabic CVs?", a: "Yes. We write Arabic CVs on request, alongside your English CV." },
      { q: "What are the payment methods?", a: "After you order, we send you secure payment options on WhatsApp or email." },
    ],
    meta: {
      title: "CV Writing for Saudi Recruiters | Pixely Careers",
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
      { q: "Do you write in UK English?", a: "Yes. UK spelling, a two page CV and no photo, as UK employers expect." },
      { q: "Do I need a Europass CV?", a: "Only for EU applications. Every package includes one CV in the right format for your country: ATS or Europass. Need both? Add another CV." },
      { q: "What are the payment methods?", a: "After you order, we send you secure payment options on WhatsApp or email." },
    ],
    meta: {
      title: "CV Writing for UK Recruiters | Pixely Careers",
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
    items: ["ATS / Europass CV written for your target role", "Tailored cover letter", "LinkedIn content rewrite", "Keywords matched to your job ads", "PDF and editable Word files"],
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
const X = "✕";
/** Comparison table. Values are from the approved pricing preview. */
export function getComparison(m: Market): [string, string, string, string][] {
  const fee = (id: PackageId) => `+${formatPricingPrice(m, m.sameDay[id])}`;
  const naukri = m.key === "ae" || m.key === "sa" || m.key === "pk";
  const rows: [string, string, string, string][] = [
    [localize(m, "ATS / Europass CV"), "Standard", "International standard", "Premium executive"],
    ["One page visual profile", X, X, Y],
    ["Cover letter", "Tailored", "Country specific", "Executive"],
    ["Bio statement", X, Y, "Executive"],
    ["Keywords for your target job", Y, Y, Y],
    ["PDF & editable Word files", Y, Y, Y],
    ["LinkedIn", "Content optimization", "Complete optimization & makeover", "Makeover & 10 post content pack"],
    ["Indeed profile", X, Y, Y],
    ...(naukri ? [["Naukrigulf profile", X, Y, Y] as [string, string, string, string]] : []),
    ["Digital contact card", X, Y, Y],
    ["Interview preparation guide (PDF)", X, X, Y],
    ["Revisions before delivery", "Unlimited", "Unlimited", "Unlimited"],
    ["Free updates after delivery", "3", "3", "4"],
    ["WhatsApp support", "30 days", "3 months", "6 months"],
    ["Delivery", "2 days", "2 days", "3 days"],
    ["Same day delivery", fee("ats-career"), fee("international-pro"), fee("executive")],
  ];
  return rows;
}

/** Row groups for the table, found by their first row. */
export function getComparisonGroups(rows: [string, string, string, string][]) {
  const at = (label: string) => rows.findIndex((r) => r[0] === label);
  const starts = [["Documents", 0], ["Profiles", at("LinkedIn")], ["Extras", at("Interview preparation guide (PDF)")], ["Service", at("Revisions before delivery")]] as const;
  return starts.map(([name, start], i) => ({ name, start, end: i + 1 < starts.length ? starts[i + 1][1] : rows.length }));
}

const SHARED_FAQ = [
  { q: "How does it work after I order?", a: "We message you on WhatsApp or email, collect a few details, and send your first draft in 2 days." },
  { q: "What if I don’t like the first draft?", a: "We revise it until you’re satisfied. After delivery, you also get free updates during your support period." },
  { q: "How long does it take to get my CV?", a: "First draft in 2 days, 3 days for Executive. Same day delivery is available for a small fee." },
  { q: "Do you guarantee a job or interview?", a: "No one honestly can. We guarantee a CV that passes ATS and is written for your target role." },
  { q: "Can I get a refund?", a: "Yes. If you’re not satisfied with the first draft, request a refund within 7 days and we’ll return your payment." },
];

/** Three market questions first, then the five shared ones. */
export const getHomeFaq = (m: Market) => [...m.faq, ...SHARED_FAQ.map((i) => ({ q: localize(m, i.q), a: localize(m, i.a) }))];
// CONFIRM payment methods per market with the owner. Do not expose confirmation notes.
export const getPricingFaq = (m: Market) => {
  const own = (q: string) => m.faq.find((i) => i.q === q);
  const pay = own("What are the payment methods?");
  const received = own("How do I know my payment was received?");
  const list = [
    pay ?? { q: "What are the payment methods?", a: "After you order, we send you secure payment options on WhatsApp or email." },
    ...(received ? [received] : []),
    { q: "Which package should I choose?", a: "Early career: ATS Career. 3+ years or applying abroad: International Pro. 7+ years or leadership roles: Executive." },
    { q: "What exactly do I get?", a: "One CV for one target role, in the right format for your country: ATS or Europass. Plus your other documents as PDF and editable Word files. Each package lists exactly what's included." },
    { q: "What if I don't like the first draft?", a: "We revise it until you're satisfied. After delivery, you also get free updates during your support period." },
    { q: "How long does it take to get my CV?", a: "First draft in 2 days, 3 days for Executive. Same day delivery is available for a small fee." },
    { q: "Can I upgrade later?", a: "Yes. Pay the difference and we'll add the extra items to your order." },
    { q: "Can I get a refund?", a: "Yes. If you’re not satisfied with the first draft, request a refund within 7 days and we’ll return your payment." },
    { q: "Do you guarantee a job or interview?", a: "No one honestly can. We guarantee a CV that passes ATS and is written for your target role." },
  ];
  return list.map((i) => ({ q: localize(m, i.q), a: localize(m, i.a) }));
};

/** The label on a market's share image. Prices only once they are approved. */
export const ogLabel = (m: Market) => (m.approved ? `From ${formatPrice(m, m.prices["ats-career"])}` : m.region);
