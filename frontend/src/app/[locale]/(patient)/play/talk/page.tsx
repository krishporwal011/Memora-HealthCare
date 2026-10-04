"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Heart, RefreshCw } from "lucide-react";
import { DayHeader } from "@/components/ui/DayHeader";
import { PromptBubble } from "@/components/patient/PromptBubble";
import { VoiceButton } from "@/components/patient/VoiceButton";
import { BigButton } from "@/components/ui/BigButton";

const SCRIPTED_CONVERSATIONS = [
  {
    prompt: "Hello Bhaben! How are you feeling this pleasant morning?",
    subtext: "Tap the button below and speak gently, or choose an answer.",
    replies: [
      { text: "I am feeling peaceful today.", response: "It is wonderful to hear that. Your home is peaceful and your daughter Jonali will visit soon." },
      { text: "Tell me about our family Bihu.", response: "In 1985, our family gathered in Tezpur for Rongali Bihu. Grandmother gave the phulam gamosa with sweet pitha." },
      { text: "What time is tea today?", response: "Tea time is at four in the afternoon. A warm cup of Assam tea is waiting for you." },
    ],
  },
  {
    prompt: "Do you remember the wooden ferry across the Brahmaputra river?",
    subtext: "The golden autumn waters were so calm near Silghat.",
    replies: [
      { text: "Yes, Ranjit and I rode it together.", response: "That is right. You and Ranjit crossed at sunrise, watching the morning mist rise over the water." },
      { text: "The boat had a wooden roof.", response: "That is right. A sturdy Assam boat that carried the family safely across." },
    ],
  },
];

export default function PatientTalkPage() {
  const [topicIndex, setTopicIndex] = useState(0);
  const [activeResponse, setActiveResponse] = useState<string | null>(null);

  const currentTopic = SCRIPTED_CONVERSATIONS[topicIndex % SCRIPTED_CONVERSATIONS.length];

  const handleSpeechResult = (transcript: string) => {
    // Generate a calm, supportive reply from approved memories
    setActiveResponse(`I heard you say: "${transcript}". Your memories are cherished safely by your family.`);
  };

  const handleSelectReply = (reply: { text: string; response: string }) => {
    setActiveResponse(reply.response);
  };

  const handleNextTopic = () => {
    setActiveResponse(null);
    setTopicIndex((prev) => prev + 1);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-2xl mx-auto w-full px-4 py-5 pb-8">
      {/* ── Orientation Header ── */}
      <DayHeader patientName="Bhaben" />

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/play"
          className="inline-flex items-center gap-2 text-base md:text-lg font-bold px-4 py-2.5 rounded-full border no-underline transition-all active:scale-95 shadow-xs"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--primary)",
            minHeight: "56px",
          }}
          aria-label="Return to patient activities"
        >
          <ArrowLeft size={22} aria-hidden="true" />
          <span>Back to Activities</span>
        </Link>

        <button
          type="button"
          onClick={handleNextTopic}
          className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-full border transition-all active:scale-95 cursor-pointer"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--ink-soft)",
            minHeight: "48px",
          }}
          aria-label="Change conversation topic"
        >
          <RefreshCw size={16} aria-hidden="true" />
          <span>New Topic</span>
        </button>
      </div>

      {/* ── Title ── */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
          Talk with Memora
        </h1>
        <p className="text-lg font-medium" style={{ color: "var(--ink-soft)" }}>
          A gentle, supportive companion for your family memories.
        </p>
      </div>

      {/* ── Prompt Guidance ── */}
      <PromptBubble
        message={currentTopic.prompt}
        subtext={currentTopic.subtext}
      />

      {/* ── Active Response Banner ── */}
      {activeResponse && (
        <div
          role="status"
          aria-live="polite"
          className="p-5 rounded-[var(--radius-card)] border-2 space-y-2 animate-fade-in"
          style={{
            background: "var(--primary-light)",
            borderColor: "var(--primary)",
            color: "var(--primary-dark)",
          }}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <Heart size={16} className="text-[var(--accent)]" />
            <span>Memora Response</span>
          </div>
          <p className="text-xl font-bold leading-relaxed">{activeResponse}</p>
        </div>
      )}

      {/* ── Scripted Reply Options (Min 64px touch targets) ── */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider block text-[var(--ink-muted)]">
          Tap an answer or use voice below:
        </span>
        {currentTopic.replies.map((reply, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectReply(reply)}
            className="w-full p-4 rounded-[var(--radius-card)] border-2 text-left text-lg md:text-xl font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--ink)",
              minHeight: "var(--touch-target-patient)",
            }}
          >
            {reply.text}
          </button>
        ))}
      </div>

      {/* ── Voice Assistant Button (Explicit tap only) ── */}
      <div className="pt-2">
        <VoiceButton
          label="Tap to Speak with Memora"
          activeLabel="Memora is listening..."
          onSpeechResult={handleSpeechResult}
        />
      </div>
    </div>
  );
}
