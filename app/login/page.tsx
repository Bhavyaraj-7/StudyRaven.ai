"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthPanel from "@/components/auth/AuthPanel";
import { supabaseBrowser } from "@/lib/supabase";
import GoogleButton from "@/components/auth/GoogleButton";
import { safeRedirectPath } from "@/lib/safe-redirect";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = safeRedirectPath(params.get("redirect"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const sb = supabaseBrowser();
    const { error: err } = await sb.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <AuthPanel title="Welcome back." line="Pick up where you left off." />
      <section className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-semibold">Log in</h1>
          <p className="mt-2 text-graytext">Welcome back to StudyRaven.ai.</p>

          <div className="mt-8">
            <GoogleButton next={redirect} />
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-graymute">
            <div className="flex-1 h-px bg-grayline" />
            or
            <div className="flex-1 h-px bg-grayline" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm text-graytext">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-input border border-control-line bg-paper-2 px-4 py-3 focus:border-accent"
              />
            </label>
            <label className="block">
              <div className="flex items-center justify-between">
                <span className="text-sm text-graytext">Password</span>
                <Link
                  href="/forgot-password"
                  className="text-xs text-graytext hover:text-ink underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full rounded-input border border-control-line bg-paper-2 px-4 py-3 focus:border-accent"
              />
            </label>
            {error && (
              <div className="text-sm text-danger border border-danger/30 bg-danger/5 rounded-lg p-3">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="press w-full rounded-pill bg-accent py-3 font-semibold text-on-accent shadow-card hover:bg-accent/90 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
          <p className="mt-6 text-sm text-graytext text-center">
            No account yet?{" "}
            <Link href="/signup" className="text-ink font-medium underline">
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
