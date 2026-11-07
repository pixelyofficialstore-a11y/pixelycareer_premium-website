import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";
import Header from "@/components/ui/Header";
import Intro from "@/components/ui/Intro";
import Footer from "@/components/sections/Footer";
import Analytics from "@/components/ui/Analytics";
import AnnouncementBar from "@/components/ui/AnnouncementBar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

// Page-specific tags (canonical, Open Graph, Twitter) live in each page, so inner pages never point at the homepage.
export const metadata: Metadata = {
  metadataBase: new URL("https://pixelycareers.com"),
  title: { default: "Pixely Careers", template: "%s | Pixely Careers" },
  description: "Career documentation and personal branding for professionals worldwide.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#010C28" };

// [CONFIRM] the Facebook page URL, then add it to sameAs. No rating or review markup until real, verifiable reviews exist.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://pixelycareers.com/#org",
      name: "Pixely Careers",
      url: "https://pixelycareers.com",
      logo: "https://pixelycareers.com/brand/logo.png",
      sameAs: ["https://www.instagram.com/pixelycareers.pk"],
      contactPoint: { "@type": "ContactPoint", telephone: "+92-370-6404900", contactType: "customer service", availableLanguage: ["English", "Urdu"] },
    },
    {
      "@type": "WebSite",
      "@id": "https://pixelycareers.com/#website",
      name: "Pixely Careers",
      url: "https://pixelycareers.com",
      publisher: { "@id": "https://pixelycareers.com/#org" },
      potentialAction: { "@type": "SearchAction", target: "https://pixelycareers.com/blog?q={search_term_string}", "query-input": "required name=search_term_string" },
    },
  ],
};

// The server sends en-US. This sets the market home's language before anything is read.
const SET_LANG = `document.documentElement.lang={"/pk":"en-PK","/ae":"en-AE","/sa":"en-SA","/uk":"en-GB"}[location.pathname]||"en-US";var p=location.pathname;if(p==="/"||p==="/order"||p.indexOf("/order/")===0||p==="/free-cv-review")document.documentElement.setAttribute("data-no-bar","");try{if(sessionStorage.getItem("pixely-bar-closed"))document.documentElement.setAttribute("data-bar-closed","")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={poppins.variable} suppressHydrationWarning>
      <body>
        <Script id="pixely-market-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: SET_LANG }} />
        <script id="pixely-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA).replace(/</g, "\\u003c") }} />
        <Intro />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SmoothScroll />
        <AnnouncementBar />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
