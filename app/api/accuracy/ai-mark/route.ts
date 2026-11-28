import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { staffUser } from "@/lib/accuracy/auth";
import { loadReviewRows } from "@/lib/accuracy/load";
import { markQuestion } from "@/lib/marking/mark-question";

export const maxDuration = 60;

// Admin only: AI-marks answers on a paper that don't have an AI mark yet.
// A small batch per call keeps inside Vercel's 60s limit; the response
// says how many remain, so the admin page calls again until 0.
const BATCH = 9;
const PARALLEL = 3;

const Body = z.object({ paper_id: z.string().uuid() });

export async function POST(req: Request) {
  const me = await staffUser("admin");
  if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a paper." }, { status: 400 });

  const rows = (await loadReviewRows(parsed.data.paper_id)).filter((r) => !r.marks.some((m) => m.markerType === "ai"));
  const batch = rows.slice(0, BATCH);
  let marked = 0;
  const failed: string[] = [];

  for (let i = 0; i < batch.length; i += PARALLEL) {
    await Promise.all(
      batch.slice(i, i + PARALLEL).map(async (r) => {
        try {
          const m = await markQuestion({
            questionText: r.questionText,
            maxMarks: r.maxMarks,
            markPoints: r.markPoints,
            answer: r.answerText,
          });
          const { error } = await supabaseAdmin().from("accuracy_marks").insert({
            answer_id: r.answerId,
            marker_type: "ai",
            model: m.model,
            marks_awarded: m.marks,
            points_awarded: m.pointsAwarded,
          });
          if (error && error.code !== "23505") throw new Error(error.message);
          marked++;
        } catch (e) {
          console.error("[accuracy:ai-mark]", r.answerId, e instanceof Error ? e.message : e);
          failed.push(r.answerId);
        }
      }),
    );
  }
  return NextResponse.json({ marked, failed: failed.length, remaining: rows.length - marked });
}
