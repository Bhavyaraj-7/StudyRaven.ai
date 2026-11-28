import { expect, test } from "@playwright/test";

const SUPPORT = "bsingh10@jpischool.com";

test("About lists every feature with how you get it", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("A study app that marks like an examiner.");
  const features = page.getByRole("region", { name: "Every feature, briefly" });
  for (const name of ["Mock tests", "Mark schemes", "AI tutor", "Studio", "Flashcards", "Schedule", "Stats", "College guide", "Essay coach"]) {
    await expect(features.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await expect(page.getByText("It never writes the essay for you.")).toBeVisible();
});

test("Contact shows the support email and starts topic emails", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("link", { name: SUPPORT }).first()).toHaveAttribute("href", `mailto:${SUPPORT}`);
  await expect(page.getByRole("link", { name: /Email about this.*Billing and refunds/ })).toHaveAttribute(
    "href",
    `mailto:${SUPPORT}?subject=Billing%3A%20`,
  );
  await expect(page.getByRole("button", { name: "Copy email" })).toBeVisible();
});

for (const path of ["/", "/about", "/contact"]) {
  test(`${path} footer carries the support email and About link`, async ({ page }) => {
    await page.goto(path);
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: SUPPORT })).toBeVisible();
    await expect(footer.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });
}

test("legal pages link to About and show the support email", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("link", { name: "About" })).toBeVisible();
  await expect(page.locator("footer").getByRole("link", { name: SUPPORT })).toBeVisible();
});
