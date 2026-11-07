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
        alt=""
        width={image.width}
        height={image.height}
        sizes="(min-width: 1024px) 30vw, 58vw"
        loading="lazy"
        className="cv-image"
        onError={() => {
          if (src !== fallback.src) setSrc(fallback.src);
        }}
      />
    </div>
  );
}
