import { describe, it, expect } from "vitest";
import {
  createInitialSession,
  handleTurnTimeoutOrError,
  getDefaultOrientationData,
  CULTURAL_ITEM_BANK,
} from "../session";
import { processAnswer } from "../adaptive";

describe("Adaptive Session Flow & Orientation Card (B07)", () => {
  it("initializes session with cultural item bank and adaptive theta", () => {
    const session = createInitialSession("patient-1", 0.0);
    expect(session.state.patientId).toBe("patient-1");
    expect(session.state.theta).toBe(0.0);
    expect(session.currentItem).toBeDefined();
    expect(session.hintShown).toBe(false);
    expect(session.answerRevealed).toBe(false);
  });

  it("handles turn progression with hint-then-answer sequence", () => {
    let session = createInitialSession("patient-1", 0.0);

    // Timeout 1 / Error 1 -> Hint shown
    session = handleTurnTimeoutOrError(session);
    expect(session.hintShown).toBe(true);
    expect(session.answerRevealed).toBe(false);

    // Timeout 2 / Error 2 -> Answer revealed
    session = handleTurnTimeoutOrError(session);
    expect(session.hintShown).toBe(true);
    expect(session.answerRevealed).toBe(true);
  });

  it("enforces 3-consecutive-error safety stop rule", () => {
    const session = createInitialSession("patient-1", 0.0);
    const item = CULTURAL_ITEM_BANK[0];

    let state = session.state;
    state = processAnswer(state, item, false); // error 1
    expect(state.isTerminated).toBe(false);

    state = processAnswer(state, item, false); // error 2
    expect(state.isTerminated).toBe(false);

    state = processAnswer(state, item, false); // error 3 -> Stop!
    expect(state.isTerminated).toBe(true);
    expect(state.terminationReason).toBe("consecutive_errors");
  });

  it("provides complete orientation card data without missing fields", () => {
    const orientation = getDefaultOrientationData();
    expect(orientation.todayDateFormatted.length).toBeGreaterThan(0);
    expect(orientation.nextMedicineText).toContain("medicine");
    expect(orientation.whoIsHomeText).toContain("home");
    expect(orientation.caregiverNote.length).toBeGreaterThan(0);
  });
});
