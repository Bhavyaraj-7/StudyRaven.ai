import { supabaseAdmin } from "@/lib/supabase-server";

// Admin and reviewer rights come from the staff_roles table (server-only,
// RLS with no policies), never from user_metadata, which users can edit.
export type StaffRole = "admin" | "reviewer";

export async function getStaffRole(userId: string): Promise<StaffRole | null> {
  const { data, error } = await supabaseAdmin()
    .from("staff_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data.role === "admin" || data.role === "reviewer" ? data.role : null;
}

/** Admins can do everything a reviewer can. */
export function hasRole(role: StaffRole | null, needed: StaffRole): boolean {
  return role === "admin" || role === needed;
}
