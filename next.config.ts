import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Blog posts merged into newer guides.
  async redirects() {
    return [
      { source: "/offer", destination: "/pk#offer", statusCode: 301 },
      { source: "/blog/what-is-an-ats-cv", destination: "/blog/ats-friendly-resume-checklist", permanent: true },
      { source: "/blog/one-column-vs-two-column-cv", destination: "/blog/resume-format-2026", permanent: true },
      { source: "/blog/cv-summary-examples", destination: "/blog/linkedin-about-section-examples", permanent: true },
      { source: "/blog/cv-vs-resume-us-uk-gulf", destination: "/blog/resume-format-2026", permanent: true },
    ];
  },
  devIndicators: false,
  allowedDevOrigins: process.env.REPLIT_DEV_DOMAIN
    ? [process.env.REPLIT_DEV_DOMAIN]
    : undefined,
  images: { imageSizes: [160, 240, 320, 480], qualities: [75, 90, 95] }, // CVs on phones are about half the screen wide
};

export default nextConfig;
