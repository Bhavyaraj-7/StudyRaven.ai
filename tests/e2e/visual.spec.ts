import { expect, test } from "@playwright/test";

// Visual regression (§5.7 D): key public screens at 360 and 1440 (projects),
// light and dark. Update deliberately: npx playwright test --grep @visual -u
const SCREENS = ["/", "/login", "/privacy"];

for (const path of SCREENS) {
  for (const scheme of ["light", "dark"] as const) {
    test(`@visual ${path} (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto(path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const name = `${path === "/" ? "home" : path.slice(1)}-${scheme}.png`;
      await expect(page).toHaveScreenshot(name, { fullPage: true, animations: "disabled", maxDiffPixelRatio: 0.01 });
    });
  }
}
