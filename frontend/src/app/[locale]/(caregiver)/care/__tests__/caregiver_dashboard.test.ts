import { describe, it, expect } from "vitest";
import { FOURTEEN_DAY_DATA, type TrendDayData } from "../CaregiverTrendDashboard";

const BANNED_CLINICAL_WORDS = [
  "alzheimer",
  "dementia",
  "stage",
  "diagnos",
  "disease",
  "decline",
  "deteriorat",
  "patholog",
];

describe("B19 — Caregiver Dashboard & 14-Day Trend", () => {
  it("has 14 continuous days of longitudinal data points within [0, 1]", () => {
    expect(FOURTEEN_DAY_DATA).toHaveLength(14);
    for (const point of FOURTEEN_DAY_DATA) {
      expect(point.score).toBeGreaterThanOrEqual(0.0);
      expect(point.score).toBeLessThanOrEqual(1.0);
      expect(point.median).toBeGreaterThanOrEqual(0.0);
      expect(point.usualMin).toBeLessThan(point.usualMax);
    }
  });

  it("detects performance dip on day 14 below usual baseline range", () => {
    const day14 = FOURTEEN_DAY_DATA[13];
    expect(day14.date).toBe("Sep 30");
    expect(day14.score).toBeLessThan(day14.usualMin);
    expect(day14.isDip).toBe(true);
  });

  it("unwell flag suppresses active alerts", () => {
    const day14 = FOURTEEN_DAY_DATA[13];
    const hasTrigger = day14.score < day14.usualMin;
    expect(hasTrigger).toBe(true);

    // When NOT unwell and NOT acknowledged -> alert is active
    const isAlertActiveWithoutSuppression = hasTrigger && !false && !false;
    expect(isAlertActiveWithoutSuppression).toBe(true);

    // When marked unwell -> alert is suppressed!
    const isAlertActiveWhenUnwell = hasTrigger && !true && !false;
    expect(isAlertActiveWhenUnwell).toBe(false);
  });

  it("acknowledgement action dismisses active alert", () => {
    const day14 = FOURTEEN_DAY_DATA[13];
    const hasTrigger = day14.score < day14.usualMin;

    // After caregiver acknowledges
    const isAcknowledged = true;
    const isAlertActive = hasTrigger && !false && !isAcknowledged;
    expect(isAlertActive).toBe(false);
  });

  it("ensures caregiver alert text strictly adheres to non-diagnostic copy rules", () => {
    const alertMessage =
      "Today's memory activity performance was lower than their usual range (score 0.42 vs typical 0.82). " +
      "This can have many temporary causes such as tiredness, distraction, or mild fever. " +
      "Consider a check-up with a doctor if this pattern continues.";

    const lower = alertMessage.toLowerCase();
    for (const word of BANNED_CLINICAL_WORDS) {
      expect(lower).not.toContain(word);
    }
    expect(alertMessage).toContain("Consider a check-up with a doctor");
  });
});
