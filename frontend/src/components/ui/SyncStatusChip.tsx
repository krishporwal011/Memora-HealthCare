"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, HardDrive, RefreshCw, CheckCircle2 } from "lucide-react";
import { subscribeSyncState, type SyncState } from "@/lib/sync";

export type SyncVisualState = "offline" | "pending" | "syncing" | "synced";

export interface SyncStatusChipProps {
  forcedState?: SyncVisualState;
  forcedCount?: number;
  className?: string;
  showSynced?: boolean;
}

export function SyncStatusChip({
  forcedState,
  forcedCount,
  className = "",
  showSynced = false,
}: SyncStatusChipProps) {
  const [syncState, setSyncState] = useState<SyncState>(() => ({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    lastError: null,
    retryAttempt: 0,
  }));

  useEffect(() => {
    if (forcedState) return;
    const unsubscribe = subscribeSyncState((s) => setSyncState(s));
    return unsubscribe;
  }, [forcedState]);

  // Determine active state
  let currentState: SyncVisualState = "synced";
  let count = forcedCount !== undefined ? forcedCount : syncState.pendingCount;

  if (forcedState) {
    currentState = forcedState;
  } else if (!syncState.isOnline) {
    currentState = "offline";
  } else if (syncState.isSyncing) {
    currentState = "syncing";
  } else if (syncState.pendingCount > 0) {
    currentState = "pending";
  } else {
    currentState = "synced";
  }

  if (currentState === "synced" && !showSynced && !forcedState) {
    return null;
  }

  const renderContent = () => {
    switch (currentState) {
      case "offline":
        return {
          icon: <WifiOff size={14} aria-hidden="true" className="shrink-0" />,
          label: count > 0 ? `Offline (${count} saved locally)` : "Offline (Saved locally)",
          style: {
            background: "var(--accent-light)",
            color: "var(--accent-dark)",
            borderColor: "var(--accent)",
          },
        };
      case "pending":
        return {
          icon: <HardDrive size={14} aria-hidden="true" className="shrink-0" />,
          label: `${count} saved on device`,
          style: {
            background: "var(--accent-light)",
            color: "var(--accent-dark)",
            borderColor: "var(--accent)",
          },
        };
      case "syncing":
        return {
          icon: <RefreshCw size={14} aria-hidden="true" className="animate-spin shrink-0" />,
          label: "Syncing with cloud…",
          style: {
            background: "var(--primary-light)",
            color: "var(--primary-dark)",
            borderColor: "var(--primary)",
          },
        };
      case "synced":
      default:
        return {
          icon: <CheckCircle2 size={14} aria-hidden="true" className="shrink-0" />,
          label: "Fully synced",
          style: {
            background: "var(--success-light)",
            color: "var(--success)",
            borderColor: "var(--success)",
          },
        };
    }
  };

  const config = renderContent();

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs select-none ${className}`}
      style={config.style}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
