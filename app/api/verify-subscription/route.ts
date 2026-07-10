import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase-server";
import { razorpayConfigured, verifyCheckoutSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!razorpayConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const paymentId = body?.razorpay_payment_id as string | undefined;
  const subscriptionId = body?.razorpay_subscription_id as string | undefined;
  const signature = body?.razorpay_signature as string | undefined;

  if (!paymentId || !subscriptionId || !signature) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  if (!verifyCheckoutSignature(paymentId, subscriptionId, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // The subscription being claimed must be the one we created for this user.
  const { data: row } = await admin
    .from("subscriptions")
    .select("razorpay_id, billing_cycle")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row || row.razorpay_id !== subscriptionId) {
    return NextResponse.json({ error: "subscription mismatch" }, { status: 400 });
  }

  // Fallback period end; the webhook keeps this accurate on every charge.
  const days = row.billing_cycle === "yearly" ? 366 : 32;
  const periodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await admin
    .from("subscriptions")
    .update({
      plan: "pro",
      status: "active",
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
