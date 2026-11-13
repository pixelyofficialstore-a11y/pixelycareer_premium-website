import fs from "fs";
import path from "path";
import { ImageResponse } from "next/og";
import { BUNDLE } from "@/config/offers";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

// Fixed paths (no variables), so the build traces only these two files.
const LOGO = () => fs.readFileSync(path.join(process.cwd(), "public", "brand", "logo-dark.svg"));
const FONT = () => fs.readFileSync(path.join(process.cwd(), "node_modules", "@fontsource", "poppins", "files", "poppins-latin-600-normal.woff"));

const NAVY = "#010C28";
const BLUE = "#0048FF";
const GREY = "#6B7280";
const ORANGE = "#F05A1A";

/** A small code drawn CV: header, rule, sections of lines. Same on every card. */
function CvMock() {
  const line = (w: number, c = "#E3E8F2", h = 8) => <div style={{ width: w, height: h, borderRadius: 4, background: c, marginTop: 10 }} />;
  const section = (title: number, rows: number[]) => (
    <div style={{ display: "flex", flexDirection: "column", marginTop: 22 }}>
      {line(title, BLUE, 9)}
      {rows.map((w, i) => <div key={i} style={{ display: "flex" }}>{line(w)}</div>)}
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 300, height: 400, padding: 30, borderRadius: 18, background: "#fff", border: "1px solid #E6E9F0", boxShadow: "0 30px 60px -20px rgba(1,12,40,0.25)" }}>
      <div style={{ width: 170, height: 16, borderRadius: 5, background: NAVY }} />
      {line(120, "#C9D3E4")}
      <div style={{ width: "100%", height: 2, background: BLUE, marginTop: 18 }} />
      {section(90, [236, 220, 180])}
      {section(110, [236, 200, 228, 150])}
      {section(70, [210, 160])}
    </div>
  );
}

function Frame({ children, label, labelColor = BLUE }: { children: React.ReactNode; label: string; labelColor?: string }) {
  const logo = `data:image/svg+xml;base64,${LOGO().toString("base64")}`;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff", fontFamily: "Poppins", padding: "64px 72px" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={204} height={60} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: "0.08em", color: labelColor }}>{label.toUpperCase()}</div>
          <div style={{ width: 96, height: 3, background: BLUE, marginTop: 18, marginBottom: 26 }} />
          {children}
        </div>
        <div style={{ fontSize: 22, color: GREY }}>pixelycareers.com</div>
      </div>
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-end" }}><CvMock /></div>
    </div>
  );
}

const fonts = () => [{ name: "Poppins", data: FONT(), weight: 600 as const, style: "normal" as const }];

/** Share image: label in Vivid Blue, navy title (2 lines max), CV mockup on the right. */
export function ogImage(label: string, title: string) {
  const t = title.length > 60 ? `${title.slice(0, 58).trim()}…` : title;
  return new ImageResponse(
    (
      <Frame label={label}>
        <div style={{ display: "flex", fontSize: t.length > 34 ? 52 : 62, lineHeight: 1.12, letterSpacing: "-0.02em", color: NAVY, maxHeight: 140, overflow: "hidden" }}>{t}</div>
      </Frame>
    ),
    { ...OG_SIZE, fonts: fonts() },
  );
}

/** The 11.11 version: orange pill, bundle title, struck price, offer price, slots. */
export function ogOfferImage() {
  const rs = (n: number) => `Rs ${n.toLocaleString("en-US")}`;
  return new ImageResponse(
    (
      <Frame label="Pakistan">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignSelf: "flex-start", padding: "6px 18px", borderRadius: 999, background: ORANGE, color: "#fff", fontSize: 22, letterSpacing: "0.06em", marginBottom: 18 }}>11.11 SALE</div>
          <div style={{ display: "flex", fontSize: 46, lineHeight: 1.15, letterSpacing: "-0.02em", color: NAVY }}>{BUNDLE.headline}</div>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 22 }}>
            <div style={{ fontSize: 28, color: GREY, textDecoration: "line-through", marginRight: 18 }}>{rs(BUNDLE.compareAt)}</div>
            <div style={{ fontSize: 44, color: NAVY, marginRight: 22 }}>{rs(BUNDLE.price - 1000)}</div>
            <div style={{ fontSize: 22, color: ORANGE }}>{`Only ${BUNDLE.totalSlots} slots`}</div>
          </div>
        </div>
      </Frame>
    ),
    { ...OG_SIZE, fonts: fonts() },
  );
}
