"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, WifiOff, HardDrive, Sparkles, RefreshCw } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BigButton } from "@/components/ui/BigButton";
import { subscribeSyncState, type SyncState } from "@/lib/sync";

export default function OfflineExplanationPage() {
  const [syncState, setSyncState] = useState<SyncState>(() => ({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : false,
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

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-8">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--border-soft)" }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base font-semibold px-4 py-2.5 rounded-full border no-underline transition-colors hover:bg-[var(--surface-2)]"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--primary)",
            minHeight: "44px",
          }}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back to Home</span>
        </Link>

        <span className="text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider text-[var(--accent-dark)] bg-[var(--accent-light)] border-[var(--accent)]">
          Offline Mode
        </span>
      </div>

      <div
        className="rounded-[var(--radius-card)] p-8 border-2 text-center space-y-6 shadow-md"
        style={{
          background: "var(--surface)",
          borderColor: "var(--primary)",
        }}
      >
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2"
          style={{
            background: "var(--accent-light)",
            borderColor: "var(--accent)",
            color: "var(--accent-dark)",
          }}
          aria-hidden="true"
        >
          <WifiOff size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
            You Are Browsing Offline
          </h1>
          <p className="text-lg font-medium max-w-md mx-auto" style={{ color: "var(--ink-soft)" }}>
            Memora is built for the remote tea gardens and valleys of North East India. No internet connection is needed for daily memory activities.
          </p>
        </div>

        {/* Local storage status pill */}
        <div
          className="p-5 rounded-[var(--radius-md)] border space-y-2 text-left"
          style={{
            background: "var(--surface-2)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--ink)" }}>
            <HardDrive size={18} style={{ color: "var(--primary)" }} />
            <span>Local Storage Status</span>
          </div>
          <p className="text-xs md:text-sm" style={{ color: "var(--ink-soft)" }}>
            All activities, scores, and cultural memory cards are cached securely in your phone's storage. You have {syncState.pendingCount} activity events queued to synchronize when internet returns.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/play" className="no-underline w-full sm:w-auto">
            <BigButton
              label="Continue Memory Activities"
              size="large"
              variant="primary"
              className="w-full sm:w-auto"
            />
          </Link>

          <Link href="/sync" className="no-underline w-full sm:w-auto">
            <BigButton
              label="View Sync Details"
              size="large"
              variant="surface"
              className="w-full sm:w-auto"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
