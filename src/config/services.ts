import type { PackageId } from "./markets";

export type ServiceSlug = "ats-cv" | "europass-cv" | "cover-letter" | "linkedin" | "portfolio-website";
type Item = { title: string; line: string };

export type Service = {
  slug: ServiceSlug;
  name: string;
  group: "Career Documents" | "Professional Visibility" | "Digital Presence";
  metaTitle: string;
  description: string;
  h1: string;
  line: string;
  visual: "cv" | "letter" | "europass" | "profile" | "browser";
  problem: string;
  mistakes: [string, string, string];
  gets: Item[];
  before: string;
  after: string;
  who: [Item, Item, Item];
  hubIncluded: string;
  packages?: PackageId[];
  packageNotes?: Partial<Record<PackageId, string>>;
  includedNote?: string;
  faq: { q: string; a: string }[];
  related: [ServiceSlug, ServiceSlug];
  ctaTitle: string;
};

const ALL: PackageId[] = ["ats-career", "international-pro", "executive"];

export const SERVICES: Service[] = [
  {
    slug: "ats-cv",
    name: "ATS CV",
    group: "Career Documents",
    metaTitle: "ATS CV Writing Service",
    description: "ATS-friendly CVs written for your target role and market. Single-column format, real keywords and achievement-led bullet points. PDF + Word.",
    h1: "ATS CV writing.",
    line: "A clean, single-column CV written for the job you want.",
    visual: "cv",
    problem: "Most CVs are built to look good, not to be read.",
    mistakes: ["Two-column templates", "Generic summaries", "“Responsible for…” bullets"],
    gets: [
      { title: "Single-column ATS format", line: "Reads cleanly in hiring software." },
      { title: "Keyword matching", line: "Job titles and skills from real postings." },
      { title: "Targeted summary", line: "Three lines that position you for the role." },
      { title: "Achievement bullets", line: "Results, not duties." },
      { title: "Market format", line: "US, UK, Gulf or Pakistan conventions." },
      { title: "PDF + Word files", line: "Ready to send, easy to edit." },
    ],
    before: "Responsible for managing day-to-day sales operations.",
    after: "Managed daily showroom sales for a team of 6, consistently meeting monthly targets.",
    who: [
      { title: "Job seekers", line: "Applying online and hearing nothing back." },
      { title: "Career changers", line: "Repositioning experience for a new field." },
      { title: "Moving abroad", line: "Applying in a new market." },
    ],
    hubIncluded: "Included in all 3 packages",
    packages: ALL,
    faq: [
      { q: "What is an ATS CV?", a: "A CV formatted so hiring software reads it correctly, and written so a recruiter keeps reading." },
      { q: "How long will it be?", a: "Usually 1–2 pages, depending on your experience." },
      { q: "Can you rework my existing CV?", a: "Yes. Send it on WhatsApp and we’ll rebuild it." },
      { q: "How long does it take?", a: "First draft in 2 days (3 for Executive). Same-day is available." },
      { q: "What files do I get?", a: "PDF and editable Word." },
    ],
    related: ["cover-letter", "linkedin"],
    ctaTitle: "Want an ATS CV like this?",
  },
  {
    slug: "cover-letter",
    name: "Cover Letter",
    group: "Career Documents",
    metaTitle: "Cover Letter Writing Service",
    description: "One-page cover letters written for the role, not a template. Tailored opening, real proof points, and the right style for your country.",
    h1: "Cover letters that get read.",
    line: "One page, written for the role. Not a template.",
    visual: "letter",
    problem: "Most cover letters repeat the CV.",
    mistakes: ["“To whom it may concern”", "Copy-paste letters", "Too long"],
    gets: [
      { title: "Tailored opening", line: "Why this role, in the first line." },
      { title: "Two proof points", line: "Achievements that match the job." },
      { title: "Employer fit", line: "Shows you understand what they need." },
      { title: "Clear close", line: "A confident next step." },
      { title: "Country style", line: "US, UK, Gulf or European conventions." },
      { title: "PDF + Word files", line: "Easy to adapt for similar roles." },
    ],
    before: "I am writing to apply for the position of Accountant.",
    after: "I’m applying for the Senior Accountant role. I’ve spent five years managing month-end close for multi-entity businesses.",
    who: [
      { title: "Competitive roles", line: "Where a letter can set you apart." },
      { title: "Career changers", line: "Explaining your move clearly." },
      { title: "International applicants", line: "Matching local expectations." },
    ],
    hubIncluded: "Included in all 3 packages",
    packages: ALL,
    packageNotes: { executive: "Includes an executive cover letter" },
    faq: [
      { q: "Do I really need one?", a: "Many employers still read them, especially for competitive roles." },
      { q: "Can I reuse it?", a: "Yes. We write it so you can adapt it for similar roles." },
      { q: "How long is it?", a: "One page." },
      { q: "Does it match my CV?", a: "Yes. Same story, same tone." },
      { q: "Can I order just a cover letter?", a: "Yes. Ask us on WhatsApp. [CONFIRM standalone price]" },
    ],
    related: ["ats-cv", "linkedin"],
    ctaTitle: "Want a cover letter like this?",
  },
  {
    slug: "linkedin",
    name: "LinkedIn Optimization",
    group: "Professional Visibility",
    metaTitle: "LinkedIn Profile Optimization",
    description: "A LinkedIn profile recruiters can find: searchable headline, About section, achievement-led experience, and skills matched to your target roles.",
    h1: "LinkedIn optimization.",
    line: "A profile recruiters can find, and want to contact.",
    visual: "profile",
    problem: "Recruiters search LinkedIn. Most profiles don’t show up.",
    mistakes: ["Vague headlines", "Empty About sections", "Duties copied from the CV"],
    gets: [
      { title: "Searchable headline", line: "Your target role and key skills." },
      { title: "About section", line: "A short, confident professional story." },
      { title: "Experience rewrite", line: "Achievements, not job descriptions." },
      { title: "Skills and keywords", line: "Matched to the roles you want." },
      { title: "Banner", line: "A professional cover image. [CONFIRM banner included]" },
      { title: "Consistency with your CV", line: "The same titles, dates and story." },
    ],
    before: "Looking for new opportunities",
    after: "Sales Executive | Consumer Electronics | Client Relationships & Target-Driven Retail",
    who: [
      { title: "International applicants", line: "Recruiters abroad check LinkedIn first." },
      { title: "Senior professionals", line: "Visibility for higher-level roles." },
      { title: "Career changers", line: "A profile that points to where you’re going." },
    ],
    hubIncluded: "Included in International Career Pro and Executive. ATS Career includes content optimization",
    packages: ["international-pro", "executive", "ats-career"],
    packageNotes: { "international-pro": "Makeover + content", executive: "Makeover + 10-post content pack", "ats-career": "Content optimization" },
    faq: [
      { q: "Do you need my login?", a: "No. We send you the text and you update your profile. [CONFIRM]" },
      { q: "Will it match my CV?", a: "Yes." },
      { q: "Do you write posts?", a: "Executive includes a 10-post content pack." },
      { q: "Do you do Indeed and Naukrigulf too?", a: "Yes, in International Career Pro and Executive." },
      { q: "How long does it take?", a: "Delivered with your package timeline." },
    ],
    related: ["ats-cv", "portfolio-website"],
    ctaTitle: "Want a LinkedIn profile like this?",
  },
  {
    slug: "europass-cv",
    name: "Europass CV",
    group: "Career Documents",
    metaTitle: "Europass CV Writing",
    description: "Europass CVs written properly: a real summary, achievement-led experience, correct CEFR language levels, and a clean PDF export.",
    h1: "Europass CV.",
    line: "The EU’s standard format, written properly.",
    visual: "europass",
    problem: "Europass is a template. The content still has to work.",
    mistakes: ["Empty “About me”", "Duty lists", "Guessed language levels"],
    gets: [
      { title: "Official Europass structure", line: "The standard sections, in the right order." },
      { title: "A real professional summary", line: "Written for your target role." },
      { title: "Achievement-led experience", line: "Results, not duties." },
      { title: "CEFR language levels set correctly", line: "Your languages, on the right scale." },
      { title: "Skills matched to the role", line: "Taken from real job postings." },
      { title: "Clean PDF export", line: "Ready to upload or send." },
    ],
    before: "Worked in the accounts department.",
    after: "Prepared monthly reconciliations for 12 client accounts and supported the year-end audit.",
    who: [
      { title: "EU job applicants", line: "When an employer asks for Europass." },
      { title: "Students and scholarship applicants", line: "When a university or programme requests it." },
      { title: "Public-sector and institutional roles", line: "Where the format is often expected." },
    ],
    hubIncluded: "Available as an add-on [CONFIRM price]",
    includedNote: "Available as an add-on [CONFIRM price]",
    faq: [
      { q: "When do I need Europass?", a: "When an employer, university or programme asks for it." },
      { q: "Is it the same as an ATS CV?", a: "No. We can make both." },
      { q: "Which language?", a: "English. [CONFIRM other languages]" },
      { q: "Can you use my existing Europass?", a: "Yes. Send it and we’ll rework it." },
      { q: "How long does it take?", a: "[CONFIRM]" },
    ],
    related: ["ats-cv", "cover-letter"],
    ctaTitle: "Want a Europass CV like this?",
  },
  {
    slug: "portfolio-website",
    name: "Portfolio Website",
    group: "Digital Presence",
    metaTitle: "Portfolio Website for Professionals",
    description: "A personal portfolio website with your name on it: your work, story and contact in one link, linked to your CV and LinkedIn.",
    h1: "Your own portfolio website.",
    line: "A professional home online, with your name on it.",
    visual: "browser",
    problem: "A CV says what you did. A portfolio shows it.",
    mistakes: ["No online presence", "Work scattered across links", "Hard to share"],
    gets: [
      { title: "Personal website design", line: "Built around you and your work." },
      { title: "Mobile-friendly", line: "Easy to read on any phone." },
      { title: "Your work, story and contact", line: "Everything in one place." },
      { title: "Linked to your CV and LinkedIn", line: "One consistent professional story." },
      { title: "Domain setup support [CONFIRM]", line: "Help getting it on your own name." },
      { title: "Easy to share", line: "One link for every application." },
    ],
    before: "linkedin.com/in/… + Google Drive folder",
    after: "yourname.com: one link with your work, story and CV",
    who: [
      { title: "Designers and creatives", line: "Show your work, not just list it." },
      { title: "Consultants and freelancers", line: "A credible home for your services." },
      { title: "Senior professionals", line: "A stronger presence when people look you up." },
    ],
    hubIncluded: "Priced separately [CONFIRM price]",
    includedNote: "Priced separately [CONFIRM price]",
    faq: [
      { q: "Do I need a domain?", a: "Recommended. We’ll guide you. [CONFIRM]" },
      { q: "How long does it take?", a: "[CONFIRM]" },
      { q: "Can I update it later?", a: "[CONFIRM]" },
      { q: "What do you need from me?", a: "Your CV, photos of your work, and a short brief." },
      { q: "Does it include hosting?", a: "[CONFIRM]" },
    ],
    related: ["linkedin", "ats-cv"],
    ctaTitle: "Want your own portfolio website?",
  },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
