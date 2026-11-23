import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { AiError, chat, chatJson, extractJson, retryConfig } from "@/lib/ai/client";
import { DEFAULT_FALLBACK_MODEL, DEFAULT_PRIMARY_MODEL } from "@/lib/ai/models";

type Reply = { status: number; body?: unknown; headers?: Record<string, string> } | "network" | "hang";

/** Fake OpenRouter: answers each call with the next scripted reply. */
function scriptFetch(replies: Reply[]) {
  const calls: { model: string }[] = [];
  const fn = vi.fn(async (_url: string, init: RequestInit) => {
    calls.push({ model: JSON.parse(String(init.body)).model });
    const r = replies.shift();
    if (!r) throw new Error("unexpected extra call");
    if (r === "network") throw new TypeError("fetch failed");
    if (r === "hang") {
      return new Promise<Response>((_, reject) => {
        init.signal?.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
      });
    }
    return new Response(typeof r.body === "string" ? r.body : JSON.stringify(r.body ?? {}), {
      status: r.status,
      headers: r.headers,
    });
  });
  vi.stubGlobal("fetch", fn);
  return calls;
}

const ok = (content: string) => ({
  status: 200,
  body: { choices: [{ message: { content } }], usage: { prompt_tokens: 10, completion_tokens: 5 } },
});
const msgs = [{ role: "user" as const, content: "hi" }];

beforeEach(() => {
  process.env.OPENROUTER_API_KEY = "test-key";
  delete process.env.AI_PRIMARY_MODEL;
  delete process.env.AI_FALLBACK_MODEL;
  Object.assign(retryConfig, { attempts: 3, baseDelayMs: 1, maxDelayMs: 2, totalBudgetMs: 50_000 });
});
afterEach(() => vi.unstubAllGlobals());

describe("chat()", () => {
  it("returns text, model and token usage", async () => {
    scriptFetch([ok("hello")]);
    const r = await chat(msgs);
    expect(r).toEqual({ text: "hello", model: DEFAULT_PRIMARY_MODEL, usage: { promptTokens: 10, completionTokens: 5 } });
  });

  it("retries a 429 and a network error, then succeeds", async () => {
    const calls = scriptFetch([{ status: 429 }, "network", ok("done")]);
    expect((await chat(msgs)).text).toBe("done");
    expect(calls).toHaveLength(3);
  });

  it("falls back to the second model when the first keeps failing", async () => {
    const calls = scriptFetch([{ status: 503 }, { status: 503 }, { status: 503 }, ok("from fallback")]);
    const r = await chat(msgs);
    expect(r.model).toBe(DEFAULT_FALLBACK_MODEL);
    expect(calls.map((c) => c.model)).toEqual([...Array(3).fill(DEFAULT_PRIMARY_MODEL), DEFAULT_FALLBACK_MODEL]);
  });

  it("skips straight to the fallback on a 400 (model unavailable)", async () => {
    const calls = scriptFetch([{ status: 400, body: "no such model" }, ok("ok")]);
    await chat(msgs);
    expect(calls.map((c) => c.model)).toEqual([DEFAULT_PRIMARY_MODEL, DEFAULT_FALLBACK_MODEL]);
  });

  it("stops at once on a rejected key", async () => {
    const calls = scriptFetch([{ status: 401 }]);
    await expect(chat(msgs)).rejects.toMatchObject({ kind: "config" });
    expect(calls).toHaveLength(1);
  });

  it("reports busy after every attempt on both models fails", async () => {
    scriptFetch(Array(6).fill({ status: 500 }));
    await expect(chat(msgs)).rejects.toMatchObject({ kind: "busy" });
  });

  it("times out a hanging request", async () => {
    Object.assign(retryConfig, { attempts: 1, totalBudgetMs: 1_700 });
    scriptFetch(["hang", "hang"]);
    await expect(chat(msgs, { task: "analysis" })).rejects.toBeInstanceOf(AiError);
  }, 10_000);

  it("fails clearly when the key is missing", async () => {
    delete process.env.OPENROUTER_API_KEY;
    await expect(chat(msgs)).rejects.toMatchObject({ kind: "config" });
  });

  it("never sends the key anywhere but the Authorization header", async () => {
    const fn = vi.fn(async () => new Response(JSON.stringify(ok("x").body), { status: 200 }));
    vi.stubGlobal("fetch", fn);
    await chat(msgs);
    const [, init] = fn.mock.calls[0] as unknown as [string, RequestInit];
    expect(String(init.body)).not.toContain("test-key");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
  });
});

describe("chatJson()", () => {
  const Schema = z.object({ score: z.number().min(0), max: z.number() });

  it("parses and validates JSON, even inside code fences", async () => {
    scriptFetch([ok('```json\n{"score": 3, "max": 4}\n```')]);
    const r = await chatJson(Schema, "sys", "user");
    expect(r.data).toEqual({ score: 3, max: 4 });
  });

  it("asks once for a repair when the shape is wrong", async () => {
    const calls = scriptFetch([ok('{"score": -2, "max": 4}'), ok('{"score": 2, "max": 4}')]);
    const r = await chatJson(Schema, "sys", "user");
    expect(r.data.score).toBe(2);
    expect(calls).toHaveLength(2);
    expect(r.usage).toEqual({ promptTokens: 20, completionTokens: 10 });
  });

  it("gives up with bad_output after two invalid replies", async () => {
    scriptFetch([ok("not json"), ok("still not json")]);
    await expect(chatJson(Schema, "sys", "user")).rejects.toMatchObject({ kind: "bad_output" });
  });
});

describe("extractJson()", () => {
  it("finds an object wrapped in prose", () => {
    expect(extractJson('Sure! Here it is: {"a": 1} Hope that helps.')).toEqual({ a: 1 });
  });
  it("returns undefined for no JSON", () => {
    expect(extractJson("nothing here")).toBeUndefined();
  });
});
