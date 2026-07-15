"use client";

import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const FOCUS_MIN = 25;
const BREAK_MIN = 5;

function todayKey() {
  return `focus_sessions_${new Date().toISOString().slice(0, 10)}`;
}

export default function FocusPage() {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MIN * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  // Load today's session count.
  useEffect(() => {
    setSessions(Number(localStorage.getItem(todayKey()) ?? 0));
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
      </div>
    </AppLayout>
  );
}
