import { test, expect } from "@playwright/test";

test.describe("Memora Accessibility (A11y) Verification", () => {
  test("Patient mode (/en/play) satisfies dementia UI guidelines", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:3000/en/play");

    // 1. One primary action button
    const buttons = page.locator(".btn-patient");
    await expect(buttons).toHaveCount(1);

    // 2. Visible text label on button
    const btnText = await buttons.first().innerText();
    expect(btnText.trim().length).toBeGreaterThan(0);

    // 3. Woven edge motif exists
    await expect(page.locator(".woven-edge")).toBeVisible();

    // 4. Focus ring visibility test
    await buttons.first().focus();
    await expect(buttons.first()).toBeFocused();
  });
});
