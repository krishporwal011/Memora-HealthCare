"use client";

import React, { useState } from "react";
import { Mic, Square } from "lucide-react";

interface VoiceButtonProps {
  onSpeechResult?: (transcript: string) => void;
  className?: string;
  label?: string;
  activeLabel?: string;
}

export function VoiceButton({
  onSpeechResult,
  className = "",
  label = "Tap to speak",
  activeLabel = "I am listening...",
}: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate accessible voice completion after 3.5 seconds
      setTimeout(() => {
        setIsListening(false);
        if (onSpeechResult) {
          onSpeechResult("Yes, that is my daughter Jonali.");
        }
      }, 3500);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-3 w-full ${className}`}>
      <button
        type="button"
        onClick={toggleListening}
        aria-pressed={isListening}
        aria-label={isListening ? activeLabel : label}
        className="w-full flex items-center justify-center gap-4 text-xl font-bold rounded-[var(--radius-card)] p-4 shadow-md transition-all active:scale-95 border-2"
        style={{
          minHeight: "var(--touch-target-patient)",
          background: isListening ? "var(--alert-light)" : "var(--primary-light)",
          borderColor: isListening ? "var(--alert)" : "var(--primary)",
          color: isListening ? "var(--alert)" : "var(--primary-dark)",
        }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
          style={{
            background: isListening ? "var(--alert)" : "var(--primary)",
          }}
          aria-hidden="true"
        >
          {isListening ? (
            <Square size={22} className="animate-pulse" />
          ) : (
            <Mic size={24} />
          )}
        </div>

        <div className="flex flex-col text-left">
          <span className="text-xl font-bold leading-tight">
            {isListening ? activeLabel : label}
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--ink-soft)" }}
          >
            {isListening ? "Tap again to finish speaking" : "Microphone active only when tapped"}
          </span>
        </div>
      </button>

      {/* Accessible visual waveform feedback when active */}
      {isListening && (
        <div
          className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-full"
          style={{ background: "var(--surface-2)" }}
          aria-live="polite"
        >
          <span className="w-1.5 h-4 rounded-full bg-[var(--alert)] animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-6 rounded-full bg-[var(--alert)] animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-8 rounded-full bg-[var(--alert)] animate-bounce [animation-delay:300ms]" />
          <span className="w-1.5 h-5 rounded-full bg-[var(--alert)] animate-bounce [animation-delay:450ms]" />
          <span className="text-xs font-bold ml-2" style={{ color: "var(--alert)" }}>
            Listening...
          </span>
        </div>
      )}
    </div>
  );
}
