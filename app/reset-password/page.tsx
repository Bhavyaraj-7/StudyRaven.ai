"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    const sb = supabaseBrowser();
    const { error: err } = await sb.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
    setTimeout(() => router.push("/dashboard"), 1500);
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
          <h2 className="text-h2">Set a new password.</h2>
          <p className="mt-4 text-graymute max-w-md">
            Use at least 8 characters — mix letters and numbers.
          </p>
        </div>
        <div className="text-graymute text-sm">© StudyRaven.ai</div>
      </section>
      <section className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-semibold">Choose a new password</h1>
          {!done && (
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <label className="block">
                <span className="text-sm text-graytext">New password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink"
                />
              </label>
              <label className="block">
                <span className="text-sm text-graytext">Confirm password</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                {loading ? "Saving..." : "Update password"}
              </button>
            </form>
          )}
          {done && (
            <div className="mt-8 rounded-lg border border-grayline p-5 text-sm">
              Password updated. Redirecting...
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
