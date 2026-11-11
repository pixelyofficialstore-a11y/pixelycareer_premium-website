import { SERVICES, getService } from "@/config/services";
import { OG_SIZE, OG_TYPE, ogImage } from "@/lib/og";

export const alt = "Pixely Careers service";
export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const generateStaticParams = () => SERVICES.map((s) => ({ slug: s.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const s = getService((await params).slug);
  return ogImage(s?.group ?? "Services", s ? s.h1.join(" ") : "Pixely Careers");
}
