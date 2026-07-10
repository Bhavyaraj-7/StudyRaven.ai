import crypto from "crypto";

const API_BASE = "https://api.razorpay.com/v1";

export function razorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_MONTHLY_PLAN_ID &&
      process.env.RAZORPAY_YEARLY_PLAN_ID,
  );
}

export async function rzp<T = unknown>(
  path: string,
  init?: { method?: string; body?: Record<string, unknown> },
): Promise<T> {
  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");

  const res = await fetch(`${API_BASE}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });

  const data = (await res.json()) as T & { error?: { description?: string } };
  if (!res.ok) {
    throw new Error(data.error?.description ?? `Razorpay error ${res.status}`);
  }
  return data;
}

/** Checkout success signature: HMAC-SHA256(payment_id|subscription_id, key_secret). */
export function verifyCheckoutSignature(
  paymentId: string,
  subscriptionId: string,
  signature: string,
): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${paymentId}|${subscriptionId}`)
    .digest("hex");
  return timingSafeEqualHex(expected, signature);
}

/** Webhook signature: HMAC-SHA256(raw body, webhook_secret). */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqualHex(expected, signature);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length || ba.length === 0) return false;
  return crypto.timingSafeEqual(ba, bb);
}
