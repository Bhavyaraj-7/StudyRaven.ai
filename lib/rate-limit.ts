import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { isProUser } from "@/lib/subscription";
import type { Usage } from "@/lib/ai/client";

// Daily AI limits per student (master prompt §10.7.6), counted in IST days
// by public.consume_api_quota (migration 20261124_api_usage.sql).
// Starting numbers, for the founder to tune. Studio and practice papers keep
// their existing shared 5-a-day free quota (lib/subscription.ts).
export type Bucket = "marking" | "drill" | "planner" | "insight" | "tutor" | "college";

export const DAILY_LIMITS: Record<Bucket, { free: number; pro: number; label: string }> = {
  marking: { free: 10, pro: 60, label: "mock marking" },
  drill: { free: 20, pro: 100, label: "daily drills" },
  planner: { free: 10, pro: 40, label: "study plans and guides" },
  insight: { free: 20, pro: 60, label: "study insights" },
  tutor: { free: 0, pro: 150, label: "AI tutor messages" }, // Pro-only route
  college: { free: 0, pro: 60, label: "college guide requests" }, // Pro-only routes
};

export interface Quota {
  ok: boolean;
  used: number;
  limit: number;
  isPro: boolean;
  bucket: Bucket;
  /** false when the migration hasn't been run: requests pass unlimited. */
  enforced: boolean;
}

let warned = false;

export async function consumeQuota(userId: string, bucket: Bucket, knownPro?: boolean): Promise<Quota> {
  const isPro = knownPro ?? (await isProUser(userId));
  const limit = DAILY_LIMITS[bucket][isPro ? "pro" : "free"];
  const { data, error } = await supabaseAdmin().rpc("consume_api_quota", {
    p_user: userId,
    p_bucket: bucket,
    p_limit: limit,
  });

  if (error) {
    // Fail open so the product keeps working before the migration runs.
    if (!warned) {
      console.error("[rate-limit] not enforced, run 20261124_api_usage.sql:", error.message);
      warned = true;
    }
    return { ok: true, used: 0, limit, isPro, bucket, enforced: false };
  }

  const row = (Array.isArray(data) ? data[0] : data) as { allowed?: boolean; used?: number } | null;
  return { ok: Boolean(row?.allowed), used: row?.used ?? 0, limit, isPro, bucket, enforced: true };
}

export function quotaResponse(q: Quota) {
  const { label } = DAILY_LIMITS[q.bucket];
  const more = q.isPro ? "" : " Pro raises the limit.";
  return NextResponse.json(
    {
      error: `You've reached today's limit for ${label} (${q.limit}). It resets at midnight IST.${more}`,
      limit_reached: true,
    },
    { status: 429 },
  );
}

/** Adds an AI call's tokens to today's usage row. Never blocks the response. */
export function recordTokens(userId: string, bucket: Bucket, usage: Usage): void {
  if (!usage.promptTokens && !usage.completionTokens) return;
  void Promise.resolve(
    supabaseAdmin().rpc("record_api_tokens", {
      p_user: userId,
      p_bucket: bucket,
      p_prompt: usage.promptTokens,
      p_completion: usage.completionTokens,
    }),
  ).then(({ error }) => {
    if (error && !warned) console.error("[rate-limit] token record failed:", error.message);
  });
}
