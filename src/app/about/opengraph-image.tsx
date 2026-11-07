import { ogImage, OG_SIZE, OG_TYPE } from "@/lib/og";

export const alt = "About Pixely Careers";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogImage("About", "About Pixely Careers");
}
