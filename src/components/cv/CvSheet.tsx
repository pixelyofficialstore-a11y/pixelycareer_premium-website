import Image from "next/image";
import type { CvPicture } from "@/config/heroPersonas";

/** One clean CV image. */
export default function CvSheet({ image, eager, priority }: { image: CvPicture; eager?: boolean; priority?: boolean }) {
  return (
    <div className="cv-sheet">
      <Image
        src={image.src}
        alt={image.alt ?? ""}
        width={image.width}
        height={image.height}
        sizes={image.sizes ?? "(min-width: 1024px) 30vw, 58vw"}
        quality={image.quality}
        {...(priority ? { priority: true } : { loading: eager ? "eager" : "lazy", fetchPriority: eager ? "high" : undefined })}
        className="cv-image"
      />
    </div>
  );
}
