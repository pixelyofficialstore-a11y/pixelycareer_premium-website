import { NextResponse, type NextRequest } from "next/server";

const MONTH = 60 * 60 * 24 * 30;
const ATTR = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "campaign_id", "adset_id", "ad_id", "campaign_name", "adset_name", "ad_name"] as const;

/**
 * Every page:
 * - pc_geo: the visitor's country from the host's geo header. A visitor in Pakistan with no saved market gets the pk site and its offer.
 * - px_attr: first touch attribution (utm, fbclid, gclid, referrer, landing page) for 30 days, attached to every database insert.
 */
export function proxy(request: NextRequest) {
  // One canonical domain: www and http go to https://pixelycareers.com with a 308 (API calls are relative and never pass through here).
  const host = request.headers.get("host") ?? "";
  const proto = request.headers.get("x-forwarded-proto");
  if (process.env.NODE_ENV === "production" && (host.startsWith("www.") || (proto === "http" && host.endsWith("pixelycareers.com")))) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = host.replace(/^www./, "");
    url.port = "";
    return NextResponse.redirect(url, 308);
  }
  const response = NextResponse.next();
  if (!request.cookies.has("pc_geo")) {
    const country = request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry") ?? request.headers.get("x-country-code");
    if (country) response.cookies.set("pc_geo", country.toUpperCase(), { path: "/", maxAge: MONTH, sameSite: "lax" });
  }
  // Last touch: every visit that arrives with campaign parameters replaces it (30 days).
  {
    const q = request.nextUrl.searchParams;
    const last: Record<string, string> = {};
    for (const k of ATTR) { const v = q.get(k); if (v) last[k] = v.slice(0, 300); }
    if (Object.keys(last).length) {
      last.landing_page = `${request.nextUrl.pathname}${request.nextUrl.search}`.slice(0, 500);
      last.at = new Date().toISOString();
      response.cookies.set("px_last", JSON.stringify(last), { path: "/", maxAge: MONTH, sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production" });
    }
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
