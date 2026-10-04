"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Wifi, WifiOff, RefreshCw, HardDrive, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { subscribeSyncState, syncAllUnsynced, type SyncState } from "@/lib/sync";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function SyncCenterPage() {
  const [syncState, setSyncState] = useState<SyncState>(() => ({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    lastError: null,
    retryAttempt: 0,
  }));
  const [manualSyncing, setManualSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeSyncState((s) => setSyncState(s));
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    try {
      setManualSyncing(true);
      setSyncFeedback(null);
      await syncAllUnsynced();
      setSyncFeedback("Sync check completed successfully.");
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch {
      setSyncFeedback("Sync attempt failed — events remain safely stored on this device.");
    } finally {
      setManualSyncing(false);
    }
  };

  const isConnected = syncState.isOnline;
  const isBusy = syncState.isSyncing || manualSyncing;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
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

        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
          style={
            isConnected
              ? {
                  background: "var(--success-light)",
                  color: "var(--success)",
                  borderColor: "var(--success)",
                }
              : {
                  background: "var(--accent-light)",
                  color: "var(--accent-dark)",
                  borderColor: "var(--accent)",
                }
          }
        >
          {isConnected ? <Wifi size={14} aria-hidden="true" /> : <WifiOff size={14} aria-hidden="true" />}
          <span>{isConnected ? "Device Connected" : "Working Offline"}</span>
        </span>
      </div>

      {/* ── Section Header ── */}
      <SectionHeader
        eyebrow="Resilience & Reliability"
        title="Offline & Sync Center"
        description="Memora is designed from the ground up for the weak and intermittent connectivity across North East India. All patient activity is safely saved on this device first."
      />

      {/* ── Feedback Notice ── */}
      {syncFeedback && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-[var(--radius-md)] border text-sm font-bold flex items-center gap-2 shadow-xs"
          style={{
            background: "var(--primary-light)",
            borderColor: "var(--primary)",
            color: "var(--primary-dark)",
          }}
        >
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* ── Status Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Pending Queue */}
        <div
          className="rounded-[var(--radius-card)] p-6 border space-y-2"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between text-[var(--ink-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Unsynced Events</span>
            <HardDrive size={18} />
          </div>
          <div className="text-3xl font-black" style={{ color: syncState.pendingCount > 0 ? "var(--accent-dark)" : "var(--success)" }}>
            {syncState.pendingCount}
          </div>
          <p className="text-xs text-[var(--ink-soft)]">
            {syncState.pendingCount === 0
              ? "All events are uploaded to the secure Mumbai cloud."
              : `${syncState.pendingCount} events waiting in local IndexedDB queue.`}
          </p>
        </div>

        {/* Metric 2: Sync Status */}
        <div
          className="rounded-[var(--radius-card)] p-6 border space-y-2"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between text-[var(--ink-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Cloud Engine</span>
            <RefreshCw size={18} className={isBusy ? "animate-spin text-[var(--primary)]" : ""} />
          </div>
          <div className="text-2xl font-black capitalize" style={{ color: "var(--ink)" }}>
            {isBusy ? "Syncing…" : isConnected ? "Idle" : "Paused"}
          </div>
          <p className="text-xs text-[var(--ink-soft)]">
            {isBusy
              ? "Uploading batches with idempotent keys."
              : isConnected
              ? "Connected and watching for new activities."
              : "Reconnection auto-sync is armed."}
          </p>
        </div>

        {/* Metric 3: Last Cloud Sync */}
        <div
          className="rounded-[var(--radius-card)] p-6 border space-y-2"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between text-[var(--ink-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Last Sync</span>
            <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
          </div>
          <div className="text-base font-bold" style={{ color: "var(--ink)" }}>
            {syncState.lastSyncTime
              ? new Date(syncState.lastSyncTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Recently connected"}
          </div>
          <p className="text-xs text-[var(--ink-soft)]">
            Deterministic UUIDv7 timestamps protect replay integrity.
          </p>
        </div>
      </div>

      {/* ── Action Trigger ── */}
      <div
        className="rounded-[var(--radius-card)] p-6 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          background: "var(--surface-2)",
          borderColor: "var(--border)",
        }}
      >
        <div className="space-y-1">
          <h3 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
            Manual Sync Trigger
          </h3>
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
            Force an immediate check of the IndexedDB offline queue against the FastAPI backend.
          </p>
        </div>

        <button
          type="button"
          disabled={!isConnected || isBusy}
          onClick={handleManualSync}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-sm shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background: "var(--primary)",
            minHeight: "48px",
          }}
        >
          <RefreshCw size={18} className={isBusy ? "animate-spin" : ""} aria-hidden="true" />
          <span>{isBusy ? "Syncing Now…" : "Sync Cloud Now"}</span>
        </button>
      </div>

      {/* ── Offline Architecture Guarantee Details ── */}
      <div
        className="rounded-[var(--radius-card)] p-6 border space-y-4"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border-soft)",
        }}
      >
        <h3 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
          How Offline Mode Protects Your Family
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm" style={{ color: "var(--ink-soft)" }}>
          <div className="p-4 rounded-[var(--radius-md)] border space-y-1" style={{ borderColor: "var(--border-soft)" }}>
            <span className="font-bold block text-[var(--ink)]">1. Local-First IndexedDB Storage</span>
            <p>Every answer, reaction time, and difficulty change is stored locally on this phone before any network transmission is attempted.</p>
          </div>
          <div className="p-4 rounded-[var(--radius-md)] border space-y-1" style={{ borderColor: "var(--border-soft)" }}>
            <span className="font-bold block text-[var(--ink)]">2. Idempotent UUIDv7 Ingestion</span>
            <p>If network drops during upload, the backend safely deduplicates events using client-generated primary keys without duplication.</p>
          </div>
          <div className="p-4 rounded-[var(--radius-md)] border space-y-1" style={{ borderColor: "var(--border-soft)" }}>
            <span className="font-bold block text-[var(--ink)]">3. Zero Data Loss When Reconnecting</span>
            <p>The Service Worker and sync client automatically detect connection return and upload queued batches up to 200 items smoothly.</p>
          </div>
          <div className="p-4 rounded-[var(--radius-md)] border space-y-1" style={{ borderColor: "var(--border-soft)" }}>
            <span className="font-bold block text-[var(--ink)]">4. No Audio Retained</span>
            <p>Microphone input is transcribed ephemerally in-memory and discarded. Only game statistics and timestamps are synchronized.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
