"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthPanel from "@/components/auth/AuthPanel";
import { supabaseBrowser } from "@/lib/supabase";
import GoogleButton from "@/components/auth/GoogleButton";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const sb = supabaseBrowser();
    const { error: err } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
      },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push("/onboarding");
  }

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <AuthPanel title="See where your marks go." line="Study plans, AI-marked mocks and a college guide, in one place." />
      <section className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-semibold">Create your account</h1>
          <p className="mt-2 text-graytext">Free forever. Built for students.</p>

          <div className="mt-8">
            <GoogleButton next="/onboarding" />
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-graymute">
            <div className="flex-1 h-px bg-grayline" />
            or
            <div className="flex-1 h-px bg-grayline" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field
              label="Full name"
              value={name}
              onChange={setName}
              placeholder="Your full name"
              required
            />
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@school.com"
              required
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="8+ characters"
              required
            />
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-sm text-graytext text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-ink font-medium underline">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm text-graytext">{props.label}</span>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        required={props.required}
        className="mt-1 w-full rounded-input border border-control-line bg-paper-2 px-4 py-3 text-base focus:border-accent"
      />
    </label>
  );
}
