"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { FamilyCallBar } from "@/components/patient/FamilyCallBar";
import { VoiceButton } from "@/components/patient/VoiceButton";
import { PromptBubble } from "@/components/patient/PromptBubble";
import { ActivityShell } from "@/components/patient/ActivityShell";
import { ReminderCard } from "@/components/patient/ReminderCard";
import { BigButton } from "@/components/patient/BigButton";

export default function ComponentsDemoPage() {
  const [activeTab, setActiveTab] = useState<
    "all" | "family_call" | "voice_button" | "prompt_bubble" | "activity_shell" | "reminder_card"
  >("all");

  const [voiceResult, setVoiceResult] = useState<string>("");

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-bold text-base px-4 py-2 rounded-xl border no-underline"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--primary)",
            minHeight: "44px",
          }}
        >
          <span>← Back to Home</span>
        </Link>
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider"
          style={{
            background: "var(--primary-light)",
            borderColor: "var(--primary)",
            color: "var(--primary-dark)",
          }}
        >
          DESIGN.md §3 Component Showcase
        </span>
      </div>

      <header className="space-y-2">
        <h1
          className="text-3xl font-extrabold tracking-tight"
          style={{ color: "var(--ink)" }}
        >
          Patient Mode Component System
        </h1>
        <p className="text-base" style={{ color: "var(--ink-soft)" }}>
          Strictly engineered for low cognitive load, minimum 64px primary touch targets, zero hardcoded hex, and high-contrast accessibility.
        </p>
      </header>

      {/* Filter Tabs */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-2"
        role="tablist"
        aria-label="Component filters"
      >
        {[
          { id: "all", label: "All Components" },
          { id: "family_call", label: "FamilyCallBar" },
          { id: "voice_button", label: "VoiceButton" },
          { id: "prompt_bubble", label: "PromptBubble" },
          { id: "activity_shell", label: "ActivityShell" },
          { id: "reminder_card", label: "ReminderCard" },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="px-4 py-2 rounded-full font-bold text-xs md:text-sm whitespace-nowrap border transition-all cursor-pointer"
            style={{
              background: activeTab === tab.id ? "var(--primary)" : "var(--surface)",
              color: activeTab === tab.id ? "var(--primary-ink)" : "var(--ink)",
              borderColor: activeTab === tab.id ? "var(--primary)" : "var(--border)",
              minHeight: "44px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. FamilyCallBar */}
      {(activeTab === "all" || activeTab === "family_call") && (
        <section
          className="p-6 rounded-[var(--radius-card)] border space-y-4 shadow-xs"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          aria-labelledby="comp-family-call-bar"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Component 1
            </span>
            <h2 id="comp-family-call-bar" className="text-xl font-bold" style={{ color: "var(--ink)" }}>
              FamilyCallBar (Persistent Speed Dial)
            </h2>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Always-visible one-tap call buttons for family members with photos, relation labels, and 64px tap zones.
            </p>
          </div>
          <FamilyCallBar />
        </section>
      )}

      {/* 2. VoiceButton */}
      {(activeTab === "all" || activeTab === "voice_button") && (
        <section
          className="p-6 rounded-[var(--radius-card)] border space-y-4 shadow-xs"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          aria-labelledby="comp-voice-button"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Component 2
            </span>
            <h2 id="comp-voice-button" className="text-xl font-bold" style={{ color: "var(--ink)" }}>
              VoiceButton (Explicit Tap-To-Speak)
            </h2>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Complies with privacy rule 02 (no always-on mic). Shows visual waveform feedback while listening.
            </p>
          </div>
          <VoiceButton
            onSpeechResult={(transcript) => setVoiceResult(transcript)}
          />
          {voiceResult && (
            <div
              className="p-4 rounded-xl border text-sm"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border-soft)",
                color: "var(--ink)",
              }}
            >
              <strong>Recognized Speech:</strong> &ldquo;{voiceResult}&rdquo;
            </div>
          )}
        </section>
      )}

      {/* 3. PromptBubble */}
      {(activeTab === "all" || activeTab === "prompt_bubble") && (
        <section
          className="p-6 rounded-[var(--radius-card)] border space-y-4 shadow-xs"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          aria-labelledby="comp-prompt-bubble"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Component 3
            </span>
            <h2 id="comp-prompt-bubble" className="text-xl font-bold" style={{ color: "var(--ink)" }}>
              PromptBubble (Calm Guidance with Audio Trigger)
            </h2>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Max 2 short sentences, 22px+ readable typography, and an accessible read-aloud button.
            </p>
          </div>
          <PromptBubble
            message="Do you remember who took this harvest photo in Tezpur?"
            subtext="Take your time. There is no rush."
          />
        </section>
      )}

      {/* 4. ReminderCard */}
      {(activeTab === "all" || activeTab === "reminder_card") && (
        <section
          className="p-6 rounded-[var(--radius-card)] border space-y-4 shadow-xs"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          aria-labelledby="comp-reminder-card"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Component 4
            </span>
            <h2 id="comp-reminder-card" className="text-xl font-bold" style={{ color: "var(--ink)" }}>
              ReminderCard (Amber Highlighted Routine)
            </h2>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              High-visibility daily orientation reminder with a 64px confirmation button and gentle snooze option.
            </p>
          </div>
          <ReminderCard
            type="medicine"
            title="Afternoon Blood Pressure Medicine"
            timeText="2:00 PM • After Lunch"
            instructions="Take one tablet with a full glass of lukewarm water."
          />
        </section>
      )}

      {/* 5. ActivityShell Preview */}
      {(activeTab === "all" || activeTab === "activity_shell") && (
        <section
          className="p-6 rounded-[var(--radius-card)] border space-y-4 shadow-xs"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          aria-labelledby="comp-activity-shell"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Component 5
            </span>
            <h2 id="comp-activity-shell" className="text-xl font-bold" style={{ color: "var(--ink)" }}>
              ActivityShell (Calm One-Task Frame)
            </h2>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Provides consistent navigation, persistent home & family call triggers, orientation header, and calm exit options.
            </p>
          </div>
          <div className="border-2 rounded-2xl p-2" style={{ borderColor: "var(--border-soft)" }}>
            <ActivityShell
              title="Recognize the Cultural Item"
              subtitle="Touch the card that matches what you see"
              onSkip={() => alert("Gentle break requested.")}
            >
              <div className="py-6 text-center space-y-4">
                <div
                  className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-5xl border-2"
                  style={{
                    background: "var(--primary-light)",
                    borderColor: "var(--primary)",
                  }}
                  aria-hidden="true"
                >
                  🌾
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                  <BigButton label="Gamosa" variant="surface" onClick={() => {}} />
                  <BigButton label="Dheki" variant="primary" onClick={() => {}} />
                </div>
              </div>
            </ActivityShell>
          </div>
        </section>
      )}
    </div>
  );
}
