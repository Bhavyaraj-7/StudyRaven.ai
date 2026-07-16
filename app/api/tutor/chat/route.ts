import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqChat } from "@/lib/groq";
import { isProUser } from "@/lib/subscription";

export const maxDuration = 60;

const SYSTEM = `You are an experienced IGCSE tutor teaching a Grade 9-10 student.

How you teach:
- Answer the actual question first, in plain language. No preamble.
- Work through problems step by step, showing every line a student must write.
- Where marks are awarded, say so explicitly: "this line earns the method mark".
- Use the command word of the question (state/describe/explain/evaluate) and answer it the way an examiner expects that command word to be answered.
- If the student is wrong, say so directly and show the correct reasoning. Never flatter.
- Keep it tight. A student revising does not want essays.

If SOURCE MATERIAL from the student's own paper or mark scheme is provided, ground your answer in it — quote the relevant part, use its terminology and its mark allocations. Only fall back to general IGCSE knowledge when the source doesn't cover the question.

Format with short paragraphs, bold for key terms, and numbered steps for working. Never invent mark scheme wording you cannot support.`;

interface Turn {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // The tutor is Pro-only — enforced server-side, never trusted from the client.
  if (!(await isProUser(user.id))) {
    return NextResponse.json(
      { error: "The AI tutor is a Pro feature.", pro_required: true },
      { status: 403 },
    );
  }

  const {
    question,
    subject = "",
    context = "",
    history = [],
  } = (await req.json().catch(() => ({}))) as {
    question?: string;
    subject?: string;
    context?: string;
    history?: Turn[];
  };

  if (!question?.trim()) {
    return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
  }

  // groqChat takes a single user turn, so the transcript is folded into it.
  const transcript = history
    .slice(-6)
    .map((t) => `${t.role === "user" ? "Student" : "Tutor"}: ${t.content}`)
    .join("\n\n");

  const userMsg = [
    subject ? `Subject: ${subject}` : "",
    context
      ? `\nSOURCE MATERIAL (from the student's uploaded paper or mark scheme — ground your answer in this):\n"""\n${context.slice(0, 16000)}\n"""`
      : "",
    transcript ? `\nEarlier in this conversation:\n${transcript}` : "",
    `\nStudent's question: ${question}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const answer = await groqChat(SYSTEM, userMsg, {
      temperature: 0.4,
      maxTokens: 1600,
    });
    return NextResponse.json({ answer });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
