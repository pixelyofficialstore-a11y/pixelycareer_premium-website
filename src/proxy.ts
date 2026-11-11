import { NextResponse, type NextRequest } from "next/server";

const MONTH = 60 * 60 * 24 * 30;
const ATTR = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"] as const;

/**
 * Every page:
 * - pc_geo: the visitor's country from the host's geo header. A visitor in Pakistan with no saved market gets the pk site and its offer.
 * - px_attr: first touch attribution (utm, fbclid, gclid, referrer, landing page) for 30 days, attached to every database insert.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  if (!request.cookies.has("pc_geo")) {
    const country = request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry") ?? request.headers.get("x-country-code");
    if (country) response.cookies.set("pc_geo", country.toUpperCase(), { path: "/", maxAge: MONTH, sameSite: "lax" });
  }
  if (!request.cookies.has("px_attr")) {
    const q = request.nextUrl.searchParams;
    const attr: Record<string, string> = {};
    for (const k of ATTR) { const v = q.get(k); if (v) attr[k] = v.slice(0, 300); }
    const ref = request.headers.get("referer") ?? "";
    if (ref && !ref.startsWith(request.nextUrl.origin)) attr.referrer = ref.slice(0, 500);
    attr.landing_page = `${request.nextUrl.pathname}${request.nextUrl.search}`.slice(0, 500);
    response.cookies.set("px_attr", JSON.stringify(attr), { path: "/", maxAge: MONTH, sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production" });
  }
  return response;
}

export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
