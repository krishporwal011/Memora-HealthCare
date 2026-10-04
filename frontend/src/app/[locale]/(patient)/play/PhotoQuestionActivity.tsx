"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { BigButton } from "@/components/ui/BigButton";
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
    image_url: "",
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
    const offlineItems = getOfflineApprovedQuizItems().filter(
      (q) => q.is_approved && q.approval_status === "approved"
    );

    if (offlineItems.length > 0) {
      setQuestions(offlineItems);
    } else {
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

    const correctOpt = currentQ.options.find((o) => o.is_correct);
    if (isCorrect) {
      setFeedback(`That is right: ${correctOpt?.text}.`);
    } else {
      setFeedback(`Here is the memory: ${correctOpt?.text}.`);
    }

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
      <div
        className="rounded-[var(--radius-card)] p-8 border-2 text-center space-y-4 max-w-lg mx-auto w-full shadow-md"
        style={{
          background: "var(--surface)",
          borderColor: "var(--primary)",
        }}
      >
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center border"
          style={{
            background: "var(--primary-light)",
            borderColor: "var(--primary)",
            color: "var(--primary-dark)",
          }}
          aria-hidden="true"
        >
          <Camera size={28} />
        </div>
        <h3 className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
          No Photo Questions Available
        </h3>
        <p className="text-base" style={{ color: "var(--ink-soft)" }}>
          Your caregiver has not approved any photo questions yet.
        </p>
        <BigButton label="Return to Activities" variant="primary" size="patient" onClick={onExit} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto w-full">
      {/* Photo Memory Display */}
      <div
        className="rounded-[var(--radius-card)] p-6 border-2 shadow-sm text-center space-y-4"
        style={{
          background: "var(--surface)",
          borderColor: "var(--primary)",
        }}
      >
        <div
          className="w-28 h-28 mx-auto rounded-2xl flex items-center justify-center border-2 overflow-hidden shadow-xs"
          style={{
            background: "var(--surface-2)",
            borderColor: "var(--primary)",
          }}
          aria-hidden="true"
        >
          {currentQ.image_url && !currentQ.image_url.includes("🌸") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentQ.image_url} alt="" className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <Camera size={36} style={{ color: "var(--primary)" }} />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-[var(--ink-muted)]">
                Family Archive
              </span>
            </div>
          )}
        </div>
        <div>
          <span
            className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
              color: "var(--ink-soft)",
            }}
          >
            {currentQ.photo_title || "Family Memory Photo"}
          </span>
          <h2
            className="text-2xl md:text-3xl font-extrabold mt-3 leading-snug"
            style={{ color: "var(--ink)" }}
          >
            {currentQ.question_text}
          </h2>
        </div>
      </div>

      {/* Answer Options Grid (Strict min 64px touch targets) */}
      <div className="space-y-3" role="group" aria-label="Answer options">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id;
          let bg = "var(--surface)";
          let borderColor = "var(--primary)";
          let color = "var(--ink)";

          if (isAnswered) {
            if (opt.is_correct) {
              bg = "var(--success-light)";
              borderColor = "var(--success)";
              color = "var(--success)";
            } else if (isSelected && !opt.is_correct) {
              bg = "var(--alert-light)";
              borderColor = "var(--alert)";
              color = "var(--alert)";
            } else {
              bg = "var(--surface)";
              borderColor = "var(--border)";
              color = "var(--ink-muted)";
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              id={`photo-opt-${idx + 1}`}
              onClick={() => handleSelectOption(opt.id, opt.is_correct)}
              disabled={isAnswered}
              className="w-full p-4 rounded-[var(--radius-card)] border-2 flex items-center justify-between text-left text-xl font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:cursor-default"
              style={{
                minHeight: "var(--touch-target-patient)",
                background: bg,
                borderColor: borderColor,
                color: color,
              }}
              aria-label={opt.text}
            >
              <span>{opt.text}</span>
              {isAnswered && opt.is_correct && (
                <Check size={24} style={{ color: "var(--success)" }} aria-hidden="true" />
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
          className="p-4 rounded-[var(--radius-md)] border-2 text-center"
          style={{
            background: "var(--primary-light)",
            borderColor: "var(--primary)",
            color: "var(--primary-dark)",
          }}
        >
          <p className="text-lg font-bold">{feedback}</p>
        </div>
      )}

      {/* Next or Exit */}
      <div className="pt-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-base font-semibold underline py-3 px-4 rounded-xl cursor-pointer"
          style={{ color: "var(--ink-soft)", minHeight: "48px" }}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back to Activities</span>
        </button>

        {isAnswered && (
          <button
            type="button"
            id="photo-next-btn"
            onClick={handleNext}
            className="px-6 py-3.5 rounded-full text-white text-lg font-bold shadow-sm transition-transform active:scale-95 inline-flex items-center gap-2 cursor-pointer"
            style={{
              background: "var(--primary)",
              minHeight: "56px",
            }}
          >
            <span>{currentIndex + 1 < questions.length ? "Next Memory" : "Finish Session"}</span>
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
