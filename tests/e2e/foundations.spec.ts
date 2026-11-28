import { expect, test } from "@playwright/test";

// Phase 1a.1: tokens, fonts and theme plumbing.

test.describe("theme", () => {
  test("follows a light system setting", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(252, 252, 250)");
  });

  test("follows a dark system setting before hydration", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForSelector("body");
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(14, 15, 18)");
  });

  test("a saved choice beats the system setting", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem("sr-theme", "light"));
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  });
});

test("display and text fonts are loaded", async ({ page }) => {
  await page.goto("/");
  const h1 = await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily);
  const body = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(h1).toMatch(/Bricolage/i);
  expect(body).toMatch(/Inter/i);
});

test("area tokens resolve per data-area", async ({ page }) => {
  await page.goto("/");
  const deep = await page.evaluate(() => {
    const el = document.createElement("div");
    el.dataset.area = "compete";
    document.body.appendChild(el);
    return getComputedStyle(el).getPropertyValue("--area-deep").trim();
  });
  expect(deep).toBe("30 64 175");
});

for (const path of ["/", "/privacy", "/about", "/contact"]) {
  for (const scheme of ["light", "dark"] as const) {
    test(`${path} has no horizontal scroll (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}
