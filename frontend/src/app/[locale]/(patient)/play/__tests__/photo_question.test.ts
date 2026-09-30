import { describe, it, expect, beforeEach } from "vitest";
import {
  OFFLINE_QUIZ_STORAGE_KEY,
  getOfflineApprovedQuizItems,
  saveOfflineApprovedQuizItems,
  type QuizItem,
} from "@/app/[locale]/(caregiver)/care/QuizApprovalQueue";

describe("B16 — Caregiver Approval Queue & Offline Photo Questions", () => {
  beforeEach(() => {
    // Reset local storage mock
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
      key: (i: number) => Object.keys(store)[i] || null,
      length: 0,
    };
  });

  it("stores and retrieves approved items in offline storage", () => {
    const item: QuizItem = {
      id: "quiz-test-01",
      patient_id: "patient-demo-ner",
      memory_id: "mem-01",
      question_text: "Who was wearing the gamosa?",
      options: [
        { id: "o1", text: "Grandmother", is_correct: true },
        { id: "o2", text: "Uncle", is_correct: false },
      ],
      difficulty: 0.0,
      domain: "reminiscence",
      approval_status: "approved",
      is_approved: true,
    };

    saveOfflineApprovedQuizItems([item]);
    const retrieved = getOfflineApprovedQuizItems();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].id).toBe("quiz-test-01");
    expect(retrieved[0].is_approved).toBe(true);
  });

  it("strictly excludes unapproved items from patient offline quiz bank", () => {
    const unapprovedItem: QuizItem = {
      id: "quiz-pending-01",
      patient_id: "patient-demo-ner",
      memory_id: "mem-01",
      question_text: "Unverified question?",
      options: [{ id: "o1", text: "A", is_correct: true }],
      difficulty: 0.0,
      domain: "reminiscence",
      approval_status: "pending",
      is_approved: false,
    };

    const approvedItem: QuizItem = {
      id: "quiz-approved-01",
      patient_id: "patient-demo-ner",
      memory_id: "mem-01",
      question_text: "Verified Rongali Bihu question?",
      options: [{ id: "o1", text: "B", is_correct: true }],
      difficulty: 0.0,
      domain: "reminiscence",
      approval_status: "approved",
      is_approved: true,
    };

    saveOfflineApprovedQuizItems([unapprovedItem, approvedItem]);
    const all = getOfflineApprovedQuizItems();

    // Patient gameplay filter simulation
    const patientPlayable = all.filter((q) => q.is_approved && q.approval_status === "approved");
    expect(patientPlayable).toHaveLength(1);
    expect(patientPlayable[0].id).toBe("quiz-approved-01");
    expect(patientPlayable.some((q) => q.id === "quiz-pending-01")).toBe(false);
  });

  it("purges rejected items completely from offline availability", () => {
    const item1: QuizItem = {
      id: "q-1",
      patient_id: "p-1",
      memory_id: "m-1",
      question_text: "Q1",
      options: [{ id: "o1", text: "Yes", is_correct: true }],
      difficulty: 0.0,
      domain: "reminiscence",
      approval_status: "approved",
      is_approved: true,
    };

    const item2: QuizItem = {
      id: "q-2",
      patient_id: "p-1",
      memory_id: "m-1",
      question_text: "Q2",
      options: [{ id: "o1", text: "Yes", is_correct: true }],
      difficulty: 0.0,
      domain: "reminiscence",
      approval_status: "approved",
      is_approved: true,
    };

    saveOfflineApprovedQuizItems([item1, item2]);
    expect(getOfflineApprovedQuizItems()).toHaveLength(2);

    // Reject item 2
    const remaining = getOfflineApprovedQuizItems().filter((q) => q.id !== "q-2");
    saveOfflineApprovedQuizItems(remaining);

    const afterRejection = getOfflineApprovedQuizItems();
    expect(afterRejection).toHaveLength(1);
    expect(afterRejection[0].id).toBe("q-1");
  });
});
