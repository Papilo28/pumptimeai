import { NextRequest, NextResponse } from "next/server";

const LANDING_ORIGIN = process.env.NEXT_PUBLIC_LANDING_URL || "https://pumptimeai.com";

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") || "";

  // Handle CORS preflight for API routes called from the Hostinger landing page
  if (req.method === "OPTIONS" && req.nextUrl.pathname.startsWith("/api/")) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin === LANDING_ORIGIN ? LANDING_ORIGIN : "",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
