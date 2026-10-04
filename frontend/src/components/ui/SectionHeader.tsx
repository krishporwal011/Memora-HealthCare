"use client";

import React from "react";

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className = "",
  align = "left",
}: SectionHeaderProps) {
  const isCentered = align === "center";

  return (
    <div
      className={`w-full flex flex-col md:flex-row ${
        isCentered ? "items-center text-center" : "items-start justify-between"
      } gap-4 mb-6 ${className}`}
    >
      <div className={`space-y-1.5 max-w-2xl ${isCentered ? "mx-auto" : ""}`}>
        {eyebrow && (
          <span
            className="text-xs font-bold uppercase tracking-wider block"
            style={{ color: "var(--primary)" }}
          >
            {eyebrow}
          </span>
        )}
        <h2
          className="text-2xl md:text-3xl font-extrabold tracking-tight"
          style={{ color: "var(--ink)" }}
        >
          {title}
        </h2>
        {description && (
          <p
            className="text-base md:text-lg font-normal leading-relaxed"
            style={{ color: "var(--ink-soft)" }}
          >
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 flex items-center gap-3">{action}</div>}
    </div>
  );
}
