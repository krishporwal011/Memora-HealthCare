"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, PhoneCall, Coffee } from "lucide-react";
import { DayHeader } from "./DayHeader";
import { SyncStatusChip } from "../common/SyncStatusChip";

interface ActivityShellProps {
  title: string;
  subtitle?: string;
  locale?: string;
  onSkip?: () => void;
  skipLabel?: string;
  children: React.ReactNode;
  homeHref?: string;
  showCallFamily?: boolean;
  onCallFamily?: () => void;
}

export function ActivityShell({
  title,
  subtitle,
  locale = "en",
  onSkip,
  skipLabel = "Time for a calm break",
  children,
  homeHref = "/",
  showCallFamily = true,
  onCallFamily,
}: ActivityShellProps) {
  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-4 md:py-6 gap-6">
      {/* ── Top Orientation Header ── */}
      <DayHeader locale={locale} />

      {/* ── Persistent Navigation & Safety Bar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href={homeHref}
          className="inline-flex items-center gap-2 font-bold text-base md:text-lg px-4 py-2.5 rounded-full border transition-all active:scale-95 no-underline"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--primary)",
            minHeight: "56px",
          }}
          aria-label="Return to main home screen"
        >
          <ArrowLeft size={22} aria-hidden="true" />
          <span>Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <SyncStatusChip />

          {showCallFamily && (
            <button
              type="button"
              onClick={onCallFamily || (() => window.location.assign("tel:+919876543210"))}
              className="inline-flex items-center gap-2 font-bold text-base px-4 py-2.5 rounded-full text-white shadow-sm transition-all active:scale-95 cursor-pointer"
              style={{
                background: "var(--accent)",
                minHeight: "56px",
              }}
              aria-label="Call family member now"
            >
              <PhoneCall size={20} aria-hidden="true" />
              <span>Call Family</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Focused Single-Task Frame ── */}
      <main
        className="flex-1 flex flex-col rounded-[var(--radius-card)] p-5 md:p-8 border-2 shadow-md gap-6"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="text-center space-y-1">
          <h1
            className="text-2xl md:text-3xl font-extrabold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-lg md:text-xl font-medium"
              style={{ color: "var(--ink-soft)" }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Dynamic Activity Content */}
        <div className="flex-1 flex flex-col justify-center">
          {children}
        </div>

        {/* Forgiving Skip / Rest Escape Hatch */}
        {onSkip && (
          <div className="text-center pt-2 border-t" style={{ borderColor: "var(--border-soft)" }}>
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex items-center justify-center gap-2 font-bold text-base md:text-lg px-6 py-3 rounded-full border transition-colors active:scale-95"
              style={{
                background: "var(--surface-2)",
                color: "var(--ink-soft)",
                borderColor: "var(--border)",
                minHeight: "56px",
              }}
            >
              <Coffee size={20} aria-hidden="true" />
              <span>{skipLabel}</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
