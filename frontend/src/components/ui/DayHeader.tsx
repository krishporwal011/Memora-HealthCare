"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";

export interface DayHeaderProps {
  patientName?: string;
  locale?: string;
  className?: string;
  showTime?: boolean;
}

function getGreeting(locale: string): string {
  const hour = new Date().getHours();
  // We can return a calm, polite greeting
  if (locale === "hi") {
    if (hour < 12) return "शुभ प्रभात";
    if (hour < 17) return "शुभ दोपहर";
    return "शुभ संध्या";
  }
  if (locale === "as") {
    if (hour < 12) return "সুপ্ৰভাত";
    if (hour < 17) return "শুভ আবেলি";
    return "শুভ গধূলি";
  }
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DayHeader({
  patientName,
  locale = "en",
  className = "",
  showTime = true,
}: DayHeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const now = new Date();
  const greeting = mounted ? getGreeting(locale) : "Good morning";

  const dateFormatted = mounted
    ? now.toLocaleDateString(locale === "en" ? "en-IN" : locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const timeFormatted = mounted
    ? now.toLocaleTimeString(locale === "en" ? "en-IN" : locale, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <header
      role="banner"
      aria-label="Orientation header"
      className={`w-full rounded-[var(--radius-card)] py-2.5 px-4 md:px-5 flex flex-wrap items-center justify-between gap-3 border shadow-xs ${className}`}
      style={{
        background: "var(--primary-light)",
        borderColor: "var(--primary)",
      }}
    >
      {/* Slim one-line greeting */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="text-lg md:text-xl font-bold leading-snug truncate"
          style={{ color: "var(--primary-dark)" }}
        >
          {greeting}{patientName ? `, ${patientName}` : ""}
        </span>
      </div>

      {/* Date & Time with Lucide icons */}
      {mounted && (
        <div
          className="flex items-center gap-3 text-xs md:text-sm font-semibold flex-wrap"
          style={{ color: "var(--primary)" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={16} aria-hidden="true" className="shrink-0" />
            <span>{dateFormatted}</span>
          </span>
          {showTime && (
            <>
              <span aria-hidden="true" className="opacity-50">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={16} aria-hidden="true" className="shrink-0" />
                <span>{timeFormatted}</span>
              </span>
            </>
          )}
        </div>
      )}
    </header>
  );
}
