"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Trash2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabaseBrowser } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What should I focus on this year to get into my target universities?",
  "How important are extracurriculars for US admissions?",
  "What grades do top UK universities expect?",
  "Build me a plan to strengthen my weakest area.",
];

export default function ChatTab() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabaseBrowser()
      .from("college_chats")
      .select("role, content")
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        setMessages((data as Msg[]) ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput("");
    setError(null);
    setSending(true);
    setMessages((m) => [...m, { role: "user", content }, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/college/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      if (!res.body) throw new Error("No response stream.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + chunk };
          return copy;
        });
      }
    } catch (e) {
      setError((e as Error).message);
      // Drop the empty assistant bubble if nothing streamed.
      setMessages((m) =>
        m[m.length - 1]?.role === "assistant" && !m[m.length - 1].content
          ? m.slice(0, -1)
          : m,
      );
    } finally {
      setSending(false);
    }
  }

  async function clearChat() {
    await fetch("/api/college/chat", { method: "DELETE" });
    setMessages([]);
  }

  if (loading) {
    return <div className="text-graymute">Loading chat...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ minHeight: "60vh" }}>
      {/* Messages */}
      <div className="flex-1 space-y-4">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-grayline bg-graylite/40 p-8 text-center">
            <Sparkles className="w-5 h-5 mx-auto text-graymute" />
            <div className="font-semibold mt-3">Ask StudyRaven anything about college</div>
            <p className="text-sm text-graytext mt-1">
              It knows your profile, subjects, and readiness score — answers are
              tailored to you.
            </p>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border border-grayline px-3 py-2.5 text-xs text-graytext hover:border-ink hover:text-ink text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                m.role === "user"
                  ? "bg-ink text-paper rounded-br-sm"
                  : "bg-graylite text-ink rounded-bl-sm",
              )}
            >
              {m.role === "assistant" ? (
                m.content ? (
                  <div className="[&_p]:my-1.5 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_strong]:font-semibold [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-graymute" />
                )
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Composer */}
      <div className="sticky bottom-0 bg-paper pt-4 pb-2 mt-6">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Ask about universities, deadlines, essays, your plan..."
            className="flex-1 rounded-xl border border-grayline px-4 py-3 text-sm outline-none focus:border-ink resize-none"
          />
          <button
            onClick={() => send()}
            disabled={sending || !input.trim()}
            className="rounded-xl bg-ink text-paper p-3 disabled:opacity-40"
            aria-label="Send"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="mt-2 inline-flex items-center gap-1 text-xs text-graymute hover:text-ink"
          >
            <Trash2 className="w-3 h-3" />
            Clear conversation
          </button>
        )}
      </div>
    </div>
  );
}
