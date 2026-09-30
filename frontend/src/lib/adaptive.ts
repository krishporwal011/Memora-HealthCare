/**
 * Memora Adaptive Difficulty Engine (1-PL Item Response Theory / Elo formulation)
 * Must remain in exact parity with backend/app/services/adaptive.py
 */

export interface Item {
  id: string;
  domain: string;
  difficulty: number; // b parameter in [-4.0, 4.0]
  content: unknown;
}

export interface AdaptiveSessionState {
  patientId: string;
  theta: number; // ability estimate in [-4.0, 4.0]
  answersCount: number;
  consecutiveErrors: number;
  recentItemIds: string[]; // Cooldown window of last 20 answered items
  sessionStartTime: number; // Milliseconds timestamp
  isTerminated: boolean;
  terminationReason?: "consecutive_errors" | "time_limit" | "normal";
}

export const MIN_THETA = -4.0;
export const MAX_THETA = 4.0;
export const TARGET_SUCCESS_RATE = 0.75;
export const LN_3 = Math.log(3); // ln(3) ≈ 1.0986122886681098
export const COOLDOWN_WINDOW_SIZE = 20;
export const MAX_CONSECUTIVE_ERRORS = 3;
export const CONSECUTIVE_ERROR_PENALTY = 0.3;
export const SESSION_MAX_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Logistic sigmoid function: probability of a correct response.
 * p = 1 / (1 + exp(-(theta - b)))
 */
export function calculateProbability(theta: number, b: number): number {
  const z = theta - b;
  return 1 / (1 + Math.exp(-z));
}

/**
 * Calculate dynamic learning rate K.
 * Decays linearly from 0.40 to 0.10 over the first 30 answers.
 */
export function calculateK(answersCount: number): number {
  const progress = Math.min(Math.max(answersCount / 30, 0), 1.0);
  return 0.40 - 0.30 * progress;
}

/**
 * Calculate optimal target item difficulty b* to yield 75% expected success.
 * Since p = 0.75 => theta - b* = ln(0.75 / 0.25) = ln(3) => b* = theta - ln(3)
 */
export function calculateTargetDifficulty(theta: number): number {
  return theta - LN_3;
}

/**
 * Update ability theta given user answer y (1 = correct, 0 = incorrect).
 */
export function updateTheta(
  theta: number,
  itemDifficulty: number,
  correct: boolean,
  answersCount: number
): { newTheta: number; p: number; K: number } {
  const y = correct ? 1.0 : 0.0;
  const p = calculateProbability(theta, itemDifficulty);
  const K = calculateK(answersCount);

  let updated = theta + K * (y - p);
  // Clamp theta to [-4.0, 4.0]
  updated = Math.min(Math.max(updated, MIN_THETA), MAX_THETA);

  return { newTheta: updated, p, K };
}

/**
 * Select the best next item from an item bank:
 * 1. Exclude the last 20 answered items (cooldown).
 * 2. If all items in domain are in cooldown, relax cooldown to avoid deadlocks.
 * 3. Choose the item with difficulty closest to b* = theta - ln(3).
 */
export function selectNextItem(
  availableItems: Item[],
  theta: number,
  recentItemIds: string[]
): Item | null {
  if (availableItems.length === 0) return null;

  const cooldownSet = new Set(recentItemIds.slice(-COOLDOWN_WINDOW_SIZE));
  let candidates = availableItems.filter((item) => !cooldownSet.has(item.id));

  // If every item is in cooldown, fallback to full pool
  if (candidates.length === 0) {
    candidates = availableItems;
  }

  const targetB = calculateTargetDifficulty(theta);

  // Find candidate minimizing |item.difficulty - targetB|
  let bestItem = candidates[0];
  let minDiff = Math.abs(bestItem.difficulty - targetB);

  for (let i = 1; i < candidates.length; i++) {
    const diff = Math.abs(candidates[i].difficulty - targetB);
    if (diff < minDiff) {
      minDiff = diff;
      bestItem = candidates[i];
    }
  }

  return bestItem;
}

/**
 * Process a user response within a session state and enforce safety stop rules.
 */
export function processAnswer(
  state: AdaptiveSessionState,
  item: Item,
  correct: boolean
): AdaptiveSessionState {
  const now = Date.now();
  const sessionDuration = now - state.sessionStartTime;

  // 1. Time cap safety check (10 minutes)
  if (sessionDuration >= SESSION_MAX_DURATION_MS) {
    return {
      ...state,
      isTerminated: true,
      terminationReason: "time_limit",
    };
  }

  // 2. Track consecutive errors
  const newConsecutiveErrors = correct ? 0 : state.consecutiveErrors + 1;

  // 3. Update theta
  const { newTheta } = updateTheta(
    state.theta,
    item.difficulty,
    correct,
    state.answersCount
  );

  // 4. Update recent item ids (rolling window)
  const newRecentItemIds = [...state.recentItemIds, item.id].slice(-COOLDOWN_WINDOW_SIZE);

  // 5. 3 consecutive errors safety stop
  if (newConsecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
    // Reduce theta by 0.3 penalty
    const penalizedTheta = Math.max(newTheta - CONSECUTIVE_ERROR_PENALTY, MIN_THETA);
    return {
      ...state,
      theta: penalizedTheta,
      answersCount: state.answersCount + 1,
      consecutiveErrors: newConsecutiveErrors,
      recentItemIds: newRecentItemIds,
      isTerminated: true,
      terminationReason: "consecutive_errors",
    };
  }

  return {
    ...state,
    theta: newTheta,
    answersCount: state.answersCount + 1,
    consecutiveErrors: newConsecutiveErrors,
    recentItemIds: newRecentItemIds,
    isTerminated: false,
  };
}
