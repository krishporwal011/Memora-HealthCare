import { describe, it, expect } from "vitest";
import {
  INITIAL_ASHA_PATIENTS,
  buildSyntheticPdfBlob,
  type AshaPatient,
} from "../ashaModel";

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

describe("B21 — ASHA UI Screens, Triage Labels & PDF Export", () => {
  it("orders assigned patient households strictly by triage need", () => {
    expect(INITIAL_ASHA_PATIENTS).toHaveLength(3);

    // Priority 1: Check-in suggested
    expect(INITIAL_ASHA_PATIENTS[0].triagePriority).toBe(1);
    expect(INITIAL_ASHA_PATIENTS[0].status).toBe("checkin_suggested");
    expect(INITIAL_ASHA_PATIENTS[0].statusLabel).toBe("Check-in suggested");

    // Priority 2: Watch
    expect(INITIAL_ASHA_PATIENTS[1].triagePriority).toBe(2);
    expect(INITIAL_ASHA_PATIENTS[1].status).toBe("watch");
    expect(INITIAL_ASHA_PATIENTS[1].statusLabel).toBe("Watch");

    // Priority 3: Steady
    expect(INITIAL_ASHA_PATIENTS[2].triagePriority).toBe(3);
    expect(INITIAL_ASHA_PATIENTS[2].status).toBe("steady");
    expect(INITIAL_ASHA_PATIENTS[2].statusLabel).toBe("Steady");
  });

  it("ensures every status chip contains full descriptive text label", () => {
    for (const patient of INITIAL_ASHA_PATIENTS) {
      expect(patient.statusLabel.length).toBeGreaterThan(3);
      expect(["Check-in suggested", "Watch", "Steady"]).toContain(patient.statusLabel);
    }
  });

  it("verifies all demo patients are clearly marked synthetic", () => {
    for (const patient of INITIAL_ASHA_PATIENTS) {
      expect(patient.isSynthetic).toBe(true);
    }
  });

  it("generates valid PDF report with statistical evidence and non-diagnostic text", async () => {
    const patient = INITIAL_ASHA_PATIENTS[0]; // Bhaben Baruah with dip
    const blob = buildSyntheticPdfBlob(patient);
    expect(blob.type).toBe("application/pdf");

    const text = await blob.text();
    // Valid PDF structure
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text.trim().endsWith("%%EOF")).toBe(true);

    // Synthetic demo label
    expect(text).toContain("SYNTHETIC DATA");

    // Statistical evidence numbers
    expect(text).toContain("Robust Z-Score");
    expect(text).toContain("-2.85");
    expect(text).toContain("42%");

    // Non-diagnostic conclusion
    expect(text).toContain("Consider a check-up with a doctor");

    // Zero banned diagnostic words
    const lower = text.toLowerCase();
    for (const word of BANNED_CLINICAL_WORDS) {
      expect(lower).not.toContain(word);
    }
  });
});
