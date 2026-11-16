import { NextResponse, type NextRequest } from "next/server";

const MONTH = 60 * 60 * 24 * 30;
const ATTR = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "campaign_id", "adset_id", "ad_id", "campaign_name", "adset_name", "ad_name"] as const;

/**
 * Every page:
 * - Pakistan only, on the root URLs: old /pk, /uk, /ae, /sa, /us and ?market= links get a 301 (no geo, no market cookie).
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
  // Pakistan is the only market, on the root URLs. Old /pk, other market and ?market=pk links: 301 with their parameters.
  {
    const u = request.nextUrl;
    const p = u.pathname.replace(/\/+$/, "") || "/";
    let to: string | null = null;
    if (p === "/pk" || /^\/(uk|ae|sa|us)$/.test(p)) to = "/";
    else if (p === "/pk/start" || p === "/pk/cv" || p === "/cv") to = "/";
    else if (p === "/pk/checkout" || p === "/order") to = "/checkout";
    else if (p.startsWith("/pk/")) to = p.slice(3);
    else if (/^\/(uk|ae|sa|us)\/pricing$/.test(p)) to = "/pricing";
    if (to || u.searchParams.has("market") || u.searchParams.has("m")) {
      if (!to && (u.searchParams.has("market") || u.searchParams.has("m")) && (p === "/" || p === "/pricing" || p === "/services" || p.startsWith("/services/") || p === "/order/success")) to = p;
      if (to) {
        const url = u.clone();
        url.pathname = to;
        url.searchParams.delete("market");
        url.searchParams.delete("m");
        return NextResponse.redirect(url, 301);
      }
    }
  }
  const response = NextResponse.next();
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
  // px_vid: the anonymous visitor id (external_id), set on the first page view so every event carries it. Readable by the Pixel script.
  if (!request.cookies.has("px_vid")) response.cookies.set("px_vid", crypto.randomUUID(), { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
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
