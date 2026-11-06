import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: { imageSizes: [160, 240, 320, 480] }, // CVs on phones are about half the screen wide
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
