import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

/**
 * Fast local check: does a Supabase auth cookie exist?
 * We deliberately do NOT call supabase.auth.getUser() here — that's a
 * network round-trip to Supabase on every navigation and made the whole
 * app feel slow. Real security lives in RLS + server-side checks in API
 * routes; this gate is purely UX routing. Stale cookies are handled
 * client-side (supabase-js auto-refreshes or signs out).
 */
function hasAuthCookie(req: NextRequest): boolean {
  return req.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token") && c.value);
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const authed = hasAuthCookie(req);

  if (AUTH_PAGES.includes(path)) {
    // Don't bounce users away from /reset-password — they need that page
    // to complete the recovery flow (it's not in AUTH_PAGES for that reason).
    if (authed) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Everything else in the matcher is a protected app page.
  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/subjects/:path*",
    "/studio/:path*",
    "/papers/:path*",
    "/marks/:path*",
    "/mocks/:path*",
    "/flashcards/:path*",
    "/focus/:path*",
    "/stats/:path*",
    "/college/:path*",
    "/schedule/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/forgot-password",
  ],
};
