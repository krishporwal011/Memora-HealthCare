"use client";

import { useEffect, useState } from "react";

interface DayHeaderProps {
  patientName?: string;
  locale?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DayHeader({ patientName, locale = "en" }: DayHeaderProps) {
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — time is client-only
  useEffect(() => setMounted(true), []);

  const greeting = mounted ? getGreeting() : "Good morning";
  const now = new Date();

  const dateFormatted = mounted
    ? now.toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const timeFormatted = mounted
    ? now.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className="rounded-[var(--radius-card)] py-3 px-4 md:px-5 space-y-0.5 shadow-xs"
      style={{ background: "var(--primary-light)", border: "1.5px solid var(--primary)" }}
    >
      <p
        className="text-xl font-bold leading-snug"
        style={{ color: "var(--primary-dark)" }}
      >
        {greeting}{patientName ? `, ${patientName}` : ""}
      </p>
      {mounted && (
        <p
          className="text-sm font-semibold flex items-center gap-3"
          style={{ color: "var(--primary)" }}
        >
          <span>📅 {dateFormatted}</span>
          <span aria-hidden="true">·</span>
          <span>🕐 {timeFormatted}</span>
        </p>
      )}
    </div>
  );
}
