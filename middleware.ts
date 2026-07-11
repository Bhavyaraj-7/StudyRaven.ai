import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

/**
 * Supabase's Next.js integration requires the session to be refreshed on
 * every request that touches auth state — getUser() validates the token
 * and, if it's expired, refreshes it and re-writes the cookie. Skipping
 * this (as a prior version of this file did, to save the network call)
 * breaks correctness: server components can't refresh a stale token
 * themselves, so they bounce to /login while middleware still sees the
 * old cookie and bounces back to /dashboard — an infinite redirect loop.
 * The matcher below keeps this call off the public landing page and
 * static assets so it only runs where it's actually needed.
 */
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          res = NextResponse.next({ request: { headers: req.headers } });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: "", ...options });
          res = NextResponse.next({ request: { headers: req.headers } });
          res.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const authed = Boolean(user);

  if (AUTH_PAGES.includes(path)) {
    if (authed) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return res;
  }

  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return res;
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
