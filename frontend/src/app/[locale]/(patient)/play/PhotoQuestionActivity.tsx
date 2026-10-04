"use client";

import { useState, useEffect, useRef } from "react";
import { Image, Camera, Check, ArrowRight } from "lucide-react";
import { BigButton } from "@/components/patient/BigButton";
import { recordGameEventOffline } from "@/lib/offline";
import { syncAllUnsynced } from "@/lib/sync";
import {
  getOfflineApprovedQuizItems,
  type QuizItem,
} from "@/app/[locale]/(caregiver)/care/QuizApprovalQueue";

interface PhotoQuestionActivityProps {
  patientId: string;
  onComplete: () => void;
  onExit: () => void;
}

export const FALLBACK_APPROVED_QUESTIONS: QuizItem[] = [
  {
    id: "quiz-fallback-01",
    patient_id: "patient-demo-ner",
    memory_id: "mem-01",
    question_text: "Who is receiving the phulam gamosa in the Tezpur photo?",
    photo_title: "Rongali Bihu (1985) in Tezpur",
    image_url: "🌸",
    options: [
      { id: "opt-1", text: "Grandmother", is_correct: true },
      { id: "opt-2", text: "Uncle Hemen", is_correct: false },
      { id: "opt-3", text: "Neighbor Pradip", is_correct: false },
    ],
    difficulty: 0.0,
    domain: "reminiscence",
    approval_status: "approved",
    is_approved: true,
  },
];

export function PhotoQuestionActivity({
  patientId,
  onComplete,
  onExit,
}: PhotoQuestionActivityProps) {
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const turnStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Read offline approved questions strictly filtered to approved items
    const offlineItems = getOfflineApprovedQuizItems().filter(
      (q) => q.is_approved && q.approval_status === "approved"
    );

    if (offlineItems.length > 0) {
      setQuestions(offlineItems);
    } else {
      // Use standard pre-approved reminiscence fallback for synthetic demo
      setQuestions(FALLBACK_APPROVED_QUESTIONS);
    }
    turnStartTimeRef.current = Date.now();
  }, []);

  const currentQ = questions[currentIndex];

  const handleSelectOption = async (optionId: string, isCorrect: boolean) => {
    if (isAnswered || !currentQ) return;

    setIsAnswered(true);
    setSelectedOptionId(optionId);
    const responseTimeMs = Date.now() - turnStartTimeRef.current;

    // Adult non-patronizing feedback
    const correctOpt = currentQ.options.find((o) => o.is_correct);
    if (isCorrect) {
      setFeedback(`That is right: ${correctOpt?.text}.`);
    } else {
      setFeedback(`Here is the memory: ${correctOpt?.text}.`);
    }

    // Record offline game event
    try {
      await recordGameEventOffline({
        patient_id: patientId,
        session_id: `photo-session-${Date.now()}`,
        domain: "reminiscence_photo",
        item_id: currentQ.id,
        difficulty: currentQ.difficulty,
        correct: isCorrect,
        response_time_ms: responseTimeMs,
      });
      // Opportunistic sync if online
      syncAllUnsynced().catch(() => {});
    } catch (e) {
      console.error("Failed to record photo question event offline", e);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setFeedback(null);
      setIsAnswered(false);
      turnStartTimeRef.current = Date.now();
    } else {
      onComplete();
    }
  };

  if (!currentQ) {
    return (
      <div className="bg-white rounded-3xl p-6 border-3 border-[var(--primary)] text-center space-y-4">
        <Image className="w-10 h-10 mx-auto text-[var(--primary)]" aria-hidden="true" />
        <h3 className="text-xl font-bold text-[var(--primary)]">No Photo Questions Available</h3>
        <p className="text-sm text-[var(--ink-soft)]">
          Your caregiver has not approved any photo questions yet.
        </p>
        <BigButton label="Return to Activities" variant="primary" onClick={onExit} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto w-full">
      {/* Photo Memory Display */}
      <div className="bg-white rounded-3xl p-6 border-3 border-[var(--primary)] shadow-sm text-center space-y-4">
        <div
          className="w-24 h-24 mx-auto rounded-2xl bg-[var(--bg)] flex items-center justify-center text-5xl border-2 border-[var(--primary)] shadow-xs"
          aria-hidden="true"
        >
          {currentQ.image_url ? (
            <img src={currentQ.image_url} alt="" className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <Camera className="w-12 h-12 text-[var(--primary)]" />
          )}
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] bg-[var(--bg)] px-3 py-1 rounded-full border border-[var(--border)]">
            {currentQ.photo_title || "Family Memory Photo"}
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--primary)] mt-3 leading-snug">
            {currentQ.question_text}
          </h2>
        </div>
      </div>

      {/* Answer Options Grid (Strict min 72px touch targets) */}
      <div className="space-y-3" role="group" aria-label="Answer options">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id;
          let btnStyle = "bg-white border-[var(--primary)] text-[var(--ink)] hover:bg-[var(--surface-hover)]";

          if (isAnswered) {
            if (opt.is_correct) {
              btnStyle = "bg-[var(--primary-light)] border-[var(--primary-dark)] text-[var(--primary)] font-bold";
            } else if (isSelected && !opt.is_correct) {
              btnStyle = "bg-[var(--alert-light)] border-[var(--alert)] text-[var(--alert)]";
            } else {
              btnStyle = "bg-white border-[var(--border)] text-[var(--ink-muted)] opacity-60";
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              id={`photo-opt-${idx + 1}`}
              onClick={() => handleSelectOption(opt.id, opt.is_correct)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-2xl border-3 flex items-center justify-between text-left text-lg font-bold transition-all shadow-xs cursor-pointer ${btnStyle}`}
              style={{ minHeight: "72px" }}
              aria-label={opt.text}
            >
              <span>{opt.text}</span>
              {isAnswered && opt.is_correct && (
                <Check className="w-6 h-6 text-[var(--primary)]" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-2xl bg-[var(--bg)] border-2 border-[var(--primary)] text-center"
        >
          <p className="text-base font-bold text-[var(--primary)]">{feedback}</p>
        </div>
      )}

      {/* Next or Calm Break */}
      <div className="pt-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onExit}
          className="text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] underline py-2 px-3"
          style={{ minHeight: "44px" }}
        >
          Back to Activities
        </button>

        {isAnswered && (
          <button
            type="button"
            id="photo-next-btn"
            onClick={handleNext}
            className="px-6 py-3 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-base font-bold shadow-xs transition-colors inline-flex items-center gap-2"
            style={{ minHeight: "56px" }}
          >
            <span>{currentIndex + 1 < questions.length ? "Next Memory" : "Finish Session"}</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
