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
