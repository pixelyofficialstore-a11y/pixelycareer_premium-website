"use client";

import { useState } from "react";
import Image from "next/image";
import type { CvPicture } from "@/config/heroPersonas";

export default function CtaCvImage({ image, fallback }: { image: CvPicture; fallback: CvPicture }) {
  const [src, setSrc] = useState(image.src);

  return (
    <div className="cv-sheet">
      <Image
        src={src}
        alt={image.alt ?? ""}
        width={image.width}
        height={image.height}
        sizes={image.sizes ?? "(min-width: 1024px) 760px, 640px"}
        quality={image.quality}
        loading="lazy"
        className="cv-image"
        onError={() => {
          if (src !== fallback.src) setSrc(fallback.src);
        }}
      />
    </div>
  );
}
