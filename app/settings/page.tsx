"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { supabaseBrowser } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";

export default function SettingsPage() {
  const router = useRouter();
  const { profile, subscription, loading } = useProfile();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [grade, setGrade] = useState(10);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setCountry(profile.country ?? "");
      setGrade(profile.grade ?? 10);
    }
  }, [profile]);

  async function save() {
    setSaving(true);
    const sb = supabaseBrowser();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) return;
    await sb.from("profiles").update({ name, country, grade }).eq("id", auth.user.id);
    setSaving(false);
  }

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    router.push("/");
  }

  async function cancelPlan() {
    if (!window.confirm("Cancel your Pro plan? You keep Pro until the end of the period you already paid for.")) return;
    setCancelling(true);
    setCancelMsg(null);
    try {
      const res = await fetch("/api/cancel-subscription", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not cancel.");
      setCancelMsg("Cancelled. Your plan stays active until the end of the current billing period.");
    } catch (e) {
      setCancelMsg((e as Error).message);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <AppLayout title="Settings">
        <div className="text-graymute">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Settings">
      <section className="max-w-xl space-y-4">
        <h2 className="text-xl font-semibold">Profile</h2>
        <label className="block">
          <span className="text-sm text-graytext">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-graytext">Grade</span>
            <input
              type="number"
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink"
            />
          </label>
          <label className="block">
            <span className="text-sm text-graytext">Country</span>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink"
            />
          </label>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-ink text-paper px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </section>

      <section className="max-w-xl mt-12">
        <h2 className="text-xl font-semibold">Subscription</h2>
        <div className="mt-3 rounded-xl border border-grayline p-5">
          <div className="text-sm text-graymute">Plan</div>
          <div className="text-2xl font-semibold mt-1 capitalize">
            {subscription?.plan ?? "free"}
          </div>
          {subscription?.plan === "pro" && (
            <div className="text-sm text-graytext mt-2">
              {subscription.billing_cycle === "yearly" ? "Yearly" : "Monthly"} ·{" "}
              {subscription.status}
            </div>
          )}
          {subscription?.plan === "pro" && subscription.status === "active" && (
            <button
              onClick={cancelPlan}
              disabled={cancelling}
              className="mt-4 rounded-lg border border-grayline px-4 py-2 text-sm hover:bg-graylite disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel subscription"}
            </button>
          )}
          {cancelMsg && (
            <p className="text-sm text-graytext mt-3">{cancelMsg}</p>
          )}
        </div>
      </section>

      <section className="max-w-xl mt-12">
        <h2 className="text-xl font-semibold">Account</h2>
        <button
          onClick={signOut}
          className="mt-3 rounded-lg border border-grayline px-4 py-2 hover:bg-graylite"
        >
          Sign out
        </button>
      </section>
    </AppLayout>
  );
}
