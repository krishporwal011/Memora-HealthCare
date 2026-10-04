"use client";

import React, { useState, useId } from "react";
import { ChevronDown, BarChart2 } from "lucide-react";

export interface DisclosureProps {
  summary?: string;
  triggerLabel?: string;
  expandedLabel?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Disclosure({
  summary,
  triggerLabel = "Show the numbers",
  expandedLabel = "Hide the numbers",
  children,
  defaultOpen = false,
  className = "",
}: DisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div
      className={`rounded-[var(--radius-md)] border overflow-hidden transition-all ${className}`}
      style={{
        background: "var(--surface)",
        borderColor: "var(--border-soft)",
      }}
    >
      {/* Optional plain-language summary presented first */}
      {summary && (
        <div
          className="p-4 border-b text-sm md:text-base leading-relaxed"
          style={{
            borderColor: "var(--border-soft)",
            color: "var(--ink)",
          }}
        >
          {summary}
        </div>
      )}

      {/* Accessible trigger toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-xs md:text-sm font-bold uppercase tracking-wider transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
        style={{
          color: "var(--primary)",
          background: "var(--surface)",
        }}
      >
        <span className="flex items-center gap-2">
          <BarChart2 size={16} aria-hidden="true" />
          <span>{isOpen ? expandedLabel : triggerLabel}</span>
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Detailed numbers container */}
      {isOpen && (
        <div
          id={contentId}
          className="p-4 border-t text-sm space-y-3"
          style={{
            background: "var(--surface-2)",
            borderColor: "var(--border-soft)",
            color: "var(--ink-soft)",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
