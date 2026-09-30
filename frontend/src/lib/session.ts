/**
 * Memora Patient Adaptive Session Engine & Orientation Manager.
 * Orchestrates dynamic item selection, 20-second hint-then-answer progression,
 * 3-consecutive-error stop rules, and orientation card state.
 */

import {
  Item,
  AdaptiveSessionState,
  calculateProbability,
  calculateTargetDifficulty,
  selectNextItem,
  processAnswer,
  MIN_THETA,
  MAX_THETA,
} from "./adaptive";

export interface OrientationCardData {
  todayDateFormatted: string;
  nextMedicineText: string;
  whoIsHomeText: string;
  caregiverNote: string;
}

export interface SessionContext {
  state: AdaptiveSessionState;
  currentItem: Item | null;
  hintShown: boolean;
  answerRevealed: boolean;
  itemPresentedTime: number;
}

export const CULTURAL_ITEM_BANK: Item[] = [
  { id: "item-gamosa", domain: "memory_match", difficulty: -1.2, content: { name: "Gamosa", icon: "🧣", hint: "Red and white woven cloth" } },
  { id: "item-chai", domain: "memory_match", difficulty: -0.8, content: { name: "Chai Leaf", icon: "🍃", hint: "Green fresh garden leaf" } },
  { id: "item-dhol", domain: "memory_match", difficulty: -0.3, content: { name: "Dhol Drum", icon: "🥁", hint: "Musical instrument used in Bihu" } },
  { id: "item-jaapi", domain: "memory_match", difficulty: 0.2, content: { name: "Jaapi Hat", icon: "👒", hint: "Traditional conical farmer hat" } },
  { id: "item-kaziranga", domain: "memory_match", difficulty: 0.8, content: { name: "Rhino", icon: "🦏", hint: "One-horned animal of Kaziranga" } },
  { id: "item-kopou", domain: "memory_match", difficulty: 1.4, content: { name: "Kopou Orchid", icon: "🌸", hint: "Foxtail orchid worn during festival" } },
];

export function createInitialSession(patientId: string, initialTheta = 0.0): SessionContext {
  const state: AdaptiveSessionState = {
    patientId,
    theta: initialTheta,
    answersCount: 0,
    consecutiveErrors: 0,
    recentItemIds: [],
    sessionStartTime: Date.now(),
    isTerminated: false,
  };

  const currentItem = selectNextItem(CULTURAL_ITEM_BANK, initialTheta, []);

  return {
    state,
    currentItem,
    hintShown: false,
    answerRevealed: false,
    itemPresentedTime: Date.now(),
  };
}

export function handleTurnTimeoutOrError(context: SessionContext): SessionContext {
  if (!context.hintShown) {
    // Stage 1: Reveal gentle visual hint
    return {
      ...context,
      hintShown: true,
      answerRevealed: false,
    };
  } else {
    // Stage 2: Reveal answer gracefully without patronising or penalizing harshly
    return {
      ...context,
      answerRevealed: true,
    };
  }
}

export function getDefaultOrientationData(): OrientationCardData {
  return {
    todayDateFormatted: new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    nextMedicineText: "Next medicine: Eye drops & multivitamin after lunch (2:00 PM)",
    whoIsHomeText: "Who is home today: Daughter Ananya is in the living room",
    caregiverNote: "A jug of warm ginger water is kept on your side table.",
  };
}
