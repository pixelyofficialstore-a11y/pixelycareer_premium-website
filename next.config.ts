import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: process.env.REPLIT_DEV_DOMAIN
    ? [process.env.REPLIT_DEV_DOMAIN]
    : undefined,
  images: { imageSizes: [160, 240, 320, 480] }, // CVs on phones are about half the screen wide
};

export default nextConfig;
