import { env } from "@/lib/env";

// One place for model choices (master prompt §10.7.2). Both IDs were
// checked against openrouter.ai/api/v1/models on 23 Nov 2026.
export const DEFAULT_PRIMARY_MODEL = "meta-llama/llama-3.3-70b-instruct"; // $0.71/M in + out
export const DEFAULT_FALLBACK_MODEL = "qwen/qwen-2.5-72b-instruct"; // $0.36/M in, $0.40/M out

export type AiTask = "marking" | "generation" | "chat" | "analysis";

export interface TaskConfig {
  temperature: number;
  maxTokens: number;
  /** Per-attempt timeout. The whole call also has a budget (client.ts). */
  timeoutMs: number;
}

export const TASKS: Record<AiTask, TaskConfig> = {
  marking: { temperature: 0.2, maxTokens: 2500, timeoutMs: 40_000 },
  generation: { temperature: 0.6, maxTokens: 3000, timeoutMs: 40_000 },
  chat: { temperature: 0.5, maxTokens: 1600, timeoutMs: 30_000 },
  analysis: { temperature: 0.3, maxTokens: 1200, timeoutMs: 25_000 },
};

/** Models to try in order: primary, then fallback (deduplicated). */
export function modelChain(): string[] {
  const primary = env("AI_PRIMARY_MODEL") ?? DEFAULT_PRIMARY_MODEL;
  const fallback = env("AI_FALLBACK_MODEL") ?? DEFAULT_FALLBACK_MODEL;
  return primary === fallback ? [primary] : [primary, fallback];
}
