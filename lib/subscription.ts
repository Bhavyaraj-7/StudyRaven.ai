import { supabaseAdmin } from "@/lib/supabase-server";

/** Server-side pro check — never trust the client for gated features. */
export async function isProUser(userId: string): Promise<boolean> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.plan === "pro" && data?.status === "active";
}

export const FREE_DAILY_LIMIT = 5;

/**
 * Returns how many generations the user has used today.
 * Backed by generation_usage (RLS with no policies — service role only,
 * so users cannot tamper with their own counters).
 */
export async function getUsageToday(userId: string): Promise<number> {
  const admin = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await admin
    .from("generation_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("day", today)
    .maybeSingle();
  return data?.count ?? 0;
}

/**
 * Enforce the free-tier daily limit. Pro users always pass.
 * Returns { ok, used, remaining }. Increments the counter when allowed.
 */
export async function checkAndCountGeneration(
  userId: string,
): Promise<{ ok: boolean; used: number; remaining: number; isPro: boolean }> {
  const pro = await isProUser(userId);
  if (pro) return { ok: true, used: 0, remaining: -1, isPro: true };

  const admin = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const used = await getUsageToday(userId);

  if (used >= FREE_DAILY_LIMIT) {
    return { ok: false, used, remaining: 0, isPro: false };
  }

  const { error } = await admin
    .from("generation_usage")
    .upsert(
      { user_id: userId, day: today, count: used + 1 },
      { onConflict: "user_id,day" },
    );
  // If the usage table is missing (migration not run), fail open so the
  // core product keeps working — limits are a soft protection.
  if (error) return { ok: true, used, remaining: FREE_DAILY_LIMIT - used - 1, isPro: false };

  return { ok: true, used: used + 1, remaining: FREE_DAILY_LIMIT - used - 1, isPro: false };
}
