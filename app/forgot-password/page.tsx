"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const sb = supabaseBrowser();
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: err } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <section className="hidden md:flex flex-col justify-between bg-ink text-paper p-12">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-[19px]"
        >
          <span className="w-[26px] h-[26px] rounded-[7px] bg-paper text-ink inline-flex items-center justify-center font-mono text-[14px]">
            S
          </span>
          StudyRaven<span className="text-graymute">.ai</span>
        </Link>
        <div>
          <h2 className="text-h2">Forgot your password?</h2>
          <p className="mt-4 text-graymute max-w-md">
            We&apos;ll email you a link to set a new one.
          </p>
        </div>
        <div className="text-graymute text-sm">© StudyRaven.ai</div>
      </section>
      <section className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-semibold">Reset your password</h1>
          {!sent && (
            <>
              <p className="mt-2 text-graytext">
                Enter your email and we&apos;ll send a reset link.
              </p>
              <form onSubmit={onSubmit} className="mt-8 space-y-4">
                <label className="block">
                  <span className="text-sm text-graytext">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink"
                  />
                </label>
                {error && (
                  <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-ink text-paper py-3 font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          )}
          {sent && (
            <div className="mt-8 rounded-lg border border-grayline p-5 text-sm">
              Check your inbox at <strong>{email}</strong>. The link expires in
              one hour.
            </div>
          )}
          <p className="mt-6 text-sm text-graytext text-center">
            Remembered it?{" "}
            <Link href="/login" className="text-ink font-medium underline">
              Back to log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
