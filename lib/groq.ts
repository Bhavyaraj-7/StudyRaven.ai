// Compatibility layer: existing routes call groqChat/groqJson. Both now run
// through lib/ai/client.ts (retries with backoff on 429/5xx, timeouts, model
// fallback, friendly errors). New code should use chat()/chatJson() directly
// so replies are validated with a zod schema.
import { AiError, chat, extractJson, type ChatOptions } from "@/lib/ai/client";
import { DEFAULT_PRIMARY_MODEL } from "@/lib/ai/models";

/** @deprecated Kept for existing imports; see lib/ai/models.ts. */
export const MODEL = DEFAULT_PRIMARY_MODEL;

type LegacyOptions = Pick<ChatOptions, "temperature" | "maxTokens" | "json" | "task">;

export async function groqChat(system: string, user: string, opts: LegacyOptions = {}) {
  const r = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    opts,
  );
  return r.text;
}

/** Unvalidated JSON. Prefer chatJson(schema, …) for anything that's saved or shown. */
export async function groqJson<T = unknown>(system: string, user: string, opts: LegacyOptions = {}): Promise<T> {
  const text = await groqChat(system, user, { ...opts, json: true });
  const value = extractJson(text);
  if (value === undefined) throw new AiError("bad_output", "The AI returned an unreadable response");
  return value as T;
}
