import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { buildAuthUrl, googleConfigured, type GoogleService } from "@/lib/google";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const service = url.searchParams.get("service") as GoogleService | null;

  if (service !== "gmail" && service !== "classroom") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!googleConfigured()) {
    // Keys not in .env.local yet — send the user back with a visible notice.
    return NextResponse.redirect(
      new URL("/dashboard?google=missing_keys", req.url),
    );
  }

  return NextResponse.redirect(buildAuthUrl(service));
}
