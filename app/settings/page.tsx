"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import PricingModal from "@/components/shared/PricingModal";
import CopyEmail from "@/components/site/CopyEmail";
import Button from "@/components/ui/Button";
import Segmented from "@/components/ui/Segmented";
import Stroke from "@/components/ui/Stroke";
import Switch from "@/components/ui/Switch";
import WelcomeOverlay, { type WelcomeMode } from "@/components/welcome/WelcomeOverlay";
import { preferStill } from "@/components/welcome/WelcomeGate";
import { useProfile } from "@/hooks/useProfile";
import { supabaseBrowser } from "@/lib/supabase";
import { SITE } from "@/lib/site";
import { getStoredTheme, setStoredTheme, type Theme } from "@/lib/theme";

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "appearance", label: "Appearance" },
  { id: "motion", label: "Motion" },
  { id: "notifications", label: "Notifications" },
  { id: "plan", label: "Plan" },
  { id: "privacy", label: "Privacy and data" },
  { id: "help", label: "Help and support" },
  { id: "account", label: "Account" },
];

const GRADES = [6, 7, 8, 9, 10, 11, 12, 13];
const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];
const INPUT =
  "mt-1.5 w-full rounded-input border-[1.5px] border-control-line bg-paper px-4 py-3 text-ink outline-none transition-colors focus:border-accent";

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-grayline py-10 first:border-t-0 first:pt-0">
      <h2 id={`${id}-title`} className="text-title font-semibold">
        {title}
      </h2>
      {description && <p className="mt-1 max-w-[60ch] text-sm text-graytext">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { profile, subscription, loading, isPro } = useProfile();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [grade, setGrade] = useState(10);
  // What's saved right now, so "Save" only lights up for real changes.
  const [base, setBase] = useState({ name: "", country: "", grade: 10 });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>("system");
  const [celebrations, setCelebrations] = useState(true);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [film, setFilm] = useState<WelcomeMode | null>(null);

  useEffect(() => {
    if (!profile) return;
    const saved = { name: profile.name ?? "", country: profile.country ?? "", grade: profile.grade ?? 10 };
    setBase(saved);
    setName(saved.name);
    setCountry(saved.country);
    setGrade(saved.grade);
    setUnsubscribed(Boolean(profile.unsubscribed));
  }, [profile]);

  useEffect(() => {
    setTheme(getStoredTheme());
    try {
      setCelebrations(window.localStorage.getItem("sr-celebrations") !== "off");
    } catch {
      // storage blocked: keep the default
    }
    const sb = supabaseBrowser();
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setEmail(data.user.email ?? "");
      const { data: rows } = await sb.from("subjects").select("name").eq("user_id", data.user.id);
      setSubjects((rows ?? []).map((r) => r.name as string));
    });
  }, []);

  function pickTheme(t: string) {
    setTheme(t as Theme);
    setStoredTheme(t as Theme);
  }

  function toggleCelebrations(on: boolean) {
    setCelebrations(on);
    try {
      if (on) window.localStorage.removeItem("sr-celebrations");
      else window.localStorage.setItem("sr-celebrations", "off");
    } catch {
      // storage blocked: the choice lasts for this visit only
    }
  }

  async function save() {
    setSaving(true);
    setSaveError(null);
    const sb = supabaseBrowser();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) {
      setSaving(false);
      setSaveError("You've been signed out. Log in again to save.");
      return;
    }
    const next = { name: name.trim(), country: country.trim(), grade };
    const { error } = await sb.from("profiles").update(next).eq("id", auth.user.id);
    setSaving(false);
    if (error) {
      setSaveError("Couldn't save just now. Check your connection and try again.");
      return;
    }
    setBase(next);
    setSavedAt(Date.now());
  }

  async function toggleEmails(wantEmails: boolean) {
    setEmailSaving(true);
    setUnsubscribed(!wantEmails);
    const sb = supabaseBrowser();
    const { data: auth } = await sb.auth.getUser();
    if (auth.user) await sb.from("profiles").update({ unsubscribed: !wantEmails }).eq("id", auth.user.id);
    setEmailSaving(false);
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

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <AppLayout title="Settings">
        <div className="max-w-2xl space-y-4" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-object bg-paper-2" />
          ))}
        </div>
      </AppLayout>
    );
  }

  const dirty = name.trim() !== base.name || country.trim() !== base.country || grade !== base.grade;

  return (
    <AppLayout title="Settings">
      <div className="grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block rounded-input px-3 py-2 text-graytext transition-colors hover:bg-paper-2 hover:text-ink">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 max-w-2xl">
          <Section id="profile" title="Profile" description="Your name appears in your plans, reports and the welcome film.">
            <label className="block">
              <span className="text-sm font-medium text-graytext">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={INPUT} />
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-graytext">Grade</span>
                <select value={grade} onChange={(e) => setGrade(Number(e.target.value))} className={INPUT}>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-graytext">Country</span>
                <input value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country-name" className={INPUT} />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button onClick={save} loading={saving} disabledReason={!dirty && !saving ? "No changes to save" : undefined}>
                Save changes
              </Button>
              {savedAt > 0 && !dirty && (
                <span key={savedAt} role="status" className="inline-flex items-center gap-2 text-sm font-medium text-graytext">
                  <span className="text-examiner">
                    <Stroke variant="tick" play width={16} strokeWidth={3} />
                  </span>
                  Saved
                </span>
              )}
            </div>
            {saveError && (
              <p role="alert" className="mt-4 rounded-input border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
                {saveError}
              </p>
            )}
          </Section>

          <Section id="appearance" title="Appearance" description="System follows your device's light or dark setting.">
            <Segmented label="Theme" options={THEMES} value={theme} onChange={pickTheme} />
          </Section>

          <Section id="motion" title="Motion" description="Animations always respect your device's reduce-motion setting.">
            <Switch
              checked={celebrations}
              onChange={toggleCelebrations}
              label="Celebrations"
              description="Confetti for big moments, like your first marked mock, and the animated welcome film."
            />
            <div className="mt-4 border-t border-grayline pt-4">
              <Button variant="quiet" onClick={() => setFilm(preferStill() ? "still" : "film")}>
                Watch the welcome film again
              </Button>
            </div>
          </Section>

          <Section id="notifications" title="Notifications">
            <Switch
              checked={!unsubscribed}
              onChange={toggleEmails}
              disabled={emailSaving}
              label="Email me reminders and results"
              description="Deadline reminders, mock results and study tips. Sign-in and payment emails always arrive."
            />
          </Section>

          <Section id="plan" title="Plan">
            <div className="rounded-object border border-grayline p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-graymute">Current plan</p>
                  <p className="mt-1 font-display text-h3 font-semibold">{isPro ? "Pro" : "Free"}</p>
                  <p className="mt-1 text-sm text-graytext">
                    {isPro
                      ? `${subscription?.billing_cycle === "yearly" ? "Yearly" : "Monthly"} · ${subscription?.status}`
                      : "5 AI uses a day. Pro removes the limit and adds the college guide."}
                  </p>
                </div>
                {!isPro && <Button onClick={() => setPricingOpen(true)}>Go Pro</Button>}
              </div>
              {isPro && subscription?.status === "active" && (
                <div className="mt-6 border-t border-grayline pt-6">
                  <Button variant="secondary" onClick={cancelPlan} loading={cancelling}>
                    Cancel subscription
                  </Button>
                  <p className="mt-2 text-sm text-graymute">You keep Pro until the end of the period you paid for.</p>
                </div>
              )}
              {cancelMsg && (
                <p role="status" className="mt-4 text-sm text-graytext">
                  {cancelMsg}
                </p>
              )}
            </div>
          </Section>

          <Section
            id="privacy"
            title="Privacy and your data"
            description="Other students can never see your work. We don't sell data, run ads or use trackers."
          >
            <ul className="divide-y divide-grayline rounded-object border border-grayline">
              {[
                { label: "Get a copy of my data", subject: "Data request: copy of my data" },
                { label: "Correct something about me", subject: "Data request: correction" },
                { label: "Delete my account and data", subject: "Data request: delete my account" },
              ].map((r) => (
                <li key={r.label}>
                  <a
                    href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent(r.subject)}`}
                    className="flex min-h-[52px] items-center justify-between gap-4 px-5 text-sm font-medium transition-colors hover:bg-paper-2"
                  >
                    {r.label}
                    <span aria-hidden className="text-graymute">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-graytext">
              These open an email to us from your account address. Read the{" "}
              <Link href="/privacy" className="font-medium text-ink underline underline-offset-4">
                privacy policy
              </Link>
              .
            </p>
          </Section>

          <Section id="help" title="Help and support" description="Stuck, found a bug, or think a mark is wrong? Write to us.">
            <div className="rounded-object border border-grayline bg-study-tint p-6">
              <p className="text-sm font-medium text-graytext">Support email</p>
              <a href={`mailto:${SITE.contactEmail}`} className="mt-1 block break-all text-lg font-semibold underline-offset-4 hover:underline">
                {SITE.contactEmail}
              </a>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href={`mailto:${SITE.contactEmail}`}>Write an email</Button>
                <CopyEmail email={SITE.contactEmail} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link href="/contact" className="font-medium text-accent underline-offset-4 hover:underline">
                All contact options
              </Link>
              <Link href="/about" className="font-medium text-accent underline-offset-4 hover:underline">
                What every feature does
              </Link>
            </div>
          </Section>

          <Section id="account" title="Account">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-graymute">Signed in as</p>
                <p className="mt-0.5 break-all font-medium">{email || "your account"}</p>
              </div>
              <Button variant="secondary" onClick={signOut}>
                Sign out
              </Button>
            </div>
          </Section>
        </div>
      </div>

      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
      {film && <WelcomeOverlay name={name} subjects={subjects} mode={film} onClose={() => setFilm(null)} />}
    </AppLayout>
  );
}
