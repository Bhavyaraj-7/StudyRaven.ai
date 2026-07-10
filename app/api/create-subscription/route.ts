import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase-server";
import { razorpayConfigured, rzp } from "@/lib/razorpay";

export const runtime = "nodejs";

interface RzpSubscription {
  id: string;
  status: string;
}

export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!razorpayConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const cycle = body.cycle === "yearly" ? "yearly" : "monthly";
  const planId =
    cycle === "yearly"
      ? process.env.RAZORPAY_YEARLY_PLAN_ID!
      : process.env.RAZORPAY_MONTHLY_PLAN_ID!;

  try {
    const sub = await rzp<RzpSubscription>("/subscriptions", {
      method: "POST",
      body: {
        plan_id: planId,
        total_count: cycle === "yearly" ? 10 : 60,
        customer_notify: 1,
        notes: { user_id: user.id, cycle },
      },
    });

    // Remember which Razorpay subscription belongs to this user so verify
    // and webhook can never be replayed across accounts.
    const admin = supabaseAdmin();
    await admin
      .from("subscriptions")
      .upsert(
        { user_id: user.id, razorpay_id: sub.id, billing_cycle: cycle },
        { onConflict: "user_id" },
      );

    return NextResponse.json({
      subscriptionId: sub.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
