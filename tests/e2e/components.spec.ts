import { expect, test } from "@playwright/test";

test("switcher moves with arrow keys and stays a radio group", async ({ page }) => {
  await page.goto("/dev/components");
  const group = page.getByRole("radiogroup", { name: "Subject" }).first();
  await group.getByRole("radio", { name: "Physics" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(group.getByRole("radio", { name: "Chemistry" })).toHaveAttribute("aria-checked", "true");
  await expect(group.getByRole("radio", { name: "Chemistry" })).toBeFocused();
});

test("progress bar reports its value", async ({ page }) => {
  await page.goto("/dev/components");
  const bar = page.getByRole("progressbar", { name: "Profile strength" }).first();
  await expect(bar).toHaveAttribute("aria-valuenow", "35");
  await page.getByRole("button", { name: "Add progress" }).first().click();
  await expect(bar).toHaveAttribute("aria-valuenow", "60");
});

test("a disabled button shows its reason", async ({ page }) => {
  await page.goto("/dev/components");
  await expect(page.getByText("Answer at least one question first")).toBeVisible();
});

test("a marked score counts up to the real total and announces it once", async ({ page }) => {
  await page.goto("/dev/components");
  const section = page.locator("section", { hasText: "Marked score" });
  await expect(section.getByText("Marked: 31 out of 40. Predicted grade A.")).toHaveCount(1);
  await page.getByRole("button", { name: "Replay marking" }).click();
  await page.getByRole("button", { name: "Replay marking" }).click();
  // Replaying swaps the card; it never stacks a second one.
  await expect(section.getByText("Raw score")).toHaveCount(1);
  await expect(section.locator('[aria-hidden="true"]', { hasText: /^31$/ })).toBeVisible();
  await expect(section.getByText("Predicted from this mock, not an official grade")).toBeVisible();
});

test("reduced motion shows the final score at once and skips confetti", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dev/components");
  const section = page.locator("section", { hasText: "Marked score" });
  await page.getByRole("button", { name: "Replay marking" }).click();
  await expect(section.locator('[aria-hidden="true"]', { hasText: /^31$/ })).toBeVisible({ timeout: 200 });
  await page.getByRole("button", { name: "Celebrate" }).click();
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("an error message is announced as an alert", async ({ page }) => {
  await page.goto("/dev/components");
  await page.getByRole("button", { name: "Show an error" }).click();
  const alert = page.getByRole("alert").filter({ hasText: "over 10 MB" });
  await expect(alert).toBeVisible();
  expect(await alert.evaluate((el) => getComputedStyle(el).animationName)).toBe("shake");
});

test("the welcome film plays in a dialog and Esc closes it at once", async ({ page }) => {
  await page.goto("/dev/components");
  await page.getByRole("button", { name: "Play welcome film" }).click();
  const dialog = page.getByRole("dialog", { name: "Welcome to StudyRaven, Aarav" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Skip" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("reduced motion gets the still welcome card and never downloads Remotion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const scripts: string[] = [];
  page.on("response", async (r) => {
    if (r.request().resourceType() === "script") scripts.push(await r.text().catch(() => ""));
  });
  await page.goto("/dev/components");
  await page.getByRole("button", { name: "Show still version" }).click();
  const dialog = page.getByRole("dialog", { name: "Welcome to StudyRaven, Aarav" });
  await expect(dialog.getByText("Take your first mock when you're ready.")).toBeVisible();
  await expect(dialog.getByRole("list", { name: "Your subjects" }).getByRole("listitem")).toHaveCount(4);
  expect(scripts.some((s) => s.includes("acknowledgeRemotionLicense"))).toBe(false);
});
