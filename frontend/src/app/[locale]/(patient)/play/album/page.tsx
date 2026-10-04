"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Volume2, VolumeX, Calendar, Users, X, Image as ImageIcon } from "lucide-react";
import { DayHeader } from "@/components/ui/DayHeader";
import { MemoryCard, type MemoryType } from "@/components/ui/MemoryCard";
import { BigButton } from "@/components/ui/BigButton";

interface PatientMemory {
  id: string;
  type: MemoryType;
  caption: string;
  year?: number;
  people?: string[];
  imageUrl?: string;
  storyNarrative: string;
}

const DEMO_APPROVED_MEMORIES: PatientMemory[] = [
  {
    id: "mem-01",
    type: "photo",
    caption: "Rongali Bihu in Tezpur Courtyard",
    year: 1985,
    people: ["Jonali", "Grandmother"],
    storyNarrative: "In 1985, our family gathered in Tezpur for Rongali Bihu. Grandmother draped the woven phulam gamosa with blessing prayers for the harvest.",
  },
  {
    id: "mem-02",
    type: "photo",
    caption: "Brahmaputra Ferry Crossing at Sunrise",
    year: 1991,
    people: ["Ranjit", "Father"],
    storyNarrative: "Taking the early morning wooden ferry across the Brahmaputra river near Silghat. The water was calm and golden in the autumn mist.",
  },
  {
    id: "mem-03",
    type: "song",
    caption: "Traditional Borgeet Prayer Song",
    year: 1974,
    people: ["Mother"],
    storyNarrative: "Mother sang this devotional Borgeet every evening during the sandhya prayer by the earthen lamp.",
  },
  {
    id: "mem-04",
    type: "photo",
    caption: "Tea Garden Harvest in Jorhat",
    year: 1998,
    people: ["Uncle Hemen", "Jonali"],
    storyNarrative: "Walking through the lush green rows of the tea estate in Jorhat. Fresh autumn leaves were plucked with song and laughter.",
  },
];

export default function PatientAlbumPage() {
  const [selectedMemory, setSelectedMemory] = useState<PatientMemory | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88; // Calm deliberate pace
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const closeModal = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSelectedMemory(null);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-3xl mx-auto w-full px-4 py-5 pb-8">
      {/* ── Orientation Day Header ── */}
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
      </div>

      {/* ── Header ── */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
          Family Memories Album
        </h1>
        <p className="text-lg md:text-xl font-medium" style={{ color: "var(--ink-soft)" }}>
          Tap any memory photo to look closer and listen to the story.
        </p>
      </div>

      {/* ── Memory Cards Grid (Large, 64px+ target elements) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {DEMO_APPROVED_MEMORIES.map((memory) => (
          <MemoryCard
            key={memory.id}
            memoryType={memory.type}
            caption={memory.caption}
            year={memory.year}
            people={memory.people}
            imageUrl={memory.imageUrl}
            isApproved
            onClick={() => setSelectedMemory(memory)}
          />
        ))}
      </div>

      {/* ── Detail View Modal ── */}
      {selectedMemory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedMemory.caption}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(26, 25, 23, 0.75)" }}
        >
          <div
            className="w-full max-w-lg rounded-[var(--radius-card)] p-6 md:p-8 space-y-6 shadow-xl border-2"
            style={{
              background: "var(--surface)",
              borderColor: "var(--primary)",
              color: "var(--ink)",
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border-soft)" }}>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                Family Story
              </span>
              <button
                type="button"
                onClick={closeModal}
                className="w-12 h-12 rounded-full border flex items-center justify-center transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
                style={{ borderColor: "var(--border)" }}
                aria-label="Close memory detail"
              >
                <X size={24} />
              </button>
            </div>

            {/* Media placeholder */}
            <div
              className="w-full aspect-video rounded-[var(--radius-md)] flex flex-col items-center justify-center border"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
              }}
            >
              <ImageIcon size={48} style={{ color: "var(--primary)" }} />
              <span className="text-xs font-bold text-[var(--ink-muted)] mt-2">
                Family Archive Photo
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold">{selectedMemory.caption}</h2>
              <div className="flex items-center gap-3 text-sm font-semibold" style={{ color: "var(--ink-soft)" }}>
                {selectedMemory.year && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{selectedMemory.year}</span>
                  </span>
                )}
                {selectedMemory.people && (
                  <span className="inline-flex items-center gap-1">
                    <Users size={16} />
                    <span>{selectedMemory.people.join(", ")}</span>
                  </span>
                )}
              </div>
              <p className="text-lg leading-relaxed font-normal" style={{ color: "var(--ink-soft)" }}>
                {selectedMemory.storyNarrative}
              </p>
            </div>

            {/* Actions: Big Listen Button (64px) */}
            <div className="space-y-3 pt-2">
              <BigButton
                label={isSpeaking ? "Stop Reading" : "Listen to Story"}
                icon={isSpeaking ? <VolumeX size={26} /> : <Volume2 size={26} />}
                variant="primary"
                size="patient"
                onClick={() => handleSpeak(selectedMemory.storyNarrative)}
              />

              <button
                type="button"
                onClick={closeModal}
                className="w-full py-3 text-base font-semibold underline text-[var(--ink-soft)]"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
