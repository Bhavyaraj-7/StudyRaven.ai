import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { staffUser } from "@/lib/accuracy/auth";
import { loadReviewRows } from "@/lib/accuracy/load";
import { pickNext, toReviewItem } from "@/lib/accuracy/review";

// Blind teacher marking (§10A.3). GET returns the next answer with NO marks
// of any kind; POST records this teacher's mark. Hidden (404) unless the
// user is a reviewer or admin in staff_roles.

const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });

export async function GET() {
  const me = await staffUser("reviewer");
  if (!me) return notFound();
  const rows = await loadReviewRows();
  const next = pickNext(rows, me.id);
  const mine = rows.filter((r) => r.marks.some((m) => m.markerType === "teacher" && m.markerId === me.id)).length;
  return NextResponse.json({ item: next ? toReviewItem(next) : null, markedByYou: mine });
}

const Body = z.object({
  answer_id: z.string().uuid(),
  points_awarded: z.array(z.string().max(20)).max(30),
  marks_awarded: z.number().min(0).max(100),
});

export async function POST(req: Request) {
  const me = await staffUser("reviewer");
  if (!me) return notFound();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "That mark couldn't be read. Try again." }, { status: 400 });
  const { answer_id, points_awarded, marks_awarded } = parsed.data;

  const admin = supabaseAdmin();
  const { data: answer } = await admin
    .from("accuracy_answers")
    .select("id, script:accuracy_scripts!inner(consent_confirmed), question:accuracy_questions!inner(max_marks, mark_points)")
    .eq("id", answer_id)
    .maybeSingle();
  const a = answer as unknown as {
    script: { consent_confirmed: boolean };
    question: { max_marks: number; mark_points: { id: string }[] };
  } | null;
  if (!a || !a.script.consent_confirmed) return notFound();
  if (marks_awarded > a.question.max_marks) {
    return NextResponse.json({ error: `This question is out of ${a.question.max_marks}.` }, { status: 400 });
  }
  const known = new Set((a.question.mark_points ?? []).map((p) => p.id));
  if (points_awarded.some((id) => !known.has(id))) {
    return NextResponse.json({ error: "Unknown marking point." }, { status: 400 });
  }

  const { error } = await admin.from("accuracy_marks").insert({
    answer_id,
    marker_type: "teacher",
    marker_id: me.id,
    marks_awarded,
    points_awarded,
  });
  if (error?.code === "23505") return NextResponse.json({ error: "You've already marked this answer." }, { status: 409 });
  if (error) return NextResponse.json({ error: "Couldn't save that mark. Try again." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
