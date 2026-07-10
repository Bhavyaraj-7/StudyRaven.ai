"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";
import GoogleButton from "@/components/auth/GoogleButton";

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
  const redirect = params.get("redirect") || "/dashboard";

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
      <section className="hidden md:flex flex-col justify-between bg-ink text-paper p-12">
        <Link href="/" className="flex items-center gap-2 font-semibold text-[19px]">
          <span className="w-[26px] h-[26px] rounded-[7px] bg-paper text-ink inline-flex items-center justify-center font-mono text-[14px]">
            S
          </span>
          StudyRaven<span className="text-graymute">.ai</span>
        </Link>
        <div>
          <h2 className="text-h2">Welcome back.</h2>
          <p className="mt-4 text-graymute max-w-md">
            Pick up where you left off.
          </p>
        </div>
        <div className="text-graymute text-sm">© StudyRaven.ai</div>
      </section>
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
                className="mt-1 w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink"
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
