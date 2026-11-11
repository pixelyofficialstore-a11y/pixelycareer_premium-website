import { NextResponse, type NextRequest } from "next/server";

/** Blog pages: remember the visitor's country (from the host's geo header) so blog CTAs can route to their market. */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  if (request.cookies.has("pc_geo")) return response;
  const country = request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry") ?? request.headers.get("x-country-code");
  if (country) response.cookies.set("pc_geo", country.toUpperCase(), { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
  return response;
}

export const config = { matcher: ["/blog", "/blog/:path*"] };
