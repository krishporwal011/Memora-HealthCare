"use client";

import { useState, useEffect } from "react";
import { subscribeSyncState, type SyncState } from "@/lib/sync";

interface SyncStatusChipProps {
  className?: string;
}

export function SyncStatusChip({ className = "" }: SyncStatusChipProps) {
  const [syncState, setSyncState] = useState<SyncState>(() => ({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    lastError: null,
    retryAttempt: 0,
  }));

  useEffect(() => {
    const unsubscribe = subscribeSyncState((s) => setSyncState(s));
    return unsubscribe;
  }, []);

  if (!syncState.isOnline) {
    return (
      <span
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border
          bg-[var(--accent-light)] text-[var(--accent-dark)] border-[var(--accent)] ${className}`}
      >
        <span
          className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0"
          aria-hidden="true"
        />
        <span>Offline — saved locally</span>
      </span>
    );
  }

  if (syncState.isSyncing) {
    return (
      <span
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border
          bg-[var(--primary-light)] text-[var(--primary-dark)] border-[var(--primary)] ${className}`}
      >
        <span
          className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse shrink-0"
          aria-hidden="true"
        />
        <span>Saving…</span>
      </span>
    );
  }

  if (syncState.pendingCount > 0) {
    return (
      <span
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border
          bg-[var(--accent-light)] text-[var(--accent-dark)] border-[var(--accent)] ${className}`}
      >
        <span
          className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0"
          aria-hidden="true"
        />
        <span>{syncState.pendingCount} pending</span>
      </span>
    );
  }

  return null;
}
