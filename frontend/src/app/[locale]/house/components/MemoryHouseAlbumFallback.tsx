"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Box, Sparkles, Volume2, VolumeX, X, Calendar, Users, Camera } from "lucide-react";
import { MemoryCard, type MemoryType } from "@/components/ui/MemoryCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BigButton } from "@/components/ui/BigButton";

export interface HouseMemory {
  id: string;
  type: MemoryType;
  title: string;
  caption: string;
  year: number;
  people: string[];
  story: string;
  color: string;
}

export const HOUSE_MEMORIES: HouseMemory[] = [
  {
    id: "hm-1",
    type: "photo",
    title: "Rongali Bihu Courtyard (1985)",
    caption: "Family blessing ceremony with phulam gamosa in Tezpur courtyard.",
    year: 1985,
    people: ["Grandmother", "Jonali", "Ranjit"],
    story: "In 1985, our family gathered in Tezpur for Rongali Bihu. Grandmother draped the hand-woven phulam gamosa with sweet pitha and prayers for health.",
    color: "var(--accent)",
  },
  {
    id: "hm-2",
    type: "photo",
    title: "Brahmaputra Ferry Crossing (1991)",
    caption: "Sunrise wooden boat ferry crossing near Silghat tea hills.",
    year: 1991,
    people: ["Father", "Ranjit"],
    story: "Taking the early morning wooden boat across the mighty Brahmaputra river near Silghat. The water was golden in the autumn morning mist.",
    color: "var(--primary)",
  },
  {
    id: "hm-3",
    type: "song",
    title: "Goalpariya Folk Melody (1974)",
    caption: "Traditional folk song sung during family gatherings by the earthen lamp.",
    year: 1974,
    people: ["Mother", "Pratima"],
    story: "Mother sang this evening melody by the oil lamp. It brought calmness to the whole courtyard as evening stars appeared.",
    color: "var(--accent-dark)",
  },
  {
    id: "hm-4",
    type: "photo",
    title: "Jorhat Tea Estate Harvest (1998)",
    caption: "Walking the lush green tea garden trails with Uncle Hemen.",
    year: 1998,
    people: ["Uncle Hemen", "Jonali"],
    story: "Walking through rows of tea bushes in Jorhat with uncle Hemen, breathing the crisp morning air and listening to songbirds.",
    color: "var(--success)",
  },
];

interface MemoryHouseAlbumFallbackProps {
  reason?: string;
  onRetry3D?: () => void;
}

export function MemoryHouseAlbumFallback({ reason, onRetry3D }: MemoryHouseAlbumFallbackProps) {
  const [selectedMemory, setSelectedMemory] = useState<HouseMemory | null>(null);
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
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
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

        <div className="flex items-center gap-2">
          {onRetry3D && (
            <button
              type="button"
              onClick={onRetry3D}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
              style={{
                background: "var(--surface)",
                borderColor: "var(--primary)",
                color: "var(--primary)",
              }}
            >
              <Box size={14} />
              <span>Try 3D View</span>
            </button>
          )}

          <span className="text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider text-[var(--accent-dark)] bg-[var(--accent-light)] border-[var(--accent)]">
            Album View (Calm)
          </span>
        </div>
      </div>

      {/* ── Section Header ── */}
      <SectionHeader
        eyebrow="Family Architecture Archive"
        title="Memory House Album"
        description={
          reason
            ? `Displaying static album view (${reason}). All family memories and story audio playback remain fully accessible.`
            : "An editorial collection of framed family milestones, songs, and stories across North East India."
        }
      />

      {/* ── Memory Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {HOUSE_MEMORIES.map((m) => (
          <MemoryCard
            key={m.id}
            memoryType={m.type}
            caption={m.caption}
            year={m.year}
            people={m.people}
            isApproved
            onClick={() => setSelectedMemory(m)}
          />
        ))}
      </div>

      {/* ── Detail Modal ── */}
      {selectedMemory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedMemory.title}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div
            className="w-full max-w-lg rounded-[var(--radius-card)] p-6 md:p-8 space-y-6 shadow-2xl border-2"
            style={{
              background: "var(--surface)",
              borderColor: "var(--primary)",
              color: "var(--ink)",
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border-soft)" }}>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                Framed Memory
              </span>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                  setIsSpeaking(false);
                  setSelectedMemory(null);
                }}
                className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
                style={{ borderColor: "var(--border)" }}
                aria-label="Close memory detail"
              >
                <X size={20} />
              </button>
            </div>

            <div
              className="w-full aspect-video rounded-[var(--radius-md)] flex flex-col items-center justify-center border"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
              }}
            >
              <Camera size={44} style={{ color: "var(--accent)" }} />
              <span className="text-xs font-bold text-[var(--ink-muted)] mt-2">
                Synthetic Framed Archive
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-bold">{selectedMemory.title}</h3>
              <div className="flex items-center gap-3 text-xs font-semibold" style={{ color: "var(--ink-soft)" }}>
                <span className="inline-flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{selectedMemory.year}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users size={14} />
                  <span>{selectedMemory.people.join(", ")}</span>
                </span>
              </div>
              <p className="text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {selectedMemory.story}
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <BigButton
                label={isSpeaking ? "Stop Reading" : "Listen to Story"}
                icon={isSpeaking ? <VolumeX size={24} /> : <Volume2 size={24} />}
                variant="primary"
                size="large"
                className="w-full"
                onClick={() => handleSpeak(selectedMemory.story)}
              />

              <button
                type="button"
                onClick={() => setSelectedMemory(null)}
                className="w-full text-center py-2 text-sm font-semibold underline text-[var(--ink-soft)] cursor-pointer"
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
