"use client";

import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface PromptBubbleProps {
  message: string;
  subtext?: string;
  className?: string;
  onReadAloud?: () => void;
}

export function PromptBubble({
  message,
  subtext,
  className = "",
  onReadAloud,
}: PromptBubbleProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleReadAloud = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    if (onReadAloud) {
      onReadAloud();
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9; // Calm, deliberate pace for older adults
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 2500);
    }
  };

  return (
    <div
      role="region"
      aria-label="Assistant guidance"
      className={`rounded-[var(--radius-card)] p-5 border-2 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${className}`}
      style={{
        background: "var(--surface)",
        borderColor: "var(--primary-light)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border"
          style={{
            background: "var(--accent-light)",
            borderColor: "var(--accent)",
            color: "var(--accent-dark)",
          }}
          aria-hidden="true"
        >
          🌸
        </div>
        <div className="space-y-1">
          <p
            className="text-xl md:text-2xl font-bold leading-snug"
            style={{ color: "var(--ink)" }}
          >
            {message}
          </p>
          {subtext && (
            <p
              className="text-base leading-relaxed"
              style={{ color: "var(--ink-soft)" }}
            >
              {subtext}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleReadAloud}
        className="inline-flex items-center gap-2 font-bold text-base px-4 py-3 rounded-full border transition-transform active:scale-95 shrink-0 self-end md:self-center cursor-pointer"
        style={{
          background: isPlayingAudio ? "var(--accent-light)" : "var(--surface-2)",
          borderColor: isPlayingAudio ? "var(--accent)" : "var(--border)",
          color: isPlayingAudio ? "var(--accent-dark)" : "var(--ink)",
          minHeight: "var(--touch-target-patient)",
          minWidth: "140px",
        }}
        aria-label={isPlayingAudio ? "Stop reading aloud" : "Read message aloud"}
      >
        {isPlayingAudio ? (
          <>
            <VolumeX size={20} aria-hidden="true" />
            <span>Stop Audio</span>
          </>
        ) : (
          <>
            <Volume2 size={20} aria-hidden="true" />
            <span>Read Aloud</span>
          </>
        )}
      </button>
    </div>
  );
}
