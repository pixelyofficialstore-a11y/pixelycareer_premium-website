import type { PackageId } from "./markets";

export type ServiceSlug = "ats-cv" | "cover-letter" | "linkedin" | "europass-cv" | "portfolio-website" | "arabic-cv" | "resume-distribution";
export type ServiceIcon = "doc" | "search" | "target" | "chart" | "globe" | "file" | "user" | "link" | "pen" | "star" | "phone" | "shield";
export type ServiceVisualKind = "cv" | "letter" | "profile" | "browser" | "portals";

/**
 * One template for every service page. Copy uses "CV"; localize() turns it into "resume" on US pages.
 * {portals} becomes "Indeed and Naukrigulf", or "Indeed" on US and UK pages.
 */
export type Service = {
  slug: ServiceSlug;
  name: string;
  group: string;
  h1: [string, string];
  sub: string;
  visual: ServiceVisualKind;
  problem: [string, string];
  pills: [string, string, string];
  gets: { icon: ServiceIcon; title: string; line: string }[];
  before: string;
  after: string;
  /** The cheapest package that includes this service. */
  includedIn?: PackageId;
  /** For services sold only as an add-on: the add-on id in config/addons. */
  addon?: string;
  faq: { q: string; a: string }[];
};

export const SERVICES: Service[] = [
  {
    slug: "ats-cv",
    name: "ATS CV",
    group: "Career documents",
    h1: ["ATS CV", "writing."],
    sub: "Single column, keyword matched and written for your role.",
    visual: "cv",
    problem: ["Most CVs look good.", "Few get read."],
    pills: ["Two column templates", "Generic summaries", "Duty lists"],
    gets: [
      { icon: "doc", title: "Single column ATS format", line: "Reads cleanly in hiring software." },
      { icon: "search", title: "Keyword matching", line: "From real job ads for your role." },
      { icon: "target", title: "Targeted summary", line: "Three lines that position you." },
      { icon: "chart", title: "Achievement bullets", line: "Results, not duties." },
      { icon: "globe", title: "Market format", line: "US, UK, Gulf or Pakistan." },
      { icon: "file", title: "PDF and Word files", line: "Ready to send, easy to edit." },
    ],
    before: "Responsible for managing day to day sales operations.",
    after: "Managed daily showroom sales for a team of 6, beating monthly targets 10 months in a row.",
    includedIn: "ats-career",
    faq: [
      { q: "What is an ATS CV?", a: "A CV formatted so hiring software reads it correctly, and written so a recruiter keeps reading." },
      { q: "How long will it be?", a: "Usually 1 to 2 pages, depending on your experience." },
      { q: "Can you rework my existing CV?", a: "Yes. Send it to us and we rebuild it for your target role." },
      { q: "How long does it take?", a: "First draft in 2 days, or 3 for Executive." },
      { q: "What files do I get?", a: "A PDF and an editable Word file." },
    ],
  },
  {
    slug: "cover-letter",
    name: "Cover Letter",
    group: "Career documents",
    h1: ["Cover letters", "that get read."],
    sub: "One page, written for the role, not a template.",
    visual: "letter",
    problem: ["Generic letters", "get skipped."],
    pills: ["Copied templates", "No real proof", "Wrong tone for the country"],
    gets: [
      { icon: "pen", title: "Written for the role", line: "Not a recycled template." },
      { icon: "link", title: "Matches your CV", line: "Same story, same tone." },
      { icon: "star", title: "Strong opening", line: "Gets to the point fast." },
      { icon: "chart", title: "Real proof points", line: "Your results, not adjectives." },
      { icon: "globe", title: "Country appropriate style", line: "Right length and tone." },
      { icon: "file", title: "PDF and Word files", line: "Easy to adapt." },
    ],
    before: "I am writing to apply for the position at your esteemed company.",
    after: "I'm applying for the Senior Accountant role. I've spent five years managing month end close for multi entity businesses.",
    includedIn: "ats-career",
    faq: [
      { q: "Do I really need one?", a: "Many employers still read them, especially for competitive roles." },
      { q: "Can I reuse it?", a: "Yes. We write it so you can adapt it for similar roles." },
      { q: "How long is it?", a: "One page." },
      { q: "Does it match my CV?", a: "Yes. Same story, same tone." },
    ],
  },
  {
    slug: "linkedin",
    name: "LinkedIn Optimization",
    group: "Professional visibility",
    h1: ["LinkedIn", "optimization."],
    sub: "A profile recruiters can find and want to contact.",
    visual: "profile",
    problem: ["Recruiters search LinkedIn.", "Most profiles don't show up."],
    pills: ["Vague headlines", "Empty About sections", "Duties copied from the CV"],
    gets: [
      { icon: "search", title: "Searchable headline", line: "Your target role and key skills." },
      { icon: "user", title: "About section", line: "A short, confident story." },
      { icon: "chart", title: "Experience rewrite", line: "Achievements, not job descriptions." },
      { icon: "target", title: "Skills and keywords", line: "Matched to the roles you want." },
      { icon: "star", title: "Profile banner", line: "A clean professional cover image." },
      { icon: "link", title: "Matches your CV", line: "Same titles, dates and story." },
    ],
    before: "Looking for new opportunities",
    after: "Sales Executive | Consumer Electronics | Client Relationships",
    includedIn: "ats-career",
    faq: [
      { q: "Do you need my login?", a: "No. We send you the finished text and you paste it into your profile." },
      { q: "Will it match my CV?", a: "Yes. Same titles, dates and story." },
      { q: "Do you write posts?", a: "Executive includes a 10 post content pack." },
      { q: "Do you do {portals} profiles too?", a: "Yes, in International Career Pro and Executive." },
      { q: "How long does it take?", a: "It is delivered with your package timeline." },
    ],
  },
  {
    slug: "europass-cv",
    name: "Europass CV",
    group: "Career documents",
    h1: ["Europass CV", "done properly."],
    sub: "The EU standard format, with content that works.",
    visual: "cv",
    problem: ["Europass is a template.", "The content still matters."],
    pills: ["Empty About me", "Duty lists", "Guessed language levels"],
    gets: [
      { icon: "doc", title: "Official Europass structure", line: "Accepted across the EU." },
      { icon: "user", title: "Real professional summary", line: "Not an empty About me." },
      { icon: "chart", title: "Achievement led experience", line: "Results recruiters notice." },
      { icon: "globe", title: "Correct language levels", line: "Set using the CEFR scale." },
      { icon: "target", title: "Skills matched to the role", line: "Relevant, not padded." },
      { icon: "pen", title: "Europass cover letter", line: "Included with every Europass CV." },
    ],
    before: "Worked in the accounts department.",
    after: "Managed accounts payable for 3 business units, cutting late payments by 40%.",
    addon: "europass-pack",
    faq: [
      { q: "When do I need Europass?", a: "When an employer, university or programme asks for it." },
      { q: "Is it the same as an ATS CV?", a: "No. Europass has its own structure. We can make both." },
      { q: "Can you use my existing Europass?", a: "Yes. Send it and we rework the content." },
      { q: "How do I order it?", a: "Add it to any package when you place your order." },
    ],
  },
  {
    slug: "portfolio-website",
    name: "Portfolio Website",
    group: "Digital presence",
    h1: ["Your own", "portfolio website."],
    sub: "One link for your work, story and CV.",
    visual: "browser",
    problem: ["A CV says what you did.", "A portfolio shows it."],
    pills: ["No online presence", "Work scattered across links", "Hard to share"],
    gets: [
      { icon: "star", title: "Personal website design", line: "Built around you." },
      { icon: "phone", title: "Mobile friendly", line: "Looks right on any phone." },
      { icon: "user", title: "Your work, story and contact", line: "In one place." },
      { icon: "link", title: "Linked to your CV and LinkedIn", line: "One consistent brand." },
      { icon: "shield", title: "Free domain and hosting", line: "For the first year." },
      { icon: "globe", title: "Easy to share", line: "One link for every application." },
    ],
    before: "linkedin.com/in/… + a Google Drive folder",
    after: "{domain} · one link with your work, story and CV",
    addon: "portfolio",
    faq: [
      { q: "Do I need my own domain?", a: "It is included. Your domain and hosting are free for the first year." },
      { q: "What do you need from me?", a: "Your CV, examples of your work and a short brief." },
      { q: "Will it work on phones?", a: "Yes. Every portfolio is built to look right on any screen." },
      { q: "How do I order it?", a: "Add it to any package when you place your order." },
    ],
  },
  {
    slug: "arabic-cv",
    name: "Arabic CV",
    group: "Career documents",
    h1: ["Arabic CV", "for Gulf employers."],
    sub: "A professional Arabic version that matches your English CV.",
    visual: "cv",
    problem: ["Machine translation", "reads badly."],
    pills: ["Literal translation", "Wrong job titles", "Mismatched details"],
    gets: [
      { icon: "pen", title: "Professional Arabic translation", line: "Written, not machine translated." },
      { icon: "target", title: "Correct job titles", line: "As Gulf employers use them." },
      { icon: "doc", title: "Right to left layout", line: "Clean and readable." },
      { icon: "link", title: "Matches your English CV", line: "Same facts and dates." },
      { icon: "globe", title: "Gulf conventions", line: "Personal details done right." },
      { icon: "file", title: "PDF and Word files", line: "Ready to send." },
    ],
    before: "مسؤول عن المبيعات · a literal, machine translated job title",
    after: "مدير مبيعات · Sales Manager, as Gulf employers write it",
    addon: "arabic",
    faq: [
      { q: "Who writes the Arabic version?", a: "A professional writer, not a translation tool." },
      { q: "Will it match my English CV?", a: "Yes. Same facts, dates and job titles." },
      { q: "Do Gulf employers need an Arabic CV?", a: "Many accept English, but an Arabic version helps with Arabic speaking employers and government roles." },
      { q: "How do I order it?", a: "Add it to any package when you place your order." },
    ],
  },
  {
    slug: "resume-distribution",
    name: "Job Portal Profiles",
    group: "Professional visibility",
    h1: ["Get found", "on job portals."],
    sub: "Your {portals} profiles, built to match your CV.",
    visual: "portals",
    problem: ["Recruiters search job portals.", "Thin profiles get skipped."],
    pills: ["Half filled profiles", "Wrong job titles", "Old CV uploaded"],
    gets: [
      { icon: "user", title: "Complete profiles", line: "Every section filled in properly." },
      { icon: "target", title: "Searchable job titles", line: "The titles recruiters search for." },
      { icon: "search", title: "Keywords and skills", line: "Matched to the roles you want." },
      { icon: "link", title: "Matches your CV", line: "Same titles, dates and story." },
      { icon: "file", title: "Your new CV uploaded", line: "The right version, every time." },
      { icon: "globe", title: "{portals}", line: "Set up for your market." },
    ],
    before: "Profile 40% complete · CV uploaded years ago",
    after: "Profile 100% complete · new ATS CV · searchable title",
    includedIn: "international-pro",
    faq: [
      { q: "Which job portals do you cover?", a: "{portals}, depending on your market." },
      { q: "Will it match my CV?", a: "Yes. Same titles, dates and story." },
      { q: "Which package includes it?", a: "International Career Pro and Executive. You can also add it to ATS Career." },
      { q: "How long does it take?", a: "It is delivered with your package timeline." },
    ],
  },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
