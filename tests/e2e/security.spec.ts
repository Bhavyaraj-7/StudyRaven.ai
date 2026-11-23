import { expect, test } from "@playwright/test";

test("security headers are sent on pages", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["permissions-policy"]).toContain("microphone=()");
});

test("AI routes refuse anonymous requests", async ({ request }) => {
  for (const path of ["/api/mocks/grade", "/api/ai-paper", "/api/drill", "/api/tutor/chat"]) {
    const res = await request.post(path, { data: {} });
    expect(res.status(), path).toBe(401);
  }
});
