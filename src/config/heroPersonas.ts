import type { MarketKey } from "@/config/markets";

/** alt, quality and sizes are optional; markets without them keep the defaults. hd: full size A4 export, loaded lazily except the hero's front CV. */
export type CvPicture = { src: string; width: number; height: number; alt?: string; quality?: number; sizes?: string; hd?: boolean };

export type HeroPersona = {
  sample: {
    name: string;
    initials: string;
    role: string;
    domain: string;
  };
  heroCopy: { line1: string; line2: string; sub: [string, string] };
  chips: [string, string, string];
  /** The Before/After list under the comparison: three rows, Before on the left. */
  changes: { from: string; to: string }[];
  /** The area of the Before CV each list row lights up, in % of the CV image. */
  areas: { left: number; top: number; width: number; height: number }[];
  images: {
    /** On top of the hero's pile: a different person, because a pile holds many applicants. */
    heroBad: CvPicture;
    /** The CV that rises out of the pile, and the right CV in the Problem section. */
    good: CvPicture;
    /** The left CV in the Problem section. */
    bad: CvPicture;
    /** The hero's CV spins between this and `good`. */
    heroFlip: CvPicture;
    /** The final CTA on pages other than the homepage, when it differs from `good`. */
    pageGood?: CvPicture;
  };
};

/** Sharp 1600px WebP exports from each market pack: bad (1), good (2), hero-good (3). */
const pic = (market: MarketKey, name: string): CvPicture => ({ src: `/cv/${market}/${name}.webp`, width: 1600, height: 2263, quality: 90, sizes: "(max-width: 768px) 100vw, 640px", hd: true });

export const HERO_PERSONAS: Record<MarketKey, HeroPersona> = {
  us: {
    sample: { name: "James Carter", initials: "JC", role: "Project Manager | Logistics | Agile", domain: "jamescarter.com" },
    heroCopy: { line1: "Stand out", line2: "in the US market.", sub: ["Most resumes get rejected by ATS software.", "Ours are built to pass it and get you shortlisted."] },
    changes: [{ from: "Two columns", to: "Single column" }, { from: "Generic objective", to: "Targeted summary" }, { from: "Duties, not results", to: "Results with numbers" }],
    areas: [{ left: 2.5, top: 12, width: 34.5, height: 86 }, { left: 38, top: 24.5, width: 56.5, height: 13.5 }, { left: 38.5, top: 41, width: 56.5, height: 40.5 }],
    chips: ["ATS Friendly", "US Resume Format", "Keyword Matched"],
    images: {
      heroBad: pic("us", "bad"),
      heroFlip: pic("us", "hero-good"),
      good: pic("us", "good"),
      bad: pic("us", "bad"),
    },
  },
  pk: {
    sample: { name: "Usman Khan", initials: "UK", role: "Project Manager | Logistics | Agile", domain: "usmankhan.com" },
    heroCopy: { line1: "Stand out", line2: "in the global market.", sub: ["Most CVs get rejected by ATS software.", "Ours are built to pass it and get you shortlisted."] },
    changes: [{ from: "Two columns", to: "Single column" }, { from: "CNIC, religion, domicile", to: "Clean contact details" }, { from: "“Good personality” skills", to: "Role keywords" }],
    areas: [{ left: 0.5, top: 17, width: 30, height: 82.5 }, { left: 2.5, top: 42, width: 27.5, height: 25.5 }, { left: 2.5, top: 68, width: 27.5, height: 18.5 }],
    chips: ["ATS Friendly", "Gulf and UK Formats", "PDF and Word"],
    images: {
      heroBad: pic("pk", "bad"),
      heroFlip: pic("pk", "hero-good"),
      good: pic("pk", "good"),
      bad: pic("pk", "bad"),
    },
  },
  ae: {
    sample: { name: "Hamza Al Sayed", initials: "HS", role: "Project Manager | Logistics | Agile", domain: "hamzaalsayed.com" },
    heroCopy: { line1: "Stand out", line2: "in the UAE market.", sub: ["Most CVs get rejected by ATS software.", "Ours are built to pass it and get you shortlisted."] },
    changes: [{ from: "Two columns", to: "Single column" }, { from: "Passport and religion details", to: "Only what employers need" }, { from: "Skill bars and hobbies", to: "Role keywords" }],
    areas: [{ left: 0.5, top: 17, width: 30, height: 82.5 }, { left: 2.5, top: 39.5, width: 27.5, height: 18.5 }, { left: 2.5, top: 58, width: 27.5, height: 23.5 }],
    chips: ["ATS Friendly", "UAE CV Format", "Visa Status Included"],
    images: {
      heroBad: pic("ae", "bad"),
      heroFlip: pic("ae", "hero-good"),
      good: pic("ae", "good"),
      bad: pic("ae", "bad"),
    },
  },
  sa: {
    sample: { name: "Faisal Al Harbi", initials: "FH", role: "Project Manager | Logistics | Agile", domain: "faisalalharbi.com" },
    heroCopy: { line1: "Stand out", line2: "in the KSA market.", sub: ["Most CVs get rejected by ATS software.", "Ours are built to pass it and get you shortlisted."] },
    changes: [{ from: "Two columns", to: "Single column" }, { from: "Religion and father’s name", to: "Only what employers need" }, { from: "Duties, not results", to: "Results in SAR and numbers" }],
    areas: [{ left: 0.5, top: 17, width: 30, height: 82.5 }, { left: 2.5, top: 40.5, width: 27.5, height: 20.5 }, { left: 37, top: 38.5, width: 58, height: 31.5 }],
    chips: ["ATS Friendly", "KSA CV Format", "Keyword Matched"],
    images: {
      heroBad: pic("sa", "bad"),
      good: pic("sa", "good"),
      bad: pic("sa", "bad"),
      heroFlip: pic("sa", "hero-good"),
    },
  },
  uk: {
    sample: { name: "Oliver Bennett", initials: "OB", role: "Project Manager | Logistics | Agile", domain: "oliverbennett.com" },
    heroCopy: { line1: "Stand out", line2: "in the UK market.", sub: ["Most CVs get rejected by ATS software.", "Ours are built to pass it and get you shortlisted."] },
    changes: [{ from: "Two columns", to: "Single column" }, { from: "Duties, not results", to: "Results with numbers" }, { from: "“Hardworking” clichés", to: "Tailored personal statement" }],
    areas: [{ left: 0.5, top: 1, width: 37.5, height: 98 }, { left: 41, top: 46.5, width: 52, height: 51.5 }, { left: 3, top: 42.5, width: 31, height: 25 }],
    chips: ["ATS Friendly", "UK CV Format", "Europass Available"],
    images: {
      heroBad: pic("uk", "bad"),
      heroFlip: pic("uk", "hero-good"),
      good: pic("uk", "good"),
      bad: pic("uk", "bad"),
    },
  },
};
