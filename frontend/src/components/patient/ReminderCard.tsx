"use client";

import React, { useState } from "react";
import { Pill, Check, Clock, Utensils, Bell } from "lucide-react";

export type ReminderType = "medicine" | "meal" | "water" | "appointment";

interface ReminderCardProps {
  id?: string;
  type: ReminderType;
  title: string;
  timeText: string;
  instructions?: string;
  className?: string;
  onDone?: () => void;
  onPostpone?: () => void;
}

export function ReminderCard({
  type = "medicine",
  title,
  timeText,
  instructions,
  className = "",
  onDone,
  onPostpone,
}: ReminderCardProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const getIcon = () => {
    switch (type) {
      case "medicine":
        return <Pill size={26} aria-hidden="true" />;
      case "meal":
        return <Utensils size={26} aria-hidden="true" />;
      case "water":
      case "appointment":
      default:
        return <Bell size={26} aria-hidden="true" />;
    }
  };

  const handleDone = () => {
    setIsCompleted(true);
    if (onDone) onDone();
  };

  if (isCompleted) {
    return (
      <div
        role="status"
        aria-label="Reminder completed"
        className={`rounded-[var(--radius-card)] p-5 border-2 shadow-sm flex items-center justify-between gap-4 ${className}`}
        style={{
          background: "var(--success-light)",
          borderColor: "var(--success)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ background: "var(--success)" }}
            aria-hidden="true"
          >
            <Check size={24} />
          </div>
          <div>
            <span
              className="text-lg font-bold block"
              style={{ color: "var(--success)" }}
            >
              Completed: {title}
            </span>
            <span
              className="text-sm block"
              style={{ color: "var(--ink-soft)" }}
            >
              Saved safely for your family and caregiver.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={`Reminder: ${title}`}
      className={`rounded-[var(--radius-card)] p-5 md:p-6 border-2 shadow-md space-y-5 ${className}`}
      style={{
        background: "var(--accent-light)",
        borderColor: "var(--accent)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
          style={{ background: "var(--accent-dark)" }}
          aria-hidden="true"
        >
          {getIcon()}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                background: "var(--surface)",
                color: "var(--accent-dark)",
              }}
            >
              {timeText}
            </span>
          </div>
          <h2
            className="text-xl md:text-2xl font-bold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            {title}
          </h2>
          {instructions && (
            <p
              className="text-base leading-relaxed"
              style={{ color: "var(--ink-soft)" }}
            >
              {instructions}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons: Min 64px on primary Done */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={handleDone}
          className="w-full inline-flex items-center justify-center gap-3 font-bold text-lg md:text-xl rounded-full text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
          style={{
            background: "var(--primary)",
            minHeight: "var(--touch-target-patient)",
          }}
          aria-label={`Confirm finished: ${title}`}
        >
          <Check size={24} aria-hidden="true" />
          <span>I Have Taken This</span>
        </button>

        <button
          type="button"
          onClick={onPostpone}
          className="w-full inline-flex items-center justify-center gap-2 font-bold text-base rounded-full border transition-colors active:scale-95 cursor-pointer"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--ink-soft)",
            minHeight: "56px",
          }}
          aria-label="Remind me again in 30 minutes"
        >
          <Clock size={20} aria-hidden="true" />
          <span>Remind Later</span>
        </button>
      </div>
    </div>
  );
}
