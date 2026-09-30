import { test, expect } from "@playwright/test";

test.describe("Memora Role Routes Smoke Tests", () => {
  test("Patient role route (/en/play) renders with 64px target and accessible copy", async ({ page }) => {
    await page.goto("http://localhost:3000/en/play");
    await expect(page.locator("h2")).toContainText("Today's Activities");
    
    // Check patient primary button meets minimum 64px touch target requirement
    const playBtn = page.locator(".btn-patient");
    await expect(playBtn).toBeVisible();
    const box = await playBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(64);

    // Ensure no banned diagnostic terms appear in page text
    const content = await page.content();
    expect(content.toLowerCase()).not.toContain("alzheimer");
    expect(content.toLowerCase()).not.toContain("dementia stage");
  });

  test("Caregiver portal route (/en/care) renders dashboard placeholders and unwell toggle", async ({ page }) => {
    await page.goto("http://localhost:3000/en/care");
    await expect(page.locator("h2")).toContainText("Caregiver Dashboard");
    await expect(page.locator("#unwell-toggle")).toBeVisible();
  });

  test("ASHA worker route (/en/asha) renders assigned elder triage list and export button", async ({ page }) => {
    await page.goto("http://localhost:3000/en/asha");
    await expect(page.locator("h2")).toContainText("ASHA Community Overview");
    await expect(page.getByText("Check-in suggested")).toBeVisible();
    await expect(page.getByText("Download Summary (PDF)")).toBeVisible();
  });
});
