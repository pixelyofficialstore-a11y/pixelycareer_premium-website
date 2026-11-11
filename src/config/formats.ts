import { MARKET_KEYS, type MarketKey } from "@/config/markets";

export type CvFormat = { src: string; width: number; height: number; label?: FormatLabel; quality?: number; sizes?: string };
export type FormatLabel = { name: string; chip: string };

const SAMPLE_LABELS: FormatLabel[] = [
  { name: "Classic ATS", chip: "No photo" },
  { name: "Modern ATS", chip: "Single column" },
  { name: "Modern ATS", chip: "Color accent" },
  { name: "With photo", chip: "International format" },
  { name: "Executive", chip: "Gulf ready" },
  { name: "Designed CV", chip: "With photo" },
  { name: "Europass", chip: "EU standard" },
];

/** Each market's sample formats, in the order shown. Images are in public/formats/{market}/. */
export const FORMATS: Record<MarketKey, CvFormat[]> = {
  // US: A4 PNG exports in public/samples/us, captions with each. The cover letter slide waits for us-format-cover-letter.png.
  "us": [
    { src: "/samples/us/us-format-1.png", width: 3176, height: 4492, quality: 95, sizes: "(max-width: 767px) 100vw, 560px", label: { name: "Visual resume", chip: "One page" } },
    { src: "/samples/us/us-format-2.png", width: 3176, height: 4492, quality: 95, sizes: "(max-width: 767px) 100vw, 560px", label: { name: "Classic ATS", chip: "Project management" } },
    { src: "/samples/us/us-format-3.png", width: 3176, height: 4492, quality: 95, sizes: "(max-width: 767px) 100vw, 560px", label: { name: "Modern ATS", chip: "With photo" } },
    { src: "/samples/us/us-format-4.png", width: 3176, height: 4492, quality: 95, sizes: "(max-width: 767px) 100vw, 560px", label: { name: "Technical resume", chip: "Engineering" } },
    { src: "/samples/us/us-format-5.png", width: 3176, height: 4492, quality: 95, sizes: "(max-width: 767px) 100vw, 560px", label: { name: "Finance resume", chip: "Finance" } },
    { src: "/samples/us/us-format-6.png", width: 3176, height: 4492, quality: 95, sizes: "(max-width: 767px) 100vw, 560px", label: { name: "Clean resume", chip: "Design" } },
    { src: "/samples/us/us-format-7.png", width: 3176, height: 4492, quality: 95, sizes: "(max-width: 767px) 100vw, 560px", label: { name: "Executive format", chip: "Operations" } },
    { src: "/samples/us/us-format-8.png", width: 3176, height: 4492, quality: 95, sizes: "(max-width: 767px) 100vw, 560px", label: { name: "Executive resume", chip: "Leadership" } },
    { src: "/samples/us/us-format-9.png", width: 3176, height: 4492, quality: 95, sizes: "(max-width: 767px) 100vw, 560px", label: { name: "Creative resume", chip: "Design" } },
  ],
  "pk": [
    {
      "src": "/formats/pk/1.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/pk/2.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/pk/3.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/pk/4.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/pk/5.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/pk/6.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/pk/7.webp",
      "width": 900,
      "height": 1273
    }
  ],
  "ae": [
    {
      "src": "/formats/ae/1.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/ae/2.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/ae/3.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/ae/4.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/ae/5.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/ae/6.webp",
      "width": 900,
      "height": 1273
    }
  ],
  "sa": [
    {
      "src": "/formats/sa/1.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/sa/2.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/sa/3.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/sa/4.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/sa/5.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/sa/6.webp",
      "width": 900,
      "height": 1273
    }
  ],
  "uk": [
    {
      "src": "/formats/uk/1.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/uk/2.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/uk/3.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/uk/4.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/uk/5.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/uk/6.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/uk/7.webp",
      "width": 900,
      "height": 1273
    }
  ]
};

/** Short captions for the matching sample image order above. */
export const FORMAT_LABELS: Record<MarketKey, readonly FormatLabel[]> = {
  us: FORMATS.us.map((f, i) => f.label ?? SAMPLE_LABELS[i]),
  pk: SAMPLE_LABELS.slice(0, FORMATS.pk.length),
  ae: SAMPLE_LABELS.slice(0, FORMATS.ae.length),
  sa: SAMPLE_LABELS.slice(0, FORMATS.sa.length),
  uk: SAMPLE_LABELS.slice(0, FORMATS.uk.length),
};
