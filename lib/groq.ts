// Routed through OpenRouter's OpenAI-compatible API (proxies to Groq + others,
// more stable than calling Groq directly). Plain fetch — the groq-sdk client
// bakes in its own "/openai/v1" path on top of baseURL, which double-prefixes
// the URL when pointed at a non-Groq host.
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
export const MODEL = "meta-llama/llama-3.3-70b-instruct";

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

/**
 * Transient network failures ("Premature close", socket resets) happen
 * intermittently on some Windows/AV setups even with a valid key.
 * Retry up to 3 times with a short backoff before giving up.
 */
async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const msg = e instanceof Error ? e.message : String(e);
      const transient =
        /premature close|fetch failed|econnreset|etimedout|socket|network|terminated|aborted/i.test(
          msg,
        );
      if (!transient || attempt === tries - 1) throw e;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw lastErr;
}

export async function groqChat(
  system: string,
  user: string,
  opts: { temperature?: number; maxTokens?: number; json?: boolean } = {},
) {
  const res = await withRetry(async () => {
    const messages: ChatMessage[] = [
      { role: "system", content: system },
      { role: "user", content: user },
    ];
    const r = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: opts.temperature ?? 0.6,
        max_tokens: opts.maxTokens ?? 2048,
        response_format: opts.json ? { type: "json_object" } : undefined,
        messages,
      }),
    });
    const data = (await r.json()) as ChatCompletionResponse;
    if (!r.ok) {
      throw new Error(data.error?.message ?? `OpenRouter error ${r.status}`);
    }
    return data;
  });
  return res.choices?.[0]?.message?.content ?? "";
}

export async function groqJson<T = unknown>(
  system: string,
  user: string,
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<T> {
  const text = await groqChat(system, user, { ...opts, json: true });
  try {
    return JSON.parse(text) as T;
  } catch {
    // Models occasionally wrap JSON in markdown fences or prose despite
    // response_format — salvage the first {...} block before giving up.
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        // fall through
      }
    }
    throw new Error("The AI returned an unreadable response — please try again.");
  }
}
