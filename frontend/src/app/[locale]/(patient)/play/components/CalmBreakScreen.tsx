"use client";

import React from "react";
import { Coffee, Pill, Home as HomeIcon } from "lucide-react";
import { BigButton } from "@/components/ui/BigButton";
import type { OrientationCardData } from "@/lib/session";

interface CalmBreakScreenProps {
  orientationData: OrientationCardData;
  title: string;
  takeRestLabel: string;
  medicineReminderLabel: string;
  whoIsHomeLabel: string;
  continueLabel: string;
  onContinue: () => void;
}

export function CalmBreakScreen({
  orientationData,
  title,
  takeRestLabel,
  medicineReminderLabel,
  whoIsHomeLabel,
  continueLabel,
  onContinue,
}: CalmBreakScreenProps) {
  return (
    <div
      role="region"
      aria-label="Calm Rest and Daily Orientation"
      className="rounded-[var(--radius-card)] p-6 md:p-8 space-y-6 max-w-xl mx-auto w-full border-2 shadow-md"
      style={{
        background: "var(--surface)",
        borderColor: "var(--primary)",
      }}
    >
      <div className="text-center space-y-2">
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2"
          style={{
            background: "var(--primary-light)",
            borderColor: "var(--primary)",
            color: "var(--primary-dark)",
          }}
          aria-hidden="true"
        >
          <Coffee size={32} />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: "var(--primary)" }}>
          {title}
        </h2>
        <p className="text-lg md:text-xl font-medium" style={{ color: "var(--ink-soft)" }}>
          {takeRestLabel}
        </p>
      </div>

      {/* Orientation Details */}
      <div
        className="space-y-4 p-5 rounded-[var(--radius-md)] border"
        style={{
          background: "var(--surface-2)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border"
            style={{
              background: "var(--accent-light)",
              borderColor: "var(--accent)",
              color: "var(--accent-dark)",
            }}
            aria-hidden="true"
          >
            <Pill size={20} />
          </div>
          <div>
            <span className="text-xs font-bold block uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
              {medicineReminderLabel}
            </span>
            <span className="text-base md:text-lg font-semibold block" style={{ color: "var(--ink)" }}>
              {orientationData.nextMedicineText}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-4 border-t pt-3" style={{ borderColor: "var(--border-soft)" }}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border"
            style={{
              background: "var(--primary-light)",
              borderColor: "var(--primary)",
              color: "var(--primary)",
            }}
            aria-hidden="true"
          >
            <HomeIcon size={20} />
          </div>
          <div>
            <span className="text-xs font-bold block uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
              {whoIsHomeLabel}
            </span>
            <span className="text-base md:text-lg font-semibold block" style={{ color: "var(--ink)" }}>
              {orientationData.whoIsHomeText}
            </span>
          </div>
        </div>
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
