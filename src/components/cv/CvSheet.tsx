import Image from "next/image";
import type { CvPicture } from "@/config/heroPersonas";

/** One clean CV image. */
export default function CvSheet({ image, eager }: { image: CvPicture; eager?: boolean }) {
  return (
    <div className="cv-sheet">
      <Image src={image.src} alt="" width={image.width} height={image.height} sizes="(min-width: 1024px) 30vw, 58vw" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} className="cv-image" />
    </div>
  );
}
