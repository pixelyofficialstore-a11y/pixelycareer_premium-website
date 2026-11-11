import fs from "fs";
import path from "path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

// Fixed paths (no variables), so the build traces only these two files.
const LOGO = () => fs.readFileSync(path.join(process.cwd(), "public", "brand", "logo-dark.svg"));
const FONT = () => fs.readFileSync(path.join(process.cwd(), "node_modules", "@fontsource", "poppins", "files", "poppins-latin-600-normal.woff"));

/** Share image: white, official logo top-left, label in Vivid Blue, thin blue rule, title in Navy. */
export function ogImage(label: string, title: string) {
  const logo = `data:image/svg+xml;base64,${LOGO().toString("base64")}`;
  const font = FONT();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#ffffff", fontFamily: "Poppins" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={238} height={70} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, color: "#0048FF" }}>{label}</div>
          <div style={{ width: 120, height: 3, background: "#0048FF", marginTop: 20, marginBottom: 28 }} />
          <div style={{ fontSize: 64, lineHeight: 1.08, letterSpacing: "-0.02em", color: "#010C28", paddingBottom: 8 }}>{title}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "Poppins", data: font, weight: 600, style: "normal" }] },
  );
}
