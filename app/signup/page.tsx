"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      <section className="hidden md:flex flex-col justify-between bg-ink text-paper p-12">
        <Link href="/" className="font-mono font-bold text-xl">
          StudyRaven<span className="text-graymute">.ai</span>
        </Link>
        <div>
          <h2 className="text-h2">Crack IGCSE with AI.</h2>
          <p className="mt-4 text-graymute max-w-md">
            Practice papers, mock grading, college guidance — all in one place.
          </p>
        </div>
        <div className="text-graymute text-sm">© StudyRaven.ai</div>
      </section>
      <section className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-semibold">Create your account</h1>
          <p className="mt-2 text-graytext">Free forever. Built for IGCSE.</p>

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
              placeholder="Aditi Naruka"
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
              className="w-full rounded-lg bg-ink text-paper py-3 font-medium hover:opacity-90 disabled:opacity-50"
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
        className="mt-1 w-full rounded-lg border border-grayline bg-paper px-4 py-3 text-base outline-none focus:border-ink"
      />
    </label>
  );
}
