import { redirect } from "next/navigation";
import { Trophy, Target, Flame, ListChecks } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { supabaseServer } from "@/lib/supabase-server";
import ScoreChart from "@/components/stats/ScoreChart";
import WeakestTopics from "@/components/stats/WeakestTopics";
import WeaknessRadar from "@/components/stats/WeaknessRadar";
import ErrorJournal from "@/components/stats/ErrorJournal";

export default async function StatsPage() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: mocks }, { data: tasks }, { data: subjects }] = await Promise.all([
    sb.from("profiles").select("name").eq("id", user.id).maybeSingle(),
    sb
      .from("mock_tests")
      .select("score, max_score, predicted_grade, taken_at, subject_id")
      .eq("user_id", user.id)
      .order("taken_at", { ascending: true }),
    sb.from("tasks").select("id, status").eq("user_id", user.id),
    sb.from("subjects").select("id, name, predicted_grade").eq("user_id", user.id),
  ]);

  const firstName = (profile?.name || "").split(" ")[0];

  const pcts = (mocks ?? []).map((m) => ({
    date: new Date(m.taken_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    pct: m.max_score ? Math.round((Number(m.score) / Number(m.max_score)) * 100) : 0,
  }));
  const avg = pcts.length
    ? Math.round(pcts.reduce((a, b) => a + b.pct, 0) / pcts.length)
    : 0;
  const predicted = mocks?.length ? mocks[mocks.length - 1].predicted_grade ?? "—" : "—";
  const tasksDone = (tasks ?? []).filter((t) => t.status === "done").length;
  const streak = computeStreak(mocks ?? []);

  const subjectProgress = (subjects ?? []).map((s) => {
    const subjectMocks = (mocks ?? []).filter((m) => m.subject_id === s.id);
    const subjectAvg = subjectMocks.length
      ? Math.round(
          subjectMocks.reduce(
            (a, b) => a + (b.max_score ? (Number(b.score) / Number(b.max_score)) * 100 : 0),
            0,
          ) / subjectMocks.length,
        )
      : 0;
    return { name: s.name, pct: subjectAvg };
  });

  return (
    <AppLayout title="Stats">
      <h2 className="text-2xl font-semibold mb-6">
        {firstName ? `${firstName}'s progress` : "Your progress"}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={<Trophy className="w-4 h-4" />} label="Avg mock score" value={`${avg}%`} />
        <Stat icon={<Target className="w-4 h-4" />} label="Predicted grade" value={predicted} />
        <Stat icon={<Flame className="w-4 h-4" />} label="Study streak" value={`${streak}d`} />
        <Stat icon={<ListChecks className="w-4 h-4" />} label="Tasks completed" value={String(tasksDone)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <ScoreChart data={pcts} />
        <WeaknessRadar data={subjectProgress} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <WeakestTopics />
        <ErrorJournal />
      </div>

      <div className="rounded-xl border border-grayline p-5 mt-4">
        <div className="font-semibold mb-3">Subject progress</div>
        {subjectProgress.length === 0 && (
          <div className="text-sm text-graymute">Add subjects to track progress.</div>
        )}
        <div className="space-y-3">
          {subjectProgress.map((s) => (
            <div key={s.name}>
              <div className="flex justify-between text-sm">
                <span>{s.name}</span>
                <span className="text-graymute">{s.pct}%</span>
              </div>
              <div className="h-1.5 bg-graylite rounded mt-1">
                <div className="h-full bg-ink rounded" style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-grayline p-5">
      <div className="text-graytext">{icon}</div>
      <div className="text-3xl font-semibold mt-3">{value}</div>
      <div className="text-sm text-graymute mt-1">{label}</div>
    </div>
  );
}

function computeStreak(mocks: { taken_at: string }[]): number {
  if (!mocks.length) return 0;
  const days = new Set(
    mocks.map((m) => new Date(m.taken_at).toISOString().slice(0, 10)),
  );
  let streak = 0;
  const d = new Date();
  while (days.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
