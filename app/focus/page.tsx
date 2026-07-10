"use client";

import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Check, Coffee, Brain } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { supabaseBrowser } from "@/lib/supabase";

const FOCUS_MIN = 25;
const BREAK_MIN = 5;

interface TaskRow {
  id: string;
  title: string;
}

function todayKey() {
  return `focus_sessions_${new Date().toISOString().slice(0, 10)}`;
}

export default function FocusPage() {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MIN * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [taskId, setTaskId] = useState<string>("");
  const [taskDone, setTaskDone] = useState(false);

  // Load today's session count + pending tasks.
  useEffect(() => {
    setSessions(Number(localStorage.getItem(todayKey()) ?? 0));
    const sb = supabaseBrowser();
    (async () => {
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) return;
      const { data } = await sb
        .from("tasks")
        .select("id, title")
        .eq("user_id", auth.user.id)
        .neq("status", "done")
        .order("due_date", { ascending: true })
        .limit(20);
      setTasks(data ?? []);
    })();
  }, []);

  // Tick — updater stays pure; the transition effect below handles side effects.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  // When the clock hits zero, log the session and switch modes.
  useEffect(() => {
    if (secondsLeft > 0) return;
    setRunning(false);
    if (mode === "focus") {
      const next = Number(localStorage.getItem(todayKey()) ?? 0) + 1;
      localStorage.setItem(todayKey(), String(next));
      setSessions(next);
      setMode("break");
      setSecondsLeft(BREAK_MIN * 60);
    } else {
      setMode("focus");
      setSecondsLeft(FOCUS_MIN * 60);
    }
  }, [secondsLeft, mode]);

  function reset() {
    setRunning(false);
    setMode("focus");
    setSecondsLeft(FOCUS_MIN * 60);
  }

  async function completeTask() {
    if (!taskId) return;
    const sb = supabaseBrowser();
    const { error } = await sb.from("tasks").update({ status: "done" }).eq("id", taskId);
    if (!error) {
      setTaskDone(true);
      setTasks((t) => t.filter((x) => x.id !== taskId));
      setTimeout(() => {
        setTaskId("");
        setTaskDone(false);
      }, 1500);
    }
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const total = (mode === "focus" ? FOCUS_MIN : BREAK_MIN) * 60;
  const progress = 1 - secondsLeft / total;

  return (
    <AppLayout title="Focus">
      <p className="text-graytext">
        25 minutes of deep work, 5 minutes of rest. Pick a task, hit start.
      </p>

      <div className="mt-10 max-w-md mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-sm text-graymute mb-6">
          {mode === "focus" ? (
            <>
              <Brain className="w-4 h-4" /> Focus session
            </>
          ) : (
            <>
              <Coffee className="w-4 h-4" /> Break — step away
            </>
          )}
        </div>

        <div className="relative rounded-2xl border border-grayline bg-paper py-14">
          <div
            className="absolute inset-x-0 bottom-0 bg-graylite rounded-b-2xl transition-all"
            style={{ height: `${Math.min(100, progress * 100)}%`, zIndex: 0 }}
          />
          <div className="relative font-mono text-7xl font-semibold tracking-tight">
            {mm}:{ss}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setRunning((r) => !r)}
            className="inline-flex items-center gap-2 rounded-lg bg-ink text-paper px-6 py-3 font-medium hover:opacity-90"
          >
            {running ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start
              </>
            )}
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-grayline px-4 py-3 hover:bg-graylite"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm text-graymute mt-4">
          {sessions} focus session{sessions === 1 ? "" : "s"} completed today
        </div>

        <div className="mt-10 text-left">
          <label className="block">
            <span className="text-sm text-graytext">Working on</span>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink bg-paper"
            >
              <option value="">Pick a task (optional)</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
          {taskId && (
            <button
              onClick={completeTask}
              disabled={taskDone}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-grayline px-4 py-2 text-sm hover:bg-graylite disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              {taskDone ? "Done ✓" : "Mark task complete"}
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
