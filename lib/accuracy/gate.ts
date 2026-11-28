import { supabaseAdmin } from "@/lib/supabase-server";
import { flag } from "@/lib/flags";

// Predicted-grade gate (master prompt §10A.3): with FLAG_GATE_PREDICTED_GRADES
// on, a subject shows predicted grades only if its latest published accuracy
// run passed the bar. Off (the default) keeps today's behaviour, as the
// founder decided on 23 Nov 2026.

export function subjectKey(subject: string): string {
  return subject.trim().toLowerCase().replace(/\s+/g, " ");
}

export type GateDecision = { allowed: true } | { allowed: false; reason: "not_measured" | "below_bar" };

export async function predictedGradeGate(subject: string): Promise<GateDecision> {
  if (!flag("FLAG_GATE_PREDICTED_GRADES")) return { allowed: true };
  const { data, error } = await supabaseAdmin()
    .from("accuracy_runs")
    .select("passed")
    .eq("subject_key", subjectKey(subject))
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  // Fail closed: if accuracy can't be shown, the prediction isn't shown.
  if (error || !data) return { allowed: false, reason: "not_measured" };
  return data.passed ? { allowed: true } : { allowed: false, reason: "below_bar" };
}

export const GATE_MESSAGE: Record<"not_measured" | "below_bar", string> = {
  not_measured: "Predicted grades for this subject appear once our marking has been checked against teachers.",
  below_bar: "Predicted grades for this subject are paused while we improve marking accuracy.",
};
