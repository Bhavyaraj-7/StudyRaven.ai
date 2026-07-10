import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  GraduationCap,
  AlarmClock,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { supabaseServer } from "@/lib/supabase-server";
import { daysUntil, greeting } from "@/lib/utils";
import WeekPlan from "@/components/dashboard/WeekPlan";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { google?: string; imported?: string };
}) {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: subjects }, { data: tasks }] = await Promise.all([
    sb.from("profiles").select("name, grade, gmail_connected, classroom_connected").eq("id", user.id).maybeSingle(),
    sb.from("subjects").select("id, name, exam_date").eq("user_id", user.id),
    sb
      .from("tasks")
      .select("id, title, due_date")
      .eq("user_id", user.id)
      .neq("status", "done")
      .order("due_date", { ascending: true })
      .limit(3),
  ]);

  const firstName = (profile?.name || "there").split(" ")[0];
  const upcomingTask = tasks?.[0];
  const upcomingDays = upcomingTask ? daysUntil(upcomingTask.due_date) : null;

  const nextExam = (subjects ?? [])
    .filter((s) => s.exam_date)
    .sort((a, b) => (a.exam_date! > b.exam_date! ? 1 : -1))[0];
  const examDays = nextExam ? daysUntil(nextExam.exam_date) : null;

  const googleNotice = notice(searchParams?.google, searchParams?.imported);

  return (
    <AppLayout title="Home">
      <h1 className="text-h2">
        {greeting()}, {firstName}. How&apos;s it going?
      </h1>

      {googleNotice && (
        <div className="mt-4 rounded-lg border border-grayline bg-graylite/60 px-4 py-3 text-sm text-graytext">
          {googleNotice}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Card
          icon={<Mail className="w-5 h-5" />}
          title="Connect Gmail"
          sub={
            profile?.gmail_connected
              ? "Connected — deadlines auto-import"
              : "Auto-import deadlines"
          }
          href={profile?.gmail_connected ? undefined : "/api/auth/google?service=gmail"}
          cta={profile?.gmail_connected ? undefined : "Connect"}
          done={!!profile?.gmail_connected}
        />
        <Card
          icon={<GraduationCap className="w-5 h-5" />}
          title="Connect Classroom"
          sub={
            profile?.classroom_connected
              ? "Connected — assignments synced"
              : "Sync assignments"
          }
          href={profile?.classroom_connected ? undefined : "/api/auth/google?service=classroom"}
          cta={profile?.classroom_connected ? undefined : "Connect"}
          done={!!profile?.classroom_connected}
        />
        <Card
          icon={<AlarmClock className="w-5 h-5" />}
          title="Upcoming deadline"
          sub={
            upcomingTask
              ? `${upcomingTask.title} · ${upcomingDays ?? "—"} days`
              : "Nothing due"
          }
        />
        <Card
          icon={<CalendarDays className="w-5 h-5" />}
          title="Next exam"
          sub={
            nextExam
              ? `${nextExam.name} · ${examDays ?? "—"} days`
              : "Add exam dates in settings"
          }
        />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Your subjects</h2>
        <div className="flex flex-wrap gap-2">
          {(subjects ?? []).length === 0 && (
            <Link
              href="/subjects"
              className="text-sm text-graytext underline"
            >
              Add your subjects →
            </Link>
          )}
          {(subjects ?? []).map((s) => (
            <Link
              key={s.id}
              href="/subjects"
              className="rounded-full border border-grayline px-3 py-1.5 text-sm bg-paper hover:border-graytext"
            >
              {s.name}
            </Link>
          ))}
          {(subjects ?? []).length > 0 && (
            <Link
              href="/subjects"
              className="rounded-full border border-dashed border-grayline px-3 py-1.5 text-sm text-graytext hover:border-graytext hover:text-ink"
            >
              + Manage
            </Link>
          )}
        </div>
      </section>

      <WeekPlan />
    </AppLayout>
  );
}

function notice(google?: string, imported?: string): string | null {
  if (!google) return null;
  if (google === "missing_keys")
    return "Google connection isn't configured yet — GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET need to be added to the server first.";
  if (google === "denied")
    return "Google connection was cancelled. You can try again anytime.";
  if (google.startsWith("connected_")) {
    const svc = google.replace("connected_", "") === "gmail" ? "Gmail" : "Classroom";
    const n = Number(imported ?? 0);
    return `${svc} connected${n ? ` — imported ${n} task${n === 1 ? "" : "s"} into your list` : ""}.`;
  }
  if (google === "error")
    return "Something went wrong connecting Google. Please try again.";
  return null;
}

function Card({
  icon,
  title,
  sub,
  href,
  cta,
  done,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  href?: string;
  cta?: string;
  done?: boolean;
}) {
  const inner = (
    <div className="rounded-xl border border-grayline bg-paper p-5 hover:border-graytext transition h-full">
      <div className="flex items-center justify-between">
        <div className="text-graytext">{icon}</div>
        {done && <CheckCircle2 className="w-5 h-5 text-green-600" />}
      </div>
      <div className="mt-4 font-semibold">{title}</div>
      <div className="text-sm text-graymute mt-1">{sub}</div>
      {cta && (
        <div className="mt-3 text-sm font-medium underline">{cta}</div>
      )}
    </div>
  );
  if (!href) return inner;
  // API routes need a full navigation, not client-side routing.
  return href.startsWith("/api/") ? (
    <a href={href}>{inner}</a>
  ) : (
    <Link href={href}>{inner}</Link>
  );
}
