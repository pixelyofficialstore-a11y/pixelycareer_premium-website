import type { MarketKey } from "@/config/markets";

export type CvFormat = { src: string; width: number; height: number };

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
