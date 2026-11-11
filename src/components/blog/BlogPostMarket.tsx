"use client";
import { useEffect } from "react";
import { setPostMarket } from "@/lib/blog-market";

/** Tells the shared market hook which market this post is written for. */
export default function BlogPostMarket({ market }: { market?: string }) {
  useEffect(() => {
    setPostMarket(market ?? null);
    return () => setPostMarket(null);
  }, [market]);
  return null;
}
