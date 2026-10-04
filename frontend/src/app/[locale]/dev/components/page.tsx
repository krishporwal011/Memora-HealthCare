"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Sparkles, AlertCircle } from "lucide-react";
import {
  BigButton,
  MemoryCard,
  DayHeader,
  SectionHeader,
  StatusChip,
  Disclosure,
  EmptyState,
  SyncStatusChip,
  OfflineBanner,
  SkeletonLoader,
} from "@/components/ui";
import { FamilyCallBar } from "@/components/patient/FamilyCallBar";
import { VoiceButton } from "@/components/patient/VoiceButton";
import { PromptBubble } from "@/components/patient/PromptBubble";
import { ReminderCard } from "@/components/patient/ReminderCard";

export default function ComponentGalleryPage() {
  const [voiceResult, setVoiceResult] = useState<string>("");

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      {/* ── Offline Banner Preview ── */}
      <OfflineBanner forceVisible message="Offline Preview: Changes saved locally to IndexedDB queue." />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border)" }}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary)]">
                Internal Design System
              </span>
              <span className="text-xs font-semibold text-[var(--ink-soft)]">
                Ex-navigation / Dev only
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Memora Component Design Gallery
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold no-underline hover:bg-[var(--surface-2)]"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <ArrowLeft size={16} />
            <span>Return Home</span>
          </Link>
        </div>

        {/* ── 1. BigButton Gallery ── */}
        <section className="space-y-4">
          <SectionHeader
            eyebrow="Buttons & Touch Targets"
            title="BigButton Component"
            description="Minimum 64px on patient mode, 48px/56px on caregiver and ASHA modes. Strict token styling with focus rings."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--ink-soft)]">Patient Size (64px) - Primary</span>
              <BigButton label="Start Activity" icon={<Sparkles size={24} />} size="patient" variant="primary" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--ink-soft)]">Patient Size (64px) - Accent</span>
              <BigButton label="Listen to Song" size="patient" variant="accent" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--ink-soft)]">Patient Size (64px) - Surface</span>
              <BigButton label="View Memories" size="patient" variant="surface" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <BigButton label="Loading State" loading size="large" variant="primary" />
            <BigButton label="Outline Action" size="large" variant="outline" />
            <BigButton label="Disabled Button" disabled size="large" variant="primary" />
          </div>
        </section>

        {/* ── 2. StatusChip & SyncStatusChip ── */}
        <section className="space-y-4">
          <SectionHeader
            eyebrow="Badges & Visual Status"
            title="StatusChip & SyncStatusChip"
            description="Accessible status chips pairing Lucide icons with visible text labels. Zero emoji."
          />
          <div className="p-6 rounded-[var(--radius-card)] border bg-[var(--surface)] space-y-4" style={{ borderColor: "var(--border)" }}>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block mb-2 text-[var(--ink-muted)]">
                ASHA Clinical Triage Chips
              </span>
              <div className="flex flex-wrap gap-3">
                <StatusChip status="urgent" label="Visit Recommended" />
                <StatusChip status="watch" label="Watch Trend" />
                <StatusChip status="steady" label="Steady" />
                <StatusChip status="urgent" label="Urgent (sm)" size="sm" />
                <StatusChip status="watch" label="Watch (sm)" size="sm" />
                <StatusChip status="steady" label="Steady (sm)" size="sm" />
              </div>
            </div>

            <div className="border-t pt-4" style={{ borderColor: "var(--border-soft)" }}>
              <span className="text-xs font-bold uppercase tracking-wider block mb-2 text-[var(--ink-muted)]">
                Sync States (Simulated previews)
              </span>
              <div className="flex flex-wrap gap-3">
                <SyncStatusChip forcedState="synced" showSynced />
                <SyncStatusChip forcedState="syncing" />
                <SyncStatusChip forcedState="pending" forcedCount={4} />
                <SyncStatusChip forcedState="offline" forcedCount={2} />
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. DayHeader & SectionHeader ── */}
        <section className="space-y-4">
          <SectionHeader
            eyebrow="Orientation & Layout"
            title="Slim DayHeader"
            description="Orientation card reduced to a calm, single-line header with calendar & clock icons."
          />
          <DayHeader patientName="Bhaben" locale="en" />
        </section>

        {/* ── 4. Patient Core Components ── */}
        <section className="space-y-4">
          <SectionHeader
            eyebrow="Patient Mode"
            title="Family Call Bar & Voice Assistant"
            description="Always-accessible emergency contact and microphone tap-to-speak interface."
          />
          <FamilyCallBar />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--ink-soft)]">Prompt Guidance Bubble</span>
              <PromptBubble
                message="Look at this picture of Bihu dance."
                subtext="Tap the button to hear the story."
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--ink-soft)]">
                Voice Button (Explicit Tap Only) {voiceResult && `— Heard: "${voiceResult}"`}
              </span>
              <VoiceButton onSpeechResult={(res) => setVoiceResult(res)} />
            </div>
          </div>
        </section>

        {/* ── 5. ReminderCard ── */}
        <section className="space-y-4">
          <SectionHeader
            eyebrow="Gentle Care"
            title="ReminderCard"
            description="Clear medication and daily routine reminders with primary 64px confirmation."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReminderCard
              type="medicine"
              title="Blood Pressure Medication"
              timeText="8:00 AM (Morning)"
              instructions="Take 1 tablet with a full glass of warm water after breakfast."
            />
            <ReminderCard
              type="meal"
              title="Afternoon Herbal Tea"
              timeText="4:30 PM (Evening)"
              instructions="Enjoy a warm cup of Assam tea with family in the verandah."
            />
          </div>
        </section>

        {/* ── 6. Photo-Led MemoryCard Grid ── */}
        <section className="space-y-4">
          <SectionHeader
            eyebrow="Family Archive"
            title="Photo-Led MemoryCard"
            description="Real-photo-first cards with synthetic archive placeholders, metadata badges, and approval controls."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MemoryCard
              memoryType="photo"
              caption="Bihu celebration in Guwahati courtyard with family"
              year={1984}
              people={["Jonali", "Ranjit"]}
              isApproved
            />
            <MemoryCard
              memoryType="song"
              caption="Borgeet evening prayer sung by grandmother"
              year={1972}
              people={["Mother"]}
              isApproved={false}
              isOfflinePending
              onPlayAudio={() => alert("Playing synthetic regional audio")}
              onApprove={() => alert("Approval toggled")}
            />
            <MemoryCard
              memoryType="story"
              caption="Journey across the Brahmaputra ferry during monsoon"
              year={1991}
              people={["Father", "Uncle"]}
              isApproved
              onDelete={() => alert("Delete clicked")}
            />
          </div>
        </section>

        {/* ── 7. Disclosure ('Show the numbers') ── */}
        <section className="space-y-4">
          <SectionHeader
            eyebrow="Explainable AI"
            title="Disclosure ('Show the numbers')"
            description="Caregivers see plain-language clinical summaries first. Mathematical and statistical numbers stay behind an expandable disclosure."
          />
          <Disclosure
            summary="Performance is consistent with usual baseline over the past 14 days. Daily memory match activities were completed with ease."
            triggerLabel="Show the statistical numbers"
            expandedLabel="Hide statistical numbers"
            defaultOpen
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-[var(--surface)] rounded border" style={{ borderColor: "var(--border)" }}>
                <span className="text-xs font-bold uppercase text-[var(--ink-muted)] block">Today Accuracy</span>
                <span className="text-xl font-bold text-[var(--primary)]">85%</span>
              </div>
              <div className="p-3 bg-[var(--surface)] rounded border" style={{ borderColor: "var(--border)" }}>
                <span className="text-xs font-bold uppercase text-[var(--ink-muted)] block">Usual Range</span>
                <span className="text-xl font-bold text-[var(--ink)]">78% – 92%</span>
              </div>
              <div className="p-3 bg-[var(--surface)] rounded border" style={{ borderColor: "var(--border)" }}>
                <span className="text-xs font-bold uppercase text-[var(--ink-muted)] block">Robust Z-Score</span>
                <span className="text-xl font-bold text-[var(--success)]">+0.32</span>
              </div>
              <div className="p-3 bg-[var(--surface)] rounded border" style={{ borderColor: "var(--border)" }}>
                <span className="text-xs font-bold uppercase text-[var(--ink-muted)] block">CUSUM Drift</span>
                <span className="text-xl font-bold text-[var(--ink)]">0.00 (h=4.0)</span>
              </div>
            </div>
            <p className="text-xs text-[var(--ink-muted)] pt-2 border-t" style={{ borderColor: "var(--border-soft)" }}>
              Calculation based on 14-day median and MAD. Consider consulting a doctor if persistent drift is noted.
            </p>
          </Disclosure>
        </section>

        {/* ── 8. EmptyState & SkeletonLoader ── */}
        <section className="space-y-4">
          <SectionHeader
            eyebrow="States & Shimmers"
            title="EmptyState & SkeletonLoader"
            description="Supportive empty placeholders and calm skeleton shimmers that respect reduced-motion settings."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <EmptyState
              title="No Memories Uploaded Yet"
              description="Upload your family photos, traditional songs or childhood stories to personalize daily cognitive stimulation."
              action={{
                label: "Add First Memory",
                onClick: () => alert("Open upload modal"),
              }}
            />

            <div className="p-6 rounded-[var(--radius-card)] border bg-[var(--surface)] space-y-4" style={{ borderColor: "var(--border)" }}>
              <span className="text-xs font-bold uppercase tracking-wider block text-[var(--ink-muted)]">
                Shimmer Loading Previews
              </span>
              <SkeletonLoader variant="text" count={2} />
              <div className="flex items-center gap-3">
                <SkeletonLoader variant="circle" />
                <div className="flex-1 space-y-2">
                  <SkeletonLoader variant="text" />
                  <SkeletonLoader variant="text" className="w-2/3" />
                </div>
              </div>
              <SkeletonLoader variant="button" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
