"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { BigButton } from "@/components/ui/BigButton";

interface SessionCompletedScreenProps {
  title?: string;
  feedbackLabel: string;
  takeRestLabel: string;
  continueLabel: string;
  onContinue: () => void;
}

export function SessionCompletedScreen({
  title = "Activity Complete",
  feedbackLabel,
  takeRestLabel,
  continueLabel,
  onContinue,
}: SessionCompletedScreenProps) {
  return (
    <div
      role="status"
      aria-label="Activity finished"
      className="rounded-[var(--radius-card)] p-6 md:p-8 text-center space-y-6 max-w-xl mx-auto w-full border-2 shadow-md"
      style={{
        background: "var(--surface)",
        borderColor: "var(--success)",
      }}
    >
      <div
        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center border-2"
        style={{
          background: "var(--success-light)",
          borderColor: "var(--success)",
          color: "var(--success)",
        }}
        aria-hidden="true"
      >
        <CheckCircle2 size={44} />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: "var(--success)" }}>
          {feedbackLabel}
        </h2>
        <p className="text-lg md:text-xl font-medium" style={{ color: "var(--ink-soft)" }}>
          {takeRestLabel}
        </p>
      </div>

      <BigButton
        label={continueLabel}
        size="patient"
        variant="primary"
        onClick={onContinue}
      />
    </div>
  );
}
