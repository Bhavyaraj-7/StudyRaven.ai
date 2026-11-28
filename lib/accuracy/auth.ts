import { supabaseServer } from "@/lib/supabase-server";
import { getStaffRole, hasRole, type StaffRole } from "@/lib/staff";

/** The signed-in user if they hold the role, else null (callers answer 404, so the tools stay hidden). */
export async function staffUser(needed: StaffRole): Promise<{ id: string } | null> {
  const {
    data: { user },
  } = await supabaseServer().auth.getUser();
  if (!user) return null;
  return hasRole(await getStaffRole(user.id), needed) ? { id: user.id } : null;
}
