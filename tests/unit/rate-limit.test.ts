import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
vi.mock("@/lib/supabase-server", () => ({ supabaseAdmin: () => ({ rpc }) }));
const isProUser = vi.fn();
vi.mock("@/lib/subscription", () => ({ isProUser: (id: string) => isProUser(id) }));

const { consumeQuota, quotaResponse, DAILY_LIMITS } = await import("@/lib/rate-limit");

beforeEach(() => {
  rpc.mockReset();
  isProUser.mockReset();
});

describe("consumeQuota()", () => {
  it("uses the free limit for free students", async () => {
    isProUser.mockResolvedValue(false);
    rpc.mockResolvedValue({ data: [{ allowed: true, used: 3 }], error: null });
    const q = await consumeQuota("u1", "marking");
    expect(q).toMatchObject({ ok: true, used: 3, limit: DAILY_LIMITS.marking.free, enforced: true });
    expect(rpc).toHaveBeenCalledWith("consume_api_quota", { p_user: "u1", p_bucket: "marking", p_limit: 10 });
  });

  it("uses the Pro limit and skips the lookup when Pro is already known", async () => {
    rpc.mockResolvedValue({ data: [{ allowed: true, used: 1 }], error: null });
    const q = await consumeQuota("u2", "tutor", true);
    expect(isProUser).not.toHaveBeenCalled();
    expect(q.limit).toBe(DAILY_LIMITS.tutor.pro);
  });

  it("blocks when the database says the limit is reached", async () => {
    isProUser.mockResolvedValue(false);
    rpc.mockResolvedValue({ data: [{ allowed: false, used: 10 }], error: null });
    const q = await consumeQuota("u1", "marking");
    expect(q.ok).toBe(false);
    const res = quotaResponse(q);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toContain("resets at midnight IST");
    expect(body.error).toContain("Pro raises the limit");
  });

  it("fails open, unenforced, before the migration has run", async () => {
    isProUser.mockResolvedValue(false);
    rpc.mockResolvedValue({ data: null, error: { message: "function consume_api_quota does not exist" } });
    const q = await consumeQuota("u1", "drill");
    expect(q).toMatchObject({ ok: true, enforced: false });
  });
});
