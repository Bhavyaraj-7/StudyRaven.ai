"use client";

import { useEffect, useState } from "react";
import { Loader2, Play, Timer, CheckCircle2, Upload } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { supabaseBrowser } from "@/lib/supabase";
import { extractPdfText } from "@/lib/pdf";

type Phase = "setup" | "running" | "results";

interface Question {
  q: number;
  text: string;
  marks: number;
}

interface MarkSchemeItem {
  q: number;
  answer: string;
  marks: number;
}

interface Result {
  score: number;
  max_score: number;
  predicted_grade: string;
  feedback: string;
  topic_breakdown: { topic: string; correct: number; total: number; comment: string }[];
}

export default function MocksPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [subjectId, setSubjectId] = useState<string>("");
  const [subjectName, setSubjectName] = useState<string>("Mathematics");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [topic, setTopic] = useState("");
  const [source, setSource] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [markScheme, setMarkScheme] = useState<MarkSchemeItem[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(3600);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSubject = params.get("subject");

    supabaseBrowser()
      .from("subjects")
      .select("id, name")
      .then(({ data }) => {
        setSubjects(data ?? []);
        const match = urlSubject
          ? data?.find((s) => s.name.toLowerCase() === urlSubject.toLowerCase())
          : null;
        if (match) {
          setSubjectId(match.id);
          setSubjectName(match.name);
        } else if (urlSubject) {
          setSubjectName(urlSubject);
        } else if (data && data[0]) {
          setSubjectId(data[0].id);
          setSubjectName(data[0].name);
        }
      });

    // Handoff from Papers → "Take this paper as a timed mock".
    if (params.get("fromPaper") === "1") {
      try {
        const raw = sessionStorage.getItem("sr-mock-paper");
        if (raw) {
          const p = JSON.parse(raw) as {
            subject?: string;
            questions?: Question[];
            mark_scheme?: MarkSchemeItem[];
          };
          if (p.subject) setSubjectName(p.subject);
          if (p.questions?.length) {
            setQuestions(p.questions);
            setMarkScheme(p.mark_scheme ?? []);
            setAnswers({});
            setSecondsLeft(3600);
            setPhase("running");
            recordAttemptStart(p.subject || subjectName);
          }
        }
        sessionStorage.removeItem("sr-mock-paper");
      } catch {
        // Corrupt handoff data — fall through to normal setup.
      }
    }
  }, []);

  useEffect(() => {
    if (phase !== "running") return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setError(null);
    try {
      if (f.name.toLowerCase().endsWith(".pdf") || f.type === "application/pdf") {
        setFileName(`${f.name} (reading...)`);
        const text = await extractPdfText(f);
        if (!text.trim()) {
          setError("Could not extract text from this PDF — it may be a scanned image. Try a searchable PDF.");
          setSource("");
          setFileName(f.name);
          return;
        }
        setSource(text);
        setFileName(f.name);
      } else if (
        f.type.startsWith("text/") ||
        f.name.endsWith(".md") ||
        f.name.endsWith(".txt")
      ) {
        const text = await f.text();
        setSource(text.slice(0, 30000));
      } else {
        setError("Unsupported file type. Please upload a PDF, TXT, or MD file.");
        setFileName(null);
      }
    } catch (err) {
      setError(`Could not read file: ${(err as Error).message}`);
      setFileName(f.name);
    }
  }

  async function recordAttemptStart(subjectNameArg: string, subjectIdArg?: string) {
    const sb = supabaseBrowser();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) return;
    const { data } = await sb
      .from("mock_attempts")
      .insert({
        user_id: auth.user.id,
        subject_id: subjectIdArg || null,
        subject_name: subjectNameArg,
      })
      .select("id")
      .single();
    if (data) setAttemptId(data.id);
  }

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subjectName, difficulty, topic, source }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuestions(data.questions || []);
      setMarkScheme(data.mark_scheme || []);
      setAnswers({});
      setSecondsLeft(3600);
      setPhase("running");
      await recordAttemptStart(subjectName, subjectId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mocks/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_id: subjectId,
          subject: subjectName,
          questions,
          mark_scheme: markScheme,
          answers,
          attempt_id: attemptId,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setPhase("results");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout title="Mock tests">
      {phase === "setup" && (
        <div>
          <p className="text-graytext">
            Take a timed mock. StudyRaven generates the paper, you type your answers, and Groq grades against the mark scheme.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <label className="block">
              <span className="text-sm text-graytext">Subject</span>
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  const s = subjects.find((x) => x.id === e.target.value);
                  if (s) setSubjectName(s.name);
                }}
                className="mt-1 w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink bg-paper"
              >
                {subjects.length === 0 && (
                  <option value="">(no subjects — add via onboarding)</option>
                )}
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-graytext">Difficulty</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink bg-paper"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
          </div>
          <label className="mt-4 block max-w-2xl">
            <span className="text-sm text-graytext">What do you want to be tested on?</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Trigonometry — sine, cosine, tangent rules"
              className="mt-1 w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink"
            />
          </label>
          <label className="mt-4 block max-w-2xl">
            <span className="text-sm text-graytext">
              Upload a past paper or notes (PDF or text) — optional but recommended
            </span>
            <label className="mt-1 rounded-lg border border-dashed border-grayline px-4 py-3 flex items-center gap-2 cursor-pointer hover:border-ink">
              <Upload className="w-4 h-4 text-graytext" />
              <span className="text-sm text-graytext truncate">
                {fileName ?? "Drag a file here or click to choose — PDF, TXT, or MD"}
              </span>
              <input
                type="file"
                onChange={onFile}
                className="hidden"
                accept=".pdf,.txt,.md"
              />
            </label>
          </label>
          {error && (
            <div className="mt-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3 max-w-2xl">
              {error}
            </div>
          )}
          <button
            onClick={start}
            disabled={loading}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink text-paper px-5 py-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Start 1-hour mock
          </button>
        </div>
      )}

      {phase === "running" && (
        <div>
          <div className="sticky top-[72px] z-10 bg-paper py-3 mb-4 flex items-center justify-between border-b border-grayline">
            <div className="inline-flex items-center gap-2 text-lg font-semibold">
              <Timer className="w-5 h-5" />
              {formatTime(secondsLeft)}
            </div>
            <button
              onClick={submit}
              disabled={loading}
              className="rounded-lg bg-ink text-paper px-4 py-2 text-sm disabled:opacity-50"
            >
              {loading ? "Grading..." : "Submit"}
            </button>
          </div>

          <ol className="space-y-6">
            {questions.map((q) => (
              <li key={q.q} className="rounded-xl border border-grayline p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-graymute">Question {q.q} · {q.marks} marks</div>
                    <div className="mt-1">{q.text}</div>
                  </div>
                </div>
                <textarea
                  value={answers[q.q] ?? ""}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, [q.q]: e.target.value }))
                  }
                  rows={4}
                  placeholder="Your answer..."
                  className="mt-3 w-full rounded-lg border border-grayline px-3 py-2 outline-none focus:border-ink resize-none"
                />
              </li>
            ))}
          </ol>
        </div>
      )}

      {phase === "results" && result && (
        <div>
          <div className="rounded-2xl border border-grayline bg-paper p-8">
            <div className="flex items-center gap-2 text-graymute text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Grading complete
            </div>
            <div className="mt-3 flex items-end gap-6">
              <div>
                <div className="text-5xl font-semibold">
                  {result.score}
                  <span className="text-2xl text-graymute">/{result.max_score}</span>
                </div>
                <div className="text-sm text-graytext mt-1">Raw score</div>
              </div>
              <div>
                <div className="text-5xl font-semibold">{result.predicted_grade}</div>
                <div className="text-sm text-graytext mt-1">Predicted grade</div>
              </div>
            </div>
            <p className="mt-6 text-graytext">{result.feedback}</p>
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-3">Topic breakdown</h3>
          <div className="space-y-2">
            {result.topic_breakdown?.map((t, i) => {
              const pct = t.total ? Math.round((t.correct / t.total) * 100) : 0;
              return (
                <div key={i} className="rounded-xl border border-grayline p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{t.topic}</div>
                    <div className="text-sm text-graytext">
                      {t.correct}/{t.total} · {pct}%
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-graylite rounded">
                    <div className="h-full bg-ink rounded" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-sm text-graymute mt-2">{t.comment}</div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              setPhase("setup");
              setResult(null);
              setAttemptId(null);
            }}
            className="mt-8 rounded-lg border border-grayline px-4 py-2"
          >
            Take another mock
          </button>
        </div>
      )}
    </AppLayout>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}
