import type { MarketKey } from "@/config/markets";

export type CvPicture = { src: string; width: number; height: number };

export type HeroPersona = {
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
