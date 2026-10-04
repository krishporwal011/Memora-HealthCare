"use client";

import { useState, useEffect } from "react";
import { Check, X, Sparkles, Camera } from "lucide-react";

export interface QuizOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface QuizItem {
  id: string;
  patient_id: string;
  memory_id: string;
  question_text: string;
  options: QuizOption[];
  difficulty: number;
  domain: string;
  image_url?: string;
  approval_status: "pending" | "approved" | "rejected";
  is_approved: boolean;
  reviewed_at?: string;
  photo_title?: string;
}

export const OFFLINE_QUIZ_STORAGE_KEY = "memora_offline_approved_quiz_items";

export function getOfflineApprovedQuizItems(): QuizItem[] {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(OFFLINE_QUIZ_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }
  } catch {
    return [];
  }
  return [];
}

export function saveOfflineApprovedQuizItems(items: QuizItem[]): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(OFFLINE_QUIZ_STORAGE_KEY, JSON.stringify(items));
    }
  } catch (e) {
    console.error("Failed to save approved quiz items offline", e);
  }
}

export const INITIAL_DEMO_QUESTIONS: QuizItem[] = [
  {
    id: "quiz-bihu-01",
    patient_id: "patient-demo-ner",
    memory_id: "mem-01",
    question_text: "Who is receiving the phulam gamosa in the Tezpur photo?",
    photo_title: "Rongali Bihu 1985 Celebration",
    image_url: "🌸",
    options: [
      { id: "opt-1", text: "Grandmother", is_correct: true },
      { id: "opt-2", text: "Uncle Hemen", is_correct: false },
      { id: "opt-3", text: "Neighbor Pradip", is_correct: false },
    ],
    difficulty: 0.0,
    domain: "reminiscence",
    approval_status: "pending",
    is_approved: false,
  },
  {
    id: "quiz-bihu-02",
    patient_id: "patient-demo-ner",
    memory_id: "mem-01",
    question_text: "Which festive occasion is celebrated in this family gathering?",
    photo_title: "Ancestral Courtyard in Tezpur",
    image_url: "🌾",
    options: [
      { id: "opt-1", text: "Rongali Bihu", is_correct: true },
      { id: "opt-2", text: "Durga Puja", is_correct: false },
      { id: "opt-3", text: "Diwali", is_correct: false },
    ],
    difficulty: 0.1,
    domain: "reminiscence",
    approval_status: "pending",
    is_approved: false,
  },
];

interface QuizApprovalQueueProps {
  patientId: string;
}

export function QuizApprovalQueue({ patientId }: QuizApprovalQueueProps) {
  const [pendingItems, setPendingItems] = useState<QuizItem[]>(INITIAL_DEMO_QUESTIONS);
  const [approvedItems, setApprovedItems] = useState<QuizItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const existing = getOfflineApprovedQuizItems();
    setApprovedItems(existing);
  }, []);

  const handleApprove = (item: QuizItem) => {
    const approved: QuizItem = {
      ...item,
      approval_status: "approved",
      is_approved: true,
      reviewed_at: new Date().toISOString(),
    };

    // Remove from pending
    const remainingPending = pendingItems.filter((q) => q.id !== item.id);
    setPendingItems(remainingPending);

    // Save to approved list and offline cache
    const updatedApproved = [approved, ...approvedItems.filter((q) => q.id !== item.id)];
    setApprovedItems(updatedApproved);
    saveOfflineApprovedQuizItems(updatedApproved);

    setNotice(`Approved: "${item.question_text}" is now available offline for the elder.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleReject = (item: QuizItem) => {
    // Remove from pending without adding to approved
    setPendingItems((prev) => prev.filter((q) => q.id !== item.id));

    // Ensure it is purged from offline storage if previously present
    const updatedApproved = approvedItems.filter((q) => q.id !== item.id);
    setApprovedItems(updatedApproved);
    saveOfflineApprovedQuizItems(updatedApproved);

    setNotice(`Rejected: Question permanently discarded. It will never reach the elder.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleRevoke = (item: QuizItem) => {
    const updated = approvedItems.filter((q) => q.id !== item.id);
    setApprovedItems(updated);
    saveOfflineApprovedQuizItems(updated);

    // Return to pending queue
    const restored: QuizItem = {
      ...item,
      approval_status: "pending",
      is_approved: false,
    };
    setPendingItems((prev) => [restored, ...prev]);

    setNotice(`Revoked: Question removed from offline play.`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-xs space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[var(--ink)]">AI Question Approval Queue</h3>
            {pendingItems.length > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent)] text-white">
                {pendingItems.length} awaiting review
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--ink-soft)] mt-1">
            Caregiver safety gate: Unapproved questions are <strong>never</strong> served to the elder. Approved questions become immediately available for offline play.
          </p>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--border)] px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      )}

      {/* PENDING ITEMS */}
      <div className="space-y-4">
        {pendingItems.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-center space-y-1">
            <Sparkles className="w-8 h-8 mx-auto text-[var(--accent)]" aria-hidden="true" />
            <p className="text-sm font-semibold text-[var(--ink)]">Queue is Clear</p>
            <p className="text-xs text-[var(--ink-soft)]">
              All AI-generated reminiscence questions have been reviewed. New items appear here when memories are added.
            </p>
          </div>
        ) : (
          pendingItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[var(--bg)] border-2 border-[var(--accent-light)] space-y-4 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl bg-white border border-[var(--border)] flex items-center justify-center text-2xl shrink-0"
                    aria-hidden="true"
                  >
                    <Camera className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-dark)] bg-[var(--accent-light)] px-2 py-0.5 rounded-md border border-[var(--accent)]">
                      AI Question • {item.photo_title || "Family Memory"}
                    </span>
                    <h4 className="text-base font-bold text-[var(--ink)] mt-1.5 leading-snug">
                      {item.question_text}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Options with correct indicator */}
              <div className="space-y-2 pl-2 border-l-2 border-[var(--border)]">
                <span className="text-xs font-semibold text-[var(--ink-soft)] block">Answer Options:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {item.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-1.5 ${
                        opt.is_correct
                          ? "bg-[var(--primary-light)] border-[var(--primary-dark)] text-[var(--primary)] font-bold"
                          : "bg-white border-[var(--border)] text-[var(--ink-soft)]"
                      }`}
                    >
                      <span>{opt.text}</span>
                      {opt.is_correct && (
                        <span className="text-[10px] text-[var(--primary)] bg-white px-1.5 py-0.5 rounded-md border border-[var(--border)]">
                          ✓ Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  id={`reject-btn-${item.id}`}
                  onClick={() => handleReject(item)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--alert)] hover:bg-[var(--alert-light)] border border-[var(--alert)] transition-colors inline-flex items-center gap-1.5"
                  style={{ minHeight: "40px" }}
                >
                  <X className="w-4 h-4" />
                  <span>Reject Question</span>
                </button>
                <button
                  type="button"
                  id={`approve-btn-${item.id}`}
                  onClick={() => handleApprove(item)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white shadow-xs transition-colors inline-flex items-center gap-1.5"
                  style={{ minHeight: "40px" }}
                >
                  <Check className="w-4 h-4" />
                  <span>Approve for Elder</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* APPROVED ITEMS SECTION */}
      {approvedItems.length > 0 && (
        <div className="pt-4 border-t border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[var(--ink)]">
              Active in Elder's Offline Bank ({approvedItems.length})
            </h4>
            <span className="text-[11px] font-semibold text-[var(--primary)]">
              Ready for offline play
            </span>
          </div>

          <div className="space-y-2">
            {approvedItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-[var(--ink)] block">{item.question_text}</span>
                    <span className="text-[11px] text-[var(--ink-soft)]">
                      Correct: {item.options.find((o) => o.is_correct)?.text}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRevoke(item)}
                  className="text-xs text-[var(--alert)] hover:underline shrink-0 p-1"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
