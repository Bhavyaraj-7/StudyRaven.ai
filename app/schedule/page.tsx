"use client";

import { useState } from "react";
import { Calendar, Mail, Sparkles, Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import ReactMarkdown from "react-markdown";

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<string | null>(null);
  const [loading, setLoading] = useState<"plan" | "reminders" | "email" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function generatePlan() {
    setLoading("plan");
    setMsg(null);
    try {
      const r = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "plan" }),
      });
      const data = await r.json();
      setSchedule(data.markdown);
    } finally {
      setLoading(null);
    }
  }

  async function generateReminders() {
    setLoading("reminders");
    try {
      await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "reminders" }),
      });
      setMsg("Deadline reminder tasks created.");
    } finally {
      setLoading(null);
    }
  }

  async function emailToMe() {
    setLoading("email");
    try {
      const r = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "email", content: schedule }),
      });
      const d = await r.json();
      setMsg(d.error ? `Error: ${d.error}` : "Schedule sent to your inbox.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <AppLayout title="Schedule">
      <p className="text-graytext">
        Generate a personalized study schedule, set up deadline reminders, and email everything to yourself.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={generatePlan}
          disabled={loading !== null}
          className="inline-flex items-center gap-2 rounded-lg bg-ink text-paper px-4 py-2.5 disabled:opacity-50"
        >
          {loading === "plan" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate study schedule
        </button>
        <button
          onClick={generateReminders}
          disabled={loading !== null}
          className="inline-flex items-center gap-2 rounded-lg border border-grayline px-4 py-2.5 hover:border-ink disabled:opacity-50"
        >
          {loading === "reminders" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
          Set deadline reminders
        </button>
        <button
          onClick={emailToMe}
          disabled={loading !== null || !schedule}
          className="inline-flex items-center gap-2 rounded-lg border border-grayline px-4 py-2.5 hover:border-ink disabled:opacity-50"
        >
          {loading === "email" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          Email to me
        </button>
      </div>
      {msg && <div className="mt-4 text-sm text-graytext">{msg}</div>}
      {schedule && (
        <article className="prose max-w-none mt-8 rounded-xl border border-grayline p-6">
          <ReactMarkdown>{schedule}</ReactMarkdown>
        </article>
      )}
    </AppLayout>
  );
}
