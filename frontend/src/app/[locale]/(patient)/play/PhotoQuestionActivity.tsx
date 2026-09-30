"use client";

import { useState, useEffect, useRef } from "react";
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
      <div className="bg-white rounded-3xl p-6 border-3 border-[#1B3B36] text-center space-y-4">
        <span className="text-4xl block" aria-hidden="true">🖼️</span>
        <h3 className="text-xl font-bold text-[#1B3B36]">No Photo Questions Available</h3>
        <p className="text-sm text-[#52504C]">
          Your caregiver has not approved any photo questions yet.
        </p>
        <BigButton label="Return to Activities" variant="primary" onClick={onExit} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto w-full">
      {/* Photo Memory Display */}
      <div className="bg-white rounded-3xl p-6 border-3 border-[#1B3B36] shadow-sm text-center space-y-4">
        <div
          className="w-24 h-24 mx-auto rounded-2xl bg-[#F8F6F0] flex items-center justify-center text-5xl border-2 border-[#1B3B36] shadow-xs"
          aria-hidden="true"
        >
          {currentQ.image_url || "📸"}
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#52504C] bg-[#F8F6F0] px-3 py-1 rounded-full border border-[#D1CEC4]">
            {currentQ.photo_title || "Family Memory Photo"}
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-[#1B3B36] mt-3 leading-snug">
            {currentQ.question_text}
          </h2>
        </div>
      </div>

      {/* Answer Options Grid (Strict min 72px touch targets) */}
      <div className="space-y-3" role="group" aria-label="Answer options">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id;
          let btnStyle = "bg-white border-[#1B3B36] text-[#1C1C1A] hover:bg-[#F2EFE9]";

          if (isAnswered) {
            if (opt.is_correct) {
              btnStyle = "bg-[#EAF3EE] border-[#2D6A4F] text-[#1B3B36] font-bold";
            } else if (isSelected && !opt.is_correct) {
              btnStyle = "bg-[#FDF1EC] border-[#9A3412] text-[#9A3412]";
            } else {
              btnStyle = "bg-white border-[#D1CEC4] text-[#8C8983] opacity-60";
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
                <span className="text-xl" aria-hidden="true">✓</span>
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
          className="p-4 rounded-2xl bg-[#F8F6F0] border-2 border-[#1B3B36] text-center"
        >
          <p className="text-base font-bold text-[#1B3B36]">{feedback}</p>
        </div>
      )}

      {/* Next or Calm Break */}
      <div className="pt-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onExit}
          className="text-sm font-semibold text-[#52504C] hover:text-[#1C1C1A] underline py-2 px-3"
          style={{ minHeight: "44px" }}
        >
          Back to Activities
        </button>

        {isAnswered && (
          <button
            type="button"
            id="photo-next-btn"
            onClick={handleNext}
            className="px-6 py-3 rounded-2xl bg-[#1B3B36] hover:bg-[#2D6A4F] text-white text-base font-bold shadow-xs transition-colors"
            style={{ minHeight: "56px" }}
          >
            {currentIndex + 1 < questions.length ? "Next Memory ➔" : "Finish Session ➔"}
          </button>
        )}
      </div>
    </div>
  );
}
