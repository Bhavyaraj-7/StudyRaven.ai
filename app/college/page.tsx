"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, ExternalLink, X, Plus } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { supabaseBrowser } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import PricingModal from "@/components/shared/PricingModal";

interface CollegeData {
  readiness_score: number;
  strengths: string[];
  gaps: string[];
  action_plan: { month: string; goal: string; details: string }[];
  university_matches: { name: string; country: string; fit: string; why: string }[];
  target_country?: string;
  target_universities?: string[];
  interests?: string[];
  extracurriculars?: string[];
}

interface Opportunity {
  title: string;
  description: string;
  url: string;
}

export default function CollegePage() {
  const { isPro, loading: profileLoading } = useProfile();
  const [pricingOpen, setPricingOpen] = useState(false);
  const [data, setData] = useState<CollegeData | null>(null);
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (profileLoading) return;
    if (!isPro) {
      setLoading(false);
      return;
    }
    const sb = supabaseBrowser();
    (async () => {
      const { data: profile } = await sb
        .from("college_profiles")
        .select("*")
        .maybeSingle();
      if (profile) setData(profile);
      else setShowForm(true);

      const { data: opps } = await sb.from("competitions").select("title, description, url");
      setOpps(opps ?? []);
      setLoading(false);
    })();
  }, [isPro, profileLoading]);

  async function onGenerate(form: ProfileForm) {
    setGenerating(true);
    try {
      const res = await fetch("/api/college/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const profile = await res.json();
      setData({ ...profile, ...form });
      setShowForm(false);
      await refreshOpportunities();
    } finally {
      setGenerating(false);
    }
  }

  async function refreshOpportunities() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/college/opportunities", { method: "POST" });
      const data = await res.json();
      setOpps(data.items ?? []);
    } finally {
      setRefreshing(false);
    }
  }

  if (profileLoading || loading) {
    return (
      <AppLayout title="College guide">
        <div className="text-graymute">Loading...</div>
      </AppLayout>
    );
  }

  if (!isPro) {
    return (
      <AppLayout title="College guide">
        <div className="rounded-2xl border border-grayline bg-graylite/50 p-12 text-center max-w-2xl mx-auto">
          <Sparkles className="w-6 h-6 mx-auto" />
          <h2 className="text-2xl font-semibold mt-4">College guide is a Pro feature</h2>
          <p className="text-graytext mt-2">
            Get a personalized readiness score, university matches, and live opportunities pulled from across the web.
          </p>
          <button
            onClick={() => setPricingOpen(true)}
            className="mt-6 rounded-lg bg-ink text-paper px-6 py-3"
          >
            Unlock Pro
          </button>
        </div>
        <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
      </AppLayout>
    );
  }

  if (showForm || !data) {
    return (
      <AppLayout title="College guide">
        <CollegeProfileForm onSubmit={onGenerate} loading={generating} />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="College guide">
      <div className="rounded-2xl border border-grayline bg-paper p-8">
        <div className="text-sm text-graymute">Your readiness</div>
        <div className="flex items-end gap-6 mt-2">
          <div className="text-6xl font-semibold">{data.readiness_score}</div>
          <div className="text-graytext text-lg pb-2">/ 100</div>
        </div>
        <div className="h-2 bg-graylite rounded mt-4">
          <div className="h-full bg-ink rounded" style={{ width: `${data.readiness_score}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="rounded-xl border border-grayline p-5">
          <div className="font-semibold mb-3">Strengths</div>
          <ul className="space-y-1.5 text-sm">
            {data.strengths?.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
        <div className="rounded-xl border border-grayline p-5">
          <div className="font-semibold mb-3">Gaps</div>
          <ul className="space-y-1.5 text-sm">
            {data.gaps?.map((g, i) => <li key={i}>• {g}</li>)}
          </ul>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-3">6-month action plan</h2>
      <div className="space-y-3">
        {data.action_plan?.map((p, i) => (
          <div key={i} className="rounded-xl border border-grayline p-4">
            <div className="text-sm text-graymute">{p.month}</div>
            <div className="font-medium mt-1">{p.goal}</div>
            <div className="text-sm text-graytext mt-1">{p.details}</div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-3">University matches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.university_matches?.map((u, i) => (
          <div key={i} className="rounded-xl border border-grayline p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{u.name}</div>
              <span className="text-[10px] uppercase tracking-wide border border-grayline rounded px-1.5 py-0.5">
                {u.fit}
              </span>
            </div>
            <div className="text-xs text-graymute">{u.country}</div>
            <div className="text-sm text-graytext mt-2">{u.why}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-10 mb-3">
        <h2 className="text-xl font-semibold">Opportunities for you</h2>
        <button
          onClick={refreshOpportunities}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg bg-ink text-paper px-4 py-2 text-sm disabled:opacity-50"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Refresh recommendations
        </button>
      </div>
      {opps.length === 0 && !refreshing && (
        <p className="text-sm text-graymute mb-3">
          No opportunities yet — hit refresh to search the web for competitions,
          bootcamps, and summer programs matched to your interests.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {opps.map((o, i) => (
          <a
            key={i}
            href={o.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-grayline p-4 hover:border-ink"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">{o.title}</div>
              <ExternalLink className="w-3 h-3 text-graymute" />
            </div>
            <div className="text-xs text-graytext mt-1 line-clamp-2">{o.description}</div>
          </a>
        ))}
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="mt-8 text-sm text-graytext underline"
      >
        Update my college profile
      </button>
    </AppLayout>
  );
}

interface ProfileForm {
  target_country: string;
  target_universities: string[];
  interests: string[];
  extracurriculars: string[];
}

function CollegeProfileForm({
  onSubmit,
  loading,
}: {
  onSubmit: (f: ProfileForm) => void;
  loading: boolean;
}) {
  const [country, setCountry] = useState("United States");
  const [unis, setUnis] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [ecs, setEcs] = useState<string[]>([]);

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold">Tell us your college goals</h2>
      <p className="text-graytext mt-1">
        We&apos;ll generate your readiness score, match universities, and surface live opportunities.
      </p>
      <div className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm text-graytext">Target country</span>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink"
          />
        </label>
        <Chips label="Target universities" items={unis} setItems={setUnis} placeholder="Add a university" />
        <Chips label="Academic interests" items={interests} setItems={setInterests} placeholder="Add an interest (e.g. AI, biology)" />
        <Chips label="Extracurriculars" items={ecs} setItems={setEcs} placeholder="Add an EC (e.g. robotics club)" />
        <button
          onClick={() =>
            onSubmit({
              target_country: country,
              target_universities: unis,
              interests,
              extracurriculars: ecs,
            })
          }
          disabled={loading}
          className="rounded-lg bg-ink text-paper px-6 py-3 inline-flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate my profile
        </button>
      </div>
    </div>
  );
}

function Chips({
  label,
  items,
  setItems,
  placeholder,
}: {
  label: string;
  items: string[];
  setItems: (i: string[]) => void;
  placeholder: string;
}) {
  const [v, setV] = useState("");
  return (
    <div>
      <span className="text-sm text-graytext">{label}</span>
      <div className="mt-1 flex flex-wrap gap-2">
        {items.map((it, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-graylite px-3 py-1.5 text-sm"
          >
            {it}
            <button onClick={() => setItems(items.filter((_, j) => j !== i))}>
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="inline-flex items-center gap-1">
          <input
            value={v}
            onChange={(e) => setV(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && v.trim()) {
                setItems([...items, v.trim()]);
                setV("");
              }
            }}
            placeholder={placeholder}
            className="rounded-full border border-grayline px-3 py-1.5 text-sm outline-none focus:border-ink min-w-[200px]"
          />
          <button
            onClick={() => {
              if (v.trim()) {
                setItems([...items, v.trim()]);
                setV("");
              }
            }}
            className="text-graymute hover:text-ink"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
