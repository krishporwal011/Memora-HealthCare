"use client";

import React from "react";
import { Coffee } from "lucide-react";

export interface CardItem {
  id: string;
  name: string;
  icon: string;
  pairKey: string;
  hint?: string;
}

interface MemoryMatchGameProps {
  cards: CardItem[];
  flippedIndices: number[];
  matchedKeys: string[];
  feedback: string;
  hintMessage: string;
  defaultPrompt: string;
  title: string;
  calmBreakLabel: string;
  onCardClick: (index: number) => void;
  onCalmBreak: () => void;
}

export function MemoryMatchGame({
  cards,
  flippedIndices,
  matchedKeys,
  feedback,
  hintMessage,
  defaultPrompt,
  title,
  calmBreakLabel,
  onCardClick,
  onCalmBreak,
}: MemoryMatchGameProps) {
  return (
    <div className="flex-1 flex flex-col justify-between gap-6 max-w-xl mx-auto w-full">
      {/* Title & Status Prompt */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
          {title}
        </h2>
        <p
          role="status"
          aria-live="polite"
          className="text-lg md:text-xl font-medium min-h-[1.6em]"
          style={{
            color: feedback ? "var(--primary)" : "var(--ink-soft)",
          }}
        >
          {feedback || hintMessage || defaultPrompt}
        </p>
      </div>

      {/* Cards Grid: min 120px touch target, warm SVG leaf motif on back */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-md mx-auto">
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || matchedKeys.includes(card.pairKey);
          const isMatched = matchedKeys.includes(card.pairKey);

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onCardClick(idx)}
              disabled={isMatched}
              aria-label={isFlipped ? card.name : `Card ${idx + 1}`}
              className="w-full aspect-square min-h-[120px] rounded-[var(--radius-card)] flex flex-col items-center justify-center p-3 select-none cursor-pointer transition-all duration-200 active:scale-95 shadow-sm"
              style={{
                border: isMatched
                  ? "3px solid var(--success)"
                  : isFlipped
                  ? "3px solid var(--primary)"
                  : "3px solid var(--primary)",
                background: isMatched
                  ? "var(--success-light)"
                  : isFlipped
                  ? "var(--surface)"
                  : "var(--primary)",
              }}
            >
              {isFlipped ? (
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <span className="text-4xl sm:text-5xl" aria-hidden="true">
                    {card.icon}
                  </span>
                  <span
                    className="text-base sm:text-lg font-bold tracking-tight"
                    style={{
                      color: isMatched ? "var(--success)" : "var(--ink)",
                    }}
                  >
                    {card.name}
                  </span>
                </div>
              ) : (
                /* Elegant geometric NER leaf motif drawn in SVG (no emoji) */
                <div className="w-16 h-16 flex items-center justify-center text-[var(--primary-light)]" aria-hidden="true">
                  <svg
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12"
                  >
                    <path
                      d="M24 4C24 4 12 16 12 28C12 34.6274 17.3726 40 24 40C30.6274 40 36 34.6274 36 28C36 16 24 4 24 4Z"
                      fill="currentColor"
                      fillOpacity="0.25"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M24 12V36M24 20L30 16M24 28L32 24M24 24L18 20M24 32L16 28"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Calm Break Escape Button */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onCalmBreak}
          className="inline-flex items-center gap-2 text-base md:text-lg font-semibold py-3 px-6 rounded-full border transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--ink-soft)",
            minHeight: "56px",
          }}
        >
          <Coffee size={20} aria-hidden="true" />
          <span>{calmBreakLabel}</span>
        </button>
      </div>
    </div>
  );
}
