import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendEmail } from "@/lib/resend";

export const runtime = "nodejs";

interface WebhookPayload {
  event: string;
  payload?: {
    subscription?: {
      entity?: {
        id: string;
        status: string;
        current_end: number | null;
      };
    };
    payment?: {
      entity?: {
        id: string;
        email?: string;
        error_description?: string;
      };
    };
  };
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: WebhookPayload;
  try {
    event = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const now = new Date().toISOString();

  // Recovery email — payment.failed doesn't carry a subscription entity,
  // so it's handled before the subscription-only guard below. Best-effort
  // match by email since Razorpay Checkout always collects one at payment
  // time; if a profile can't be matched, skip rather than guess.
  if (event.event === "payment.failed") {
    const payment = event.payload?.payment?.entity;
    if (payment?.email) {
      const { data: profile } = await admin
        .from("profiles")
        .select("id")
        .eq("email", payment.email)
        .maybeSingle();
      if (profile) {
        await sendEmail({
          to: payment.email,
          subject: "Your StudyRaven Pro payment didn't go through",
          title: "Payment didn't complete",
          body: `
            <p>Your payment for StudyRaven Pro couldn't be completed${payment.error_description ? ` (${payment.error_description})` : ""} — this is usually a temporary issue with your bank or UPI app, not something wrong on your end.</p>
            <p>No money was taken. You can try again anytime.</p>
            <p style="margin-top:16px"><a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="display:inline-block;background:#0A0A0A;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Try again</a></p>
          `,
        }).catch((e) => console.error("payment-failed email failed:", e));
      }
    }
    return NextResponse.json({ ok: true });
  }

  const sub = event.payload?.subscription?.entity;
  if (!sub?.id) return NextResponse.json({ ok: true }); // event we don't care about
  const periodEnd = sub.current_end
    ? new Date(sub.current_end * 1000).toISOString()
    : null;

  switch (event.event) {
    case "subscription.activated":
    case "subscription.charged":
    case "subscription.resumed": {
      await admin
        .from("subscriptions")
        .update({
          plan: "pro",
          status: "active",
          ...(periodEnd ? { current_period_end: periodEnd } : {}),
          updated_at: now,
        })
        .eq("razorpay_id", sub.id);
      break;
    }
    case "subscription.cancelled": {
      await admin
        .from("subscriptions")
        .update({ status: "cancelled", updated_at: now })
        .eq("razorpay_id", sub.id);
      break;
    }
    case "subscription.completed":
    case "subscription.expired":
    case "subscription.halted": {
      await admin
        .from("subscriptions")
        .update({ status: "expired", updated_at: now })
        .eq("razorpay_id", sub.id);
      break;
    }
    default:
      break; // ignore other events
  }

  return NextResponse.json({ ok: true });
}
