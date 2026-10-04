"use client";

import React from "react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { ArrowLeft, Globe, Type, Sun, Activity, Volume2, Check } from "lucide-react";
import { useMemoraStore, type FontSizePreference } from "@/lib/store/useMemoraStore";
import { SectionHeader } from "@/components/ui/SectionHeader";

const LOCALES = [
  { code: "en", label: "English", script: "Latin (English)" },
  { code: "hi", label: "हिन्दी", script: "Devanagari (Hindi)" },
  { code: "as", label: "অসমীয়া", script: "Bengali-Assamese (Assamese)" },
  { code: "bn", label: "বাংলা", script: "Bengali (Bengali)" },
  { code: "brx", label: "बड़ो", script: "Devanagari (Bodo)" },
  { code: "mni", label: "ꯃꯩ", script: "Meetei Mayek (Manipuri)" },
];

export default function SettingsPage() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const {
    calmMode,
    toggleCalmMode,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    audioAssistance,
    setAudioAssistance,
  } = useMemoraStore();

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

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

        <span className="text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider text-[var(--ink-soft)] bg-[var(--surface-2)] border-[var(--border)]">
          Preferences
        </span>
      </div>

      {/* ── Section Header ── */}
      <SectionHeader
        eyebrow="Accessibility & Comfort"
        title="Settings & Display Preferences"
        description="Customize language, typography, contrast, and calm motion modes. All settings are saved locally on this device."
      />

      <div className="space-y-6">
        {/* 1. Language Preference */}
        <section
          className="rounded-[var(--radius-card)] p-6 border space-y-4 shadow-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary)]">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "var(--ink)" }}>Language & Regional Script</h3>
              <p className="text-xs md:text-sm text-[var(--ink-soft)]">
                Optimized with locally bundled Noto fonts for North Eastern languages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {LOCALES.map((loc) => {
              const isActive = locale === loc.code;
              return (
                <button
                  key={loc.code}
                  type="button"
                  onClick={() => handleLanguageChange(loc.code)}
                  className="p-4 rounded-[var(--radius-md)] border-2 flex items-center justify-between text-left transition-all active:scale-95 cursor-pointer"
                  style={{
                    background: isActive ? "var(--primary-light)" : "var(--surface-2)",
                    borderColor: isActive ? "var(--primary)" : "var(--border-soft)",
                    color: "var(--ink)",
                    minHeight: "56px",
                  }}
                  aria-pressed={isActive}
                >
                  <div>
                    <span className="font-extrabold text-base block">{loc.label}</span>
                    <span className="text-xs text-[var(--ink-soft)]">{loc.script}</span>
                  </div>
                  {isActive && <Check size={18} style={{ color: "var(--primary)" }} />}
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Font Size Scaling */}
        <section
          className="rounded-[var(--radius-card)] p-6 border space-y-4 shadow-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--accent-light)] text-[var(--accent-dark)] border border-[var(--accent)]">
              <Type size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "var(--ink)" }}>Text Size & Zoom</h3>
              <p className="text-xs md:text-sm text-[var(--ink-soft)]">
                Tested up to 200% text zoom for elderly vision clarity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {(["medium", "large", "xlarge"] as FontSizePreference[]).map((size) => {
              const isActive = fontSize === size;
              const labels: Record<FontSizePreference, string> = {
                medium: "Standard (100%)",
                large: "Large (130%)",
                xlarge: "Extra Large (160%)",
              };
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className="p-4 rounded-[var(--radius-md)] border-2 text-center font-bold text-sm transition-all active:scale-95 cursor-pointer"
                  style={{
                    background: isActive ? "var(--accent-light)" : "var(--surface-2)",
                    borderColor: isActive ? "var(--accent)" : "var(--border)",
                    color: isActive ? "var(--accent-dark)" : "var(--ink)",
                    minHeight: "52px",
                  }}
                  aria-pressed={isActive}
                >
                  {labels[size]}
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Calm Mode Toggle */}
        <section
          className="rounded-[var(--radius-card)] p-6 border flex items-center justify-between gap-4 shadow-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary)]">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "var(--ink)" }}>Calm Mode</h3>
              <p className="text-xs md:text-sm text-[var(--ink-soft)]">
                Disables all 3D, parallax, smooth scrolling, and animations for reduced motion and low-end devices.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleCalmMode}
            className="px-5 py-2.5 rounded-full font-bold text-sm border transition-all active:scale-95 cursor-pointer shrink-0"
            style={{
              background: calmMode ? "var(--primary)" : "var(--surface-2)",
              color: calmMode ? "var(--primary-ink)" : "var(--ink-soft)",
              borderColor: calmMode ? "var(--primary-dark)" : "var(--border)",
              minHeight: "48px",
            }}
            aria-pressed={calmMode}
          >
            {calmMode ? "Calm: ON" : "Calm: OFF"}
          </button>
        </section>

        {/* 4. High Contrast Mode */}
        <section
          className="rounded-[var(--radius-card)] p-6 border flex items-center justify-between gap-4 shadow-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--border)]">
              <Sun size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "var(--ink)" }}>High Contrast Mode</h3>
              <p className="text-xs md:text-sm text-[var(--ink-soft)]">
                Boosts text contrast to 12:1 and reinforces visual boundaries.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className="px-5 py-2.5 rounded-full font-bold text-sm border transition-all active:scale-95 cursor-pointer shrink-0"
            style={{
              background: highContrast ? "var(--ink)" : "var(--surface-2)",
              color: highContrast ? "var(--bg)" : "var(--ink-soft)",
              borderColor: highContrast ? "var(--ink)" : "var(--border)",
              minHeight: "48px",
            }}
            aria-pressed={highContrast}
          >
            {highContrast ? "Enabled" : "Disabled"}
          </button>
        </section>

        {/* 5. Audio Assistance */}
        <section
          className="rounded-[var(--radius-card)] p-6 border flex items-center justify-between gap-4 shadow-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary)]">
              <Volume2 size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "var(--ink)" }}>Voice & Spoken Audio Prompts</h3>
              <p className="text-xs md:text-sm text-[var(--ink-soft)]">
                Enables read-aloud buttons and regional spoken prompts during patient memory activities.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAudioAssistance(!audioAssistance)}
            className="px-5 py-2.5 rounded-full font-bold text-sm border transition-all active:scale-95 cursor-pointer shrink-0"
            style={{
              background: audioAssistance ? "var(--primary)" : "var(--surface-2)",
              color: audioAssistance ? "var(--primary-ink)" : "var(--ink-soft)",
              borderColor: audioAssistance ? "var(--primary-dark)" : "var(--border)",
              minHeight: "48px",
            }}
            aria-pressed={audioAssistance}
          >
            {audioAssistance ? "Active" : "Muted"}
          </button>
        </section>
      </div>
    </div>
  );
}
