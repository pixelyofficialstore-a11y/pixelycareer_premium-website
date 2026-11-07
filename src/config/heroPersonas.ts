import type { MarketKey } from "@/config/markets";

export type CvPicture = { src: string; width: number; height: number };

export type HeroPersona = {
  sample: {
    name: string;
    initials: string;
    role: string;
    domain: string;
  };
  heroCopy: { line1: string; line2: string; sub: [string, string] };
  chips: [string, string, string];
  images: {
    /** On top of the hero's pile: a different person, because a pile holds many applicants. */
    heroBad: CvPicture;
    /** The CV that rises out of the pile, and the right CV in the Problem section. */
    good: CvPicture;
    /** The left CV in the Problem section. */
    bad: CvPicture;
    /** The hero's CV spins between this and `good`. */
    heroFlip: CvPicture;
  };
};

const pic = (market: MarketKey, name: string): CvPicture => ({ src: `/cv/${market}/${name}.webp`, width: 1131, height: 1600 });

export const HERO_PERSONAS: Record<MarketKey, HeroPersona> = {
  us: {
    sample: { name: "James Carter", initials: "JC", role: "Project Manager | Logistics | Agile", domain: "jamescarter.com" },
    heroCopy: { line1: "Stand out", line2: "from the stack.", sub: ["Recruiters skim hundreds of resumes.", "We build the one they stop at."] },
    chips: ["ATS Friendly", "US Resume Format", "Keyword Matched"],
    images: {
      heroBad: pic("us", "hero-bad"),
      heroFlip: pic("us", "hero-good"),
      good: pic("us", "good"),
      bad: pic("us", "bad"),
    },
  },
  pk: {
    sample: { name: "Usman Khan", initials: "UK", role: "Project Manager | Logistics | Agile", domain: "usmankhan.com" },
    heroCopy: { line1: "Stand out", line2: "from the stack.", sub: ["Applying in Pakistan or abroad?", "We build the CV recruiters stop at."] },
    chips: ["ATS Optimized", "Gulf & UK Formats", "PDF + Word"],
    images: {
      heroBad: pic("pk", "hero-bad"),
      heroFlip: pic("pk", "hero-good"),
      good: pic("pk", "good"),
      bad: pic("pk", "bad"),
    },
  },
  ae: {
    sample: { name: "Hamza Al Sayed", initials: "HS", role: "Project Manager | Logistics | Agile", domain: "hamzaalsayed.com" },
    heroCopy: { line1: "Stand out", line2: "in the UAE.", sub: ["Dubai recruiters see hundreds of CVs.", "We build the one they stop at."] },
    chips: ["ATS Optimized", "Visa Status Included", "UAE Recruiter Format"],
    images: {
      heroBad: pic("ae", "hero-bad"),
      heroFlip: pic("ae", "hero-good"),
      good: pic("ae", "good"),
      bad: pic("ae", "bad"),
    },
  },
  sa: {
    sample: { name: "Faisal Al Harbi", initials: "FH", role: "Project Manager | Logistics | Agile", domain: "faisalalharbi.com" },
    heroCopy: { line1: "Stand out", line2: "in Saudi Arabia.", sub: ["Riyadh, Jeddah, Dammam.", "We build the CV recruiters stop at."] },
    chips: ["ATS Optimized", "Saudi Market Format", "Naukrigulf Ready"],
    images: {
      heroBad: pic("sa", "hero-bad"),
      good: pic("sa", "good"),
      bad: pic("sa", "bad"),
      heroFlip: pic("sa", "hero-good"),
    },
  },
  uk: {
    sample: { name: "Oliver Bennett", initials: "OB", role: "Project Manager | Logistics | Agile", domain: "oliverbennett.com" },
    heroCopy: { line1: "Stand out", line2: "from the stack.", sub: ["UK recruiters skim fast.", "We build the CV they stop at."] },
    chips: ["ATS Friendly", "UK Spelling & Format", "Europass Available"],
    images: {
      heroBad: pic("uk", "hero-bad"),
      heroFlip: pic("uk", "hero-good"),
      good: pic("uk", "good"),
      bad: pic("uk", "bad"),
    },
  },
};
