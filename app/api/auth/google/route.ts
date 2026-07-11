import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase-server";
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

  // Gmail/Classroom are in Google's "Testing" mode, so only registered test
  // users get through the consent screen. Log every attempt so the owner can
  // add the requester to the test-user list and grant beta access. Fail-open:
  // a missing table must never block the OAuth flow itself.
  try {
    await supabaseAdmin()
      .from("google_access_requests")
      .upsert(
        {
          user_id: user.id,
          email: user.email ?? null,
          service,
          requested_at: new Date().toISOString(),
        },
        { onConflict: "user_id,service" },
      );
  } catch {
    // ignore — logging is best-effort
  }

  return NextResponse.redirect(buildAuthUrl(service));
}
