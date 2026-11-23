import type { z } from "zod";
import { EnvError, requireEnv } from "@/lib/env";
import { modelChain, TASKS, type AiTask } from "./models";

// OpenRouter's OpenAI-compatible endpoint (routes to Groq and others).
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export type AiErrorKind =
  | "config" // key missing or rejected
  | "busy" // rate-limited or provider down after retries
  | "timeout" // no answer inside the time budget
  | "bad_output" // reply wasn't usable (empty, not JSON, wrong shape)
  | "rejected"; // provider refused the request (4xx) on every model

export class AiError extends Error {
  constructor(
    public kind: AiErrorKind,
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "AiError";
  }
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  task?: AiTask;
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}

export interface Usage {
  promptTokens: number;
  completionTokens: number;
}

export interface ChatResult {
  text: string;
  model: string;
  usage: Usage;
}

/** Tunable for tests. Total budget stays under Vercel's 60 s function limit. */
export const retryConfig = { attempts: 3, baseDelayMs: 600, maxDelayMs: 4_000, totalBudgetMs: 50_000 };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function backoffMs(attempt: number, retryAfter: string | null): number {
  const hinted = retryAfter ? Number(retryAfter) * 1000 : NaN;
  if (Number.isFinite(hinted) && hinted > 0) return Math.min(hinted, retryConfig.maxDelayMs);
  const exp = Math.min(retryConfig.baseDelayMs * 2 ** attempt, retryConfig.maxDelayMs);
  return exp * (0.75 + Math.random() * 0.5); // jitter so retries don't stampede
}

/**
 * Sends one request, retrying 429/5xx/network errors/timeouts with
 * exponential backoff, then moving to the fallback model. Returns the first
 * OK response with its body unread (so streaming callers can use it too).
 */
async function send(
  build: (model: string) => Record<string, unknown>,
  task: AiTask,
): Promise<{ res: Response; model: string }> {
  let key: string;
  try {
    key = requireEnv("OPENROUTER_API_KEY");
  } catch (e) {
    throw new AiError("config", (e as EnvError).message);
  }

  const started = Date.now();
  let last = new AiError("busy", "No attempt was made");

  for (const model of modelChain()) {
    for (let attempt = 0; attempt < retryConfig.attempts; attempt++) {
      const remaining = retryConfig.totalBudgetMs - (Date.now() - started);
      if (remaining < 1_500) throw new AiError("timeout", `Time budget used up (last: ${last.message})`);

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), Math.min(TASKS[task].timeoutMs, remaining));
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify(build(model)),
          signal: ctrl.signal,
        });
        if (res.ok) return { res, model };

        const detail = (await res.text().catch(() => "")).slice(0, 300);
        if (res.status === 401 || res.status === 403) {
          throw new AiError("config", `OpenRouter rejected the key (${res.status})`, res.status);
        }
        const retryable = res.status === 429 || res.status >= 500;
        last = new AiError(retryable ? "busy" : "rejected", `OpenRouter ${res.status} on ${model}: ${detail}`, res.status);
        if (!retryable) break; // e.g. 400 model unavailable: go to the fallback
        if (attempt < retryConfig.attempts - 1) await sleep(backoffMs(attempt, res.headers.get("retry-after")));
      } catch (e) {
        if (e instanceof AiError) throw e;
        const timedOut = (e as Error).name === "AbortError";
        last = new AiError(timedOut ? "timeout" : "busy", `${timedOut ? "Timed out" : "Network error"} on ${model}: ${(e as Error).message}`);
        if (attempt < retryConfig.attempts - 1) await sleep(backoffMs(attempt, null));
      } finally {
        clearTimeout(timer);
      }
    }
  }
  throw last;
}

function body(model: string, messages: ChatMessage[], opts: ChatOptions, stream: boolean) {
  const cfg = TASKS[opts.task ?? "generation"];
  return {
    model,
    messages,
    temperature: opts.temperature ?? cfg.temperature,
    max_tokens: opts.maxTokens ?? cfg.maxTokens,
    response_format: opts.json ? { type: "json_object" } : undefined,
    // Fastest provider for this model: long generations must finish in time.
    provider: { sort: "throughput" },
    stream: stream || undefined,
  };
}

interface CompletionResponse {
  choices?: { message?: { content?: string } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

export async function chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<ChatResult> {
  const task = opts.task ?? "generation";
  const { res, model } = await send((m) => body(m, messages, opts, false), task);
  const data = (await res.json().catch(() => null)) as CompletionResponse | null;
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) throw new AiError("bad_output", `Empty reply from ${model}`);
  return {
    text,
    model,
    usage: {
      promptTokens: data?.usage?.prompt_tokens ?? 0,
      completionTokens: data?.usage?.completion_tokens ?? 0,
    },
  };
}

/** For streaming routes: retries happen before the first byte is sent. */
export async function chatStream(messages: ChatMessage[], opts: ChatOptions = {}) {
  const { res, model } = await send((m) => body(m, messages, opts, true), opts.task ?? "chat");
  if (!res.body) throw new AiError("bad_output", `No stream body from ${model}`);
  return { body: res.body, model };
}

/** Parses a JSON object from a model reply, tolerating code fences or prose around it. */
export function extractJson(text: string): unknown {
  const cleaned = text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        // fall through
      }
    }
    return undefined;
  }
}

/**
 * Asks for JSON and validates it with a zod schema (§10.7.1). One repair
 * round: the model sees what was wrong and answers again.
 */
export async function chatJson<S extends z.ZodTypeAny>(
  schema: S,
  system: string,
  user: string,
  opts: ChatOptions = {},
): Promise<{ data: z.infer<S>; model: string; usage: Usage }> {
  const messages: ChatMessage[] = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
  const usage: Usage = { promptTokens: 0, completionTokens: 0 };
  let problem = "";

  for (let round = 0; round < 2; round++) {
    const r = await chat(messages, { ...opts, json: true });
    usage.promptTokens += r.usage.promptTokens;
    usage.completionTokens += r.usage.completionTokens;

    const raw = extractJson(r.text);
    const parsed = raw === undefined ? null : schema.safeParse(raw);
    if (parsed?.success) return { data: parsed.data, model: r.model, usage };

    problem = parsed
      ? parsed.error.issues.slice(0, 5).map((i: z.ZodIssue) => `${i.path.join(".") || "root"}: ${i.message}`).join("; ")
      : "not valid JSON";
    messages.push(
      { role: "assistant", content: r.text.slice(0, 6_000) },
      { role: "user", content: `That reply was invalid (${problem}). Reply again with only the corrected JSON object.` },
    );
  }
  throw new AiError("bad_output", `Reply failed validation twice: ${problem}`);
}
