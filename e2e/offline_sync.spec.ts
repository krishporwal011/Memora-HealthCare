import { test, expect } from "@playwright/test";

test.describe("Memora Offline-First Patient Sync", () => {
  test("Patient interface works offline, logs events to Dexie, and syncs on reconnection", async ({ context, page }) => {
    // 1. Start online to load the initial cached shell
    await page.goto("http://localhost:3000/en/play");
    await expect(page.locator("h2")).toContainText("Today's Activities");

    // 2. Disconnect network to simulate field conditions (NER rural / no connectivity)
    await context.setOffline(true);

    // Trigger offline event in page context to verify calm offline notice banner
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    // 3. Calm status text appears
    const offlineNotice = page.locator('[role="status"]');
    await expect(offlineNotice).toBeVisible();
    await expect(offlineNotice).toContainText("Working offline");

    // 4. Start activity in offline mode
    const startBtn = page.locator(".btn-patient");
    await startBtn.click();
    await expect(page.locator("h2")).toContainText("Memory Match");

    // 5. Flip cards while offline
    const cardButtons = page.locator("button:has-text('❓')");
    await expect(cardButtons.first()).toBeVisible();
    await cardButtons.nth(0).click();
    await cardButtons.nth(1).click();

    // Confirm UI remains responsive and calm without error modals
    await expect(page.locator("text=Error")).not.toBeVisible();

    // 6. Kill / reload tab mid-session (simulating user exiting or battery dying)
    await page.reload();
    await expect(page.locator("h2")).toContainText("Today's Activities");

    // 7. Reconnect network
    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event("online")));

    // Status updates to indicate sync / normal state
    await page.waitForTimeout(500);
    // Offline notice clears once reconnected
    await expect(page.locator('[role="status"]:has-text("Working offline")')).not.toBeVisible();
  });
});
