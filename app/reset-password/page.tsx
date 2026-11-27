"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthPanel from "@/components/auth/AuthPanel";
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
      <AuthPanel title="Set a new password." line="Then you're straight back to your plan." />
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
                  className="mt-1 w-full rounded-input border border-control-line bg-paper-2 px-4 py-3 focus:border-accent"
                />
              </label>
              <label className="block">
                <span className="text-sm text-graytext">Confirm password</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="mt-1 w-full rounded-input border border-control-line bg-paper-2 px-4 py-3 focus:border-accent"
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
                className="press w-full rounded-pill bg-accent py-3 font-semibold text-on-accent shadow-card hover:bg-accent/90 disabled:opacity-50"
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
