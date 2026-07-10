import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase-server";
import { razorpayConfigured, rzp } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = supabaseAdmin();
  const { data: row } = await admin
    .from("subscriptions")
    .select("razorpay_id, plan, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row || row.plan !== "pro" || row.status !== "active") {
    return NextResponse.json({ error: "no active pro subscription" }, { status: 400 });
  }

  try {
    // Cancel at cycle end — the user keeps Pro until the period they paid for
    // runs out. The webhook flips status to 'cancelled' when Razorpay fires it.
    if (row.razorpay_id && razorpayConfigured()) {
      await rzp(`/subscriptions/${row.razorpay_id}/cancel`, {
        method: "POST",
        body: { cancel_at_cycle_end: 1 },
      });
    } else {
      // No Razorpay record (e.g. manually granted pro) — downgrade directly.
      await admin
        .from("subscriptions")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
