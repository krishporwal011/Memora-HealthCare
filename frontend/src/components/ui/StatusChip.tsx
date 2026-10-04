"use client";

import React from "react";
import { AlertTriangle, Eye, CheckCircle2 } from "lucide-react";

export type StatusLevel = "urgent" | "watch" | "steady" | "checkin";

export interface StatusChipProps {
  status: StatusLevel;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

const STATUS_MAP: Record<
  string,
  {
    icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
    defaultLabel: string;
    bgVar: string;
    colorVar: string;
    borderVar: string;
  }
> = {
  urgent: {
    icon: AlertTriangle,
    defaultLabel: "Visit Recommended",
    bgVar: "var(--status-checkin-bg)",
    colorVar: "var(--status-checkin)",
    borderVar: "var(--status-checkin)",
  },
  checkin: {
    icon: AlertTriangle,
    defaultLabel: "Visit Recommended",
    bgVar: "var(--status-checkin-bg)",
    colorVar: "var(--status-checkin)",
    borderVar: "var(--status-checkin)",
  },
  watch: {
    icon: Eye,
    defaultLabel: "Watch Trend",
    bgVar: "var(--status-watch-bg)",
    colorVar: "var(--status-watch)",
    borderVar: "var(--status-watch)",
  },
  steady: {
    icon: CheckCircle2,
    defaultLabel: "Steady",
    bgVar: "var(--status-steady-bg)",
    colorVar: "var(--status-steady)",
    borderVar: "var(--status-steady)",
  },
};

export function StatusChip({
  status,
  label,
  className = "",
  size = "md",
}: StatusChipProps) {
  const config = STATUS_MAP[status] || STATUS_MAP.steady;
  const Icon = config.icon;
  const displayText = label || config.defaultLabel;

  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border ${
        isSmall ? "px-2.5 py-0.5 text-xs" : "px-3.5 py-1 text-sm"
      } ${className}`}
      style={{
        background: config.bgVar,
        color: config.colorVar,
        borderColor: config.borderVar,
      }}
    >
      <Icon size={isSmall ? 14 : 16} aria-hidden="true" className="shrink-0" />
      <span>{displayText}</span>
    </span>
  );
}
