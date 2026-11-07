import { MARKET_KEYS, type MarketKey } from "@/config/markets";

export type CvFormat = { src: string; width: number; height: number };
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
  "us": [
    {
      "src": "/formats/us/1.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/us/2.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/us/3.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/us/4.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/us/5.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/us/6.webp",
      "width": 900,
      "height": 1273
    },
    {
      "src": "/formats/us/7.webp",
      "width": 900,
      "height": 1273
    }
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
  us: SAMPLE_LABELS.slice(0, FORMATS.us.length),
  pk: SAMPLE_LABELS.slice(0, FORMATS.pk.length),
  ae: SAMPLE_LABELS.slice(0, FORMATS.ae.length),
  sa: SAMPLE_LABELS.slice(0, FORMATS.sa.length),
  uk: SAMPLE_LABELS.slice(0, FORMATS.uk.length),
};
