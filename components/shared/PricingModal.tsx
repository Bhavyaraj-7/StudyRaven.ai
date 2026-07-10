"use client";

import { X, Check, Loader2, PartyPopper } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function loadCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PricingModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!open) return null;

  const price = cycle === "monthly" ? "₹299" : "₹2,499";
  const sub = cycle === "monthly" ? "/month" : "/year";

  async function upgrade() {
    setPaying(true);
    setError(null);
    try {
      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cycle }),
      });
      const data = await res.json();
      if (res.status === 503) {
        throw new Error("Payments aren't live yet — Razorpay keys are being set up.");
      }
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout.");

      const loaded = await loadCheckoutScript();
      if (!loaded || !window.Razorpay) {
        throw new Error("Could not load Razorpay checkout. Check your connection.");
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "StudyRaven Pro",
        description: cycle === "yearly" ? "Yearly plan" : "Monthly plan",
        theme: { color: "#0A0A0A" },
        modal: { ondismiss: () => setPaying(false) },
        handler: async (response: RazorpayResponse) => {
          try {
            const v = await fetch("/api/verify-subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const vd = await v.json();
            if (!v.ok) throw new Error(vd.error ?? "Verification failed.");
            setDone(true);
            // Full reload so every useProfile() in the app picks up Pro.
            setTimeout(() => {
              window.location.href = "/college?upgraded=1";
            }, 1600);
          } catch (e) {
            setError((e as Error).message);
            setPaying(false);
          }
        },
      });
      rzp.open();
    } catch (e) {
      setError((e as Error).message);
      setPaying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
      <div className="bg-paper rounded-2xl border border-grayline max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-graymute hover:text-ink"
        >
          <X className="w-5 h-5" />
        </button>

        {done ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-12 text-center"
          >
            <PartyPopper className="w-12 h-12 mx-auto" />
            <h2 className="text-2xl font-semibold mt-4">You&apos;re Pro now</h2>
            <p className="text-graytext mt-2">
              Everything is unlocked. Taking you to your college guide...
            </p>
          </motion.div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold">StudyRaven Pro</h2>
            <p className="text-graytext mt-1">Unlock every feature.</p>

            <div className="mt-6 flex items-center gap-2 bg-graylite rounded-lg p-1">
              <button
                onClick={() => setCycle("monthly")}
                className={`flex-1 py-2 rounded-md text-sm font-medium ${
                  cycle === "monthly" ? "bg-paper shadow-sm" : "text-graytext"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setCycle("yearly")}
                className={`flex-1 py-2 rounded-md text-sm font-medium relative ${
                  cycle === "yearly" ? "bg-paper shadow-sm" : "text-graytext"
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-ink text-paper text-[10px] px-1.5 py-0.5 rounded">
                  -30%
                </span>
              </button>
            </div>

            <div className="mt-6">
              <div className="text-4xl font-semibold">
                {price}
                <span className="text-base text-graymute font-normal">{sub}</span>
              </div>
            </div>

            <ul className="mt-6 space-y-2">
              {[
                "Score predictor on mocks",
                "Audio overview (podcast style)",
                "College guidance + live opportunity search",
                "Weekly college newsletter",
                "AI-generated practice papers + mark schemes",
                "Unlimited generations",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4" /> {f}
                </li>
              ))}
            </ul>

            {error && (
              <div className="mt-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              onClick={upgrade}
              disabled={paying}
              className="mt-6 w-full bg-ink text-paper rounded-lg py-3 font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {paying && <Loader2 className="w-4 h-4 animate-spin" />}
              {paying ? "Opening checkout..." : `Upgrade — ${price}${sub}`}
            </button>
            <p className="text-xs text-graymute text-center mt-2">
              Secure payment via Razorpay. Cancel anytime from settings.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
