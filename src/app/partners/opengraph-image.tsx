import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Your agency's CV department. Agency Partnership with Pixely Careers.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const logo = fs.readFileSync(path.join(process.cwd(), "public", "brand", "logo-dark.svg"));
  const font = fs.readFileSync(path.join(process.cwd(), "node_modules", "@fontsource", "poppins", "files", "poppins-latin-600-normal.woff"));
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#F6F8FC", color: "#010C28", fontFamily: "Poppins", padding: 64 }}>
        <div style={{ display: "flex", flexDirection: "column", width: 620 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" width={204} height={60} src={`data:image/svg+xml;base64,${logo.toString("base64")}`} />
          <div style={{ display: "flex", marginTop: 78, fontSize: 20, color: "#0048FF" }}>Agency Partnership</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 22, fontSize: 67, lineHeight: 1.1, letterSpacing: "-0.04em" }}>
            <span>Your agency&apos;s</span>
            <span style={{ color: "#0048FF" }}>CV department.</span>
          </div>
          <span style={{ marginTop: 30, fontSize: 22 }}>Your branding or ours.</span>
        </div>
        <div style={{ position: "absolute", right: 82, top: 138, width: 300, height: 385, display: "flex" }}>
          {[0, 1, 2, 3].map((sheet) => (
            <div key={sheet} style={{ position: "absolute", left: sheet * 10, top: sheet * -10, width: 244, height: 346, display: "flex", flexDirection: "column", padding: 23, border: "1px solid #D8DFEA", borderRadius: 7, background: "#FFFFFF", transform: `rotate(${(sheet - 2) * 6}deg)`, boxShadow: "0 18px 35px rgba(1, 12, 40, 0.14)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ color: "#0048FF", fontSize: 14 }}>CANDIDATE CV</span>
                <div style={{ display: "flex", width: 65, padding: 6, border: "1px dashed #4576FF", borderRadius: 5, color: "#01219C", fontSize: 9 }}>Your agency logo</div>
              </div>
              {["PROFILE", "EXPERIENCE", "EDUCATION"].map((section) => (
                <div key={section} style={{ display: "flex", flexDirection: "column", marginBottom: 20 }}>
                  <span style={{ fontSize: 10, color: "#01219C", marginBottom: 8 }}>{section}</span>
                  {[100, 88, 95, 70].map((width, index) => <div key={index} style={{ height: 4, width: `${width}%`, background: "#E5EAF2", marginBottom: 6, borderRadius: 2 }} />)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Poppins", data: font, weight: 600, style: "normal" }] },
  );
}
