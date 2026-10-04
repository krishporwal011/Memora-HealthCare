"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, BookOpen, Check } from "lucide-react";
import { useMemoraStore, type DisplayMode } from "@/lib/store/useMemoraStore";

export function EntryChoiceModal() {
  const { displayMode, setDisplayMode, calmMode } = useMemoraStore();
  const [hasChosen, setHasChosen] = useState(true);

  useEffect(() => {
    // Check if user has previously made an explicit choice
    const saved = localStorage.getItem("memora-entry-chosen");
    if (!saved) {
      setHasChosen(false);
    }
  }, []);

  const handleSelect = (mode: DisplayMode) => {
    setDisplayMode(mode);
    setHasChosen(true);
    localStorage.setItem("memora-entry-chosen", "true");
  };

  if (hasChosen || calmMode) return null;

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label="Choose Experience Mode"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(26, 25, 23, 0.8)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-lg rounded-[var(--radius-card)] p-6 md:p-8 space-y-6 border-2 shadow-2xl text-center"
        style={{
          background: "var(--surface)",
          borderColor: "var(--primary)",
          color: "var(--ink)",
        }}
      >
        <div className="space-y-2">
          <div
            className="w-12 h-12 mx-auto rounded-full flex items-center justify-center border"
            style={{
              background: "var(--accent-light)",
              borderColor: "var(--accent)",
              color: "var(--accent-dark)",
            }}
            aria-hidden="true"
          >
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome to Memora
          </h2>
          <p className="text-base font-medium max-w-sm mx-auto" style={{ color: "var(--ink-soft)" }}>
            Choose how you would like to explore the platform today. You can change this at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Gallery Option */}
          <button
            type="button"
            onClick={() => handleSelect("gallery")}
            className="p-5 rounded-[var(--radius-md)] border-2 flex flex-col justify-between transition-all hover:shadow-md active:scale-95 cursor-pointer"
            style={{
              background: displayMode === "gallery" ? "var(--primary-light)" : "var(--surface-2)",
              borderColor: displayMode === "gallery" ? "var(--primary)" : "var(--border)",
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Sparkles size={22} style={{ color: "var(--primary)" }} />
                {displayMode === "gallery" && <Check size={18} style={{ color: "var(--primary)" }} />}
              </div>
              <span className="font-extrabold text-lg block" style={{ color: "var(--ink)" }}>
                Gallery Mode
              </span>
              <p className="text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                Cinematic showcase with chapters, interactive media, and rich visual storytelling.
              </p>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider mt-4 block" style={{ color: "var(--primary)" }}>
              Recommended for demo
            </span>
          </button>

          {/* Album Option */}
          <button
            type="button"
            onClick={() => handleSelect("album")}
            className="p-5 rounded-[var(--radius-md)] border-2 flex flex-col justify-between transition-all hover:shadow-md active:scale-95 cursor-pointer"
            style={{
              background: displayMode === "album" ? "var(--primary-light)" : "var(--surface-2)",
              borderColor: displayMode === "album" ? "var(--primary)" : "var(--border)",
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <BookOpen size={22} style={{ color: "var(--accent-dark)" }} />
                {displayMode === "album" && <Check size={18} style={{ color: "var(--primary)" }} />}
              </div>
              <span className="font-extrabold text-lg block" style={{ color: "var(--ink)" }}>
                Album Mode
              </span>
              <p className="text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                Calm, static editorial layout on warm paper surfaces. Zero motion or distractions.
              </p>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider mt-4 block" style={{ color: "var(--accent-dark)" }}>
              Calm & Low Data
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleSelect("gallery")}
          className="text-xs font-semibold underline"
          style={{ color: "var(--ink-muted)" }}
        >
          Skip choice and continue to default
        </button>
      </div>
    </aside>
  );
}
