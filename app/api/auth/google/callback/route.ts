import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  exchangeCode,
  scanGmail,
  scanClassroom,
  type GoogleService,
  type ImportedTask,
} from "@/lib/google";
import { sendEmail } from "@/lib/resend";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const service = (url.searchParams.get("state") ?? "") as GoogleService;
  const oauthError = url.searchParams.get("error");

  if (oauthError || !code || (service !== "gmail" && service !== "classroom")) {
    return NextResponse.redirect(
      new URL("/dashboard?google=denied", req.url),
    );
  }

  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  try {
    // Check prior state first so the confirmation email only fires the
    // very first time this service is connected, not on every reconnect.
    const { data: before } = await sb
      .from("profiles")
      .select("name, email, gmail_connected, classroom_connected")
      .eq("id", user.id)
      .maybeSingle();
    const wasConnected =
      service === "gmail" ? before?.gmail_connected : before?.classroom_connected;

    const tokens = await exchangeCode(code);

    // Persist connection state (+ refresh token when Google returns one).
    const update: Record<string, unknown> =
      service === "gmail"
        ? { gmail_connected: true }
        : { classroom_connected: true };
    if (tokens.refresh_token) update.google_refresh_token = tokens.refresh_token;
    await sb.from("profiles").update(update).eq("id", user.id);

    // Auto-import tasks from the connected service.
    const found: ImportedTask[] =
      service === "gmail"
        ? await scanGmail(tokens.access_token)
        : await scanClassroom(tokens.access_token);

    if (found.length) {
      // De-dupe against existing task titles so reconnecting doesn't duplicate.
      const { data: existing } = await sb
        .from("tasks")
        .select("title")
        .eq("user_id", user.id);
      const have = new Set((existing ?? []).map((t) => t.title));
      const rows = found
        .filter((t) => !have.has(t.title))
        .map((t) => ({
          user_id: user.id,
          title: t.title,
          due_date: t.due_date,
          status: "pending",
          priority: "medium",
        }));
      if (rows.length) await sb.from("tasks").insert(rows);
    }

    if (!wasConnected && before?.email) {
      const serviceLabel = service === "gmail" ? "Gmail" : "Google Classroom";
      // Best-effort — a failed confirmation email shouldn't block the redirect,
      // but we still await it so it isn't killed mid-flight when the request ends.
      try {
        await sendEmail({
          to: before.email,
          subject: `${serviceLabel} connected to StudyRaven`,
          title: `${serviceLabel} is connected`,
          body: `<p>Hey ${before.name?.split(" ")[0] || "there"},</p>
<p>${serviceLabel} is now connected to your StudyRaven account.${
            found.length
              ? ` We found ${found.length} upcoming deadline${found.length === 1 ? "" : "s"} and added ${found.length === 1 ? "it" : "them"} to your task list.`
              : " We'll keep scanning for new deadlines automatically."
          }</p>
<p>You can disconnect anytime from Settings.</p>`,
        });
      } catch (e) {
        console.error("gmail-connected email failed:", e);
      }
    }

    return NextResponse.redirect(
      new URL(`/dashboard?google=connected_${service}&imported=${found.length}`, req.url),
    );
  } catch (e) {
    return NextResponse.redirect(
      new URL(
        `/dashboard?google=error&message=${encodeURIComponent((e as Error).message.slice(0, 120))}`,
        req.url,
      ),
    );
  }
}
