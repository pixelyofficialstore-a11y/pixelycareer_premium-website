export const WHATSAPP_NUMBER = "923706404900";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const whatsappMessage = (text: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;

export const NAV = [
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "For Agencies", href: "/partners" },
];

export const FOOTER_SERVICES = [
  { label: "ATS CV", href: "/services/ats-cv" },
  { label: "Europass CV", href: "/services/europass-cv" },
  { label: "Cover Letter", href: "/services/cover-letter" },
  { label: "LinkedIn", href: "/services/linkedin" },
  { label: "Portfolio Website", href: "/services/portfolio-website" },
];

export const TARGET_COUNTRIES = ["USA", "UAE", "Saudi Arabia", "Qatar", "UK", "Europe", "Pakistan", "Other"];
