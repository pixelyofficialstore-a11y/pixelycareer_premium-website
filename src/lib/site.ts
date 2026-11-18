export const WHATSAPP_NUMBER = "923706404900";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const CONTACT_EMAIL = "info@pixelycareers.com"; // CONFIRM email
export const LINKEDIN_URL = "https://www.linkedin.com/company/pixelycareers";
export const FACEBOOK_REVIEWS_URL = "https://www.facebook.com/pixelycareers.pk/reviews/";
export const FACEBOOK_URL = "https://www.facebook.com/pixelycareers.pk/";
export const whatsappMessage = (text: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;
/** /offer WhatsApp links. Every wa.me click fires Contact (components/ui/Analytics). */
export const OFFER_WA = whatsappMessage("Hi, I'm interested in a CV. Can you guide me?");
export const FREE_REVIEW_WA = whatsappMessage("Hi, I'd like a free CV review.");

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
