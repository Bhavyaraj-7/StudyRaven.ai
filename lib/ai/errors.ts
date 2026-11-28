import { NextResponse } from "next/server";
import { AiError } from "./client";

// What students see when an AI call fails (§11: say what happened and what
// to do). Provider details go to server logs only, never to the browser.
const MESSAGES: Record<AiError["kind"] | "unknown", { status: number; message: string }> = {
  busy: { status: 503, message: "The AI is busy right now. Try again in a minute." },
  timeout: { status: 504, message: "The AI took too long to answer. Try again in a minute." },
  bad_output: { status: 502, message: "The AI sent back something we couldn't read. Try again." },
  rejected: { status: 502, message: "The AI couldn't handle that request. Try again, or shorten what you sent." },
  config: { status: 503, message: "The AI isn't available right now. We're on it." },
  unknown: { status: 500, message: "Something went wrong on our side. Try again in a minute." },
};

export function aiErrorResponse(e: unknown, override?: Partial<Record<AiError["kind"], string>>) {
  const kind = e instanceof AiError ? e.kind : "unknown";
  console.error(`[ai:${kind}]`, e instanceof Error ? e.message : e);
  const { status, message } = MESSAGES[kind];
  return NextResponse.json(
    { error: (kind !== "unknown" && override?.[kind]) || message, retryable: kind === "busy" || kind === "timeout" },
    { status },
  );
}
