import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { verifyWebhookSignature } from "@/lib/razorpay";

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

  const sub = event.payload?.subscription?.entity;
  if (!sub?.id) return NextResponse.json({ ok: true }); // event we don't care about

  const admin = supabaseAdmin();
  const now = new Date().toISOString();
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
