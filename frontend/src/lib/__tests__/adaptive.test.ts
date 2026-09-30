import { describe, it, expect } from "vitest";
import {
  calculateProbability,
  calculateK,
  calculateTargetDifficulty,
  updateTheta,
  selectNextItem,
  processAnswer,
  MIN_THETA,
  MAX_THETA,
  LN_3,
  type Item,
  type AdaptiveSessionState,
} from "../adaptive";

describe("Memora Adaptive Engine (1-PL IRT)", () => {
  it("computes logistic probability correctly", () => {
    // When ability equals difficulty, probability is exactly 0.5
    expect(calculateProbability(0.0, 0.0)).toBeCloseTo(0.5, 5);
    expect(calculateProbability(2.0, 2.0)).toBeCloseTo(0.5, 5);

    // Probability when difficulty equals target b* (theta - ln(3)) must be exactly 0.75
    const theta = 0.5;
    const targetB = calculateTargetDifficulty(theta);
    expect(calculateProbability(theta, targetB)).toBeCloseTo(0.75, 5);
  });

  it("decays learning rate K from 0.40 to 0.10 over 30 answers", () => {
    expect(calculateK(0)).toBeCloseTo(0.40, 5);
    expect(calculateK(15)).toBeCloseTo(0.25, 5);
    expect(calculateK(30)).toBeCloseTo(0.10, 5);
    expect(calculateK(50)).toBeCloseTo(0.10, 5); // Clamped at 0.10 minimum
  });

  it("calculates optimal target item difficulty b* = theta - ln(3)", () => {
    expect(calculateTargetDifficulty(0.0)).toBeCloseTo(-LN_3, 5);
    expect(calculateTargetDifficulty(1.5)).toBeCloseTo(1.5 - LN_3, 5);
  });

  it("updates theta in positive direction on correct answer and clamps within [-4, 4]", () => {
    // Correct answer on item with p = 0.75
    const { newTheta: correctTheta } = updateTheta(0.0, -LN_3, true, 0);
    // delta = 0.4 * (1.0 - 0.75) = +0.10
    expect(correctTheta).toBeCloseTo(0.10, 5);

    // Incorrect answer on item with p = 0.75
    const { newTheta: incorrectTheta } = updateTheta(0.0, -LN_3, false, 0);
    // delta = 0.4 * (0.0 - 0.75) = -0.30
    expect(incorrectTheta).toBeCloseTo(-0.30, 5);

    // Extreme clamp check
    const { newTheta: clampedMax } = updateTheta(3.95, -2.0, true, 0);
    expect(clampedMax).toBeLessThanOrEqual(MAX_THETA);

    const { newTheta: clampedMin } = updateTheta(-3.95, 2.0, false, 0);
    expect(clampedMin).toBeGreaterThanOrEqual(MIN_THETA);
  });

  it("selects item closest to b* and respects the 20-item cooldown window", () => {
    const items: Item[] = [
      { id: "item-1", domain: "memory", difficulty: -1.1, content: {} },
      { id: "item-2", domain: "memory", difficulty: -0.5, content: {} },
      { id: "item-3", domain: "memory", difficulty: 0.2, content: {} },
    ];

    // With theta = 0, b* = -1.0986. item-1 is closest.
    const selected1 = selectNextItem(items, 0.0, []);
    expect(selected1?.id).toBe("item-1");

    // When item-1 is in cooldown, item-2 should be selected
    const selected2 = selectNextItem(items, 0.0, ["item-1"]);
    expect(selected2?.id).toBe("item-2");
  });

  it("terminates session on 3 consecutive errors and reduces theta by 0.3", () => {
    const item: Item = { id: "item-1", domain: "memory", difficulty: 0.0, content: {} };
    let state: AdaptiveSessionState = {
      patientId: "patient-123",
      theta: 0.0,
      answersCount: 0,
      consecutiveErrors: 0,
      recentItemIds: [],
      sessionStartTime: Date.now(),
      isTerminated: false,
    };

    // Error 1
    state = processAnswer(state, item, false);
    expect(state.isTerminated).toBe(false);
    expect(state.consecutiveErrors).toBe(1);

    // Error 2
    state = processAnswer(state, item, false);
    expect(state.isTerminated).toBe(false);
    expect(state.consecutiveErrors).toBe(2);

    // Error 3 -> Triggers safety stop!
    const thetaBeforeStop = state.theta;
    state = processAnswer(state, item, false);

    expect(state.isTerminated).toBe(true);
    expect(state.terminationReason).toBe("consecutive_errors");
    // Should have applied 0.3 penalty on top of normal update
    expect(state.theta).toBeLessThan(thetaBeforeStop - 0.25);
  });
});
