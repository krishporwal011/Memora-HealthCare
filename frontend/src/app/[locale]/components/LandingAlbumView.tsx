"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { Flower2, Home as HomeIcon, Stethoscope, ArrowRight, ShieldCheck, WifiOff, Languages, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

interface LandingAlbumViewProps {
  onToggleGallery?: () => void;
}

export function LandingAlbumView({ onToggleGallery }: LandingAlbumViewProps) {
  const t = useTranslations("Roles");
  const tCommon = useTranslations("Common");

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* ── Compact Hero Section (<= 40vh) ── */}
      <section
        className="relative overflow-hidden px-4 py-8 md:py-10 text-center"
        style={{
          background: "var(--primary)",
          maxHeight: "42vh",
        }}
        aria-labelledby="hero-heading"
      >
        <div className="relative max-w-2xl mx-auto space-y-2">
          {/* Logo Mark */}
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl font-extrabold mx-auto border-2 shadow-sm"
            style={{
              background: "var(--accent)",
              color: "var(--accent-ink)",
              borderColor: "var(--accent-light)",
            }}
            aria-hidden="true"
          >
            M
          </div>

          <h1
            id="hero-heading"
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: "var(--primary-ink)" }}
          >
            Memora
          </h1>
          <p
            className="text-lg md:text-xl font-semibold"
            style={{ color: "var(--primary-light)" }}
          >
            Memories that stay close.
          </p>
          <p
            className="text-xs md:text-sm leading-relaxed max-w-md mx-auto"
            style={{ color: "var(--primary-light)", opacity: 0.9 }}
          >
            A calm digital companion for remembering, connecting, and supporting everyday cognitive wellbeing — in your language, offline, always.
          </p>

          {onToggleGallery && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onToggleGallery}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 cursor-pointer"
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "var(--primary-ink)",
                }}
              >
                <Sparkles size={14} aria-hidden="true" />
                <span>Switch to Cinematic Gallery</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Cultural Woven Motif Stripe */}
      <div className="woven-edge" aria-hidden="true" />

      {/* ── Role Selection (Immediately visible above the fold) ── */}
      <section
        id="roles-section"
        className="flex-1 px-4 py-6 md:py-8 max-w-5xl w-full mx-auto"
        aria-label="Choose your role"
      >
        <div className="text-center mb-6">
          <h2
            className="text-xs md:text-sm font-bold uppercase tracking-widest inline-block"
            style={{ color: "var(--ink-muted)" }}
          >
            {t("selectRole")}
          </h2>
        </div>

        {/* 3 Role Cards in Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* 1. Patient / Elder Role */}
          <Link
            href="/play"
            className="group flex flex-col justify-between rounded-[var(--radius-card)] p-6 no-underline border-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              background: "var(--surface)",
              borderColor: "var(--primary)",
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    background: "var(--primary)",
                    color: "var(--primary-ink)",
                  }}
                  aria-hidden="true"
                >
                  <Flower2 size={28} />
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                  style={{
                    background: "var(--primary-light)",
                    color: "var(--primary-dark)",
                  }}
                >
                  Elder Mode
                </span>
              </div>

              <div>
                <span
                  className="text-xl md:text-2xl font-bold block leading-snug"
                  style={{ color: "var(--ink)" }}
                >
                  {t("patientTitle")}
                </span>
                <span
                  className="text-sm block mt-1.5 leading-relaxed"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {t("patientSubtitle")}
                </span>
              </div>
            </div>

            <div
              className="pt-6 mt-4 border-t flex items-center justify-between text-sm font-bold"
              style={{
                borderColor: "var(--border-soft)",
                color: "var(--primary)",
              }}
            >
              <span>Open Activities</span>
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </Link>

          {/* 2. Caregiver / Family Role */}
          <Link
            href="/care"
            className="group flex flex-col justify-between rounded-[var(--radius-card)] p-6 no-underline border-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              background: "var(--surface)",
              borderColor: "var(--accent)",
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    background: "var(--accent-dark)",
                    color: "var(--accent-ink)",
                  }}
                  aria-hidden="true"
                >
                  <HomeIcon size={28} />
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                  style={{
                    background: "var(--accent-light)",
                    color: "var(--accent-dark)",
                  }}
                >
                  Family Portal
                </span>
              </div>

              <div>
                <span
                  className="text-xl md:text-2xl font-bold block leading-snug"
                  style={{ color: "var(--ink)" }}
                >
                  {t("caregiverTitle")}
                </span>
                <span
                  className="text-sm block mt-1.5 leading-relaxed"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {t("caregiverSubtitle")}
                </span>
              </div>
            </div>

            <div
              className="pt-6 mt-4 border-t flex items-center justify-between text-sm font-bold"
              style={{
                borderColor: "var(--border-soft)",
                color: "var(--accent-dark)",
              }}
            >
              <span>Manage Memories</span>
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </Link>

          {/* 3. ASHA / Clinician Role */}
          <Link
            href="/asha"
            className="group flex flex-col justify-between rounded-[var(--radius-card)] p-6 no-underline border-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              background: "var(--surface)",
              borderColor: "var(--success)",
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    background: "var(--success)",
                    color: "var(--primary-ink)",
                  }}
                  aria-hidden="true"
                >
                  <Stethoscope size={28} />
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                  style={{
                    background: "var(--success-light)",
                    color: "var(--success)",
                  }}
                >
                  Health Worker
                </span>
              </div>

              <div>
                <span
                  className="text-xl md:text-2xl font-bold block leading-snug"
                  style={{ color: "var(--ink)" }}
                >
                  {t("ashaTitle")}
                </span>
                <span
                  className="text-sm block mt-1.5 leading-relaxed"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {t("ashaSubtitle")}
                </span>
              </div>
            </div>

            <div
              className="pt-6 mt-4 border-t flex items-center justify-between text-sm font-bold"
              style={{
                borderColor: "var(--border-soft)",
                color: "var(--success)",
              }}
            >
              <span>View Triage</span>
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </Link>
        </div>

        {/* ── 3 Clear Trust & Privacy Points ── */}
        <div
          className="mt-8 rounded-[var(--radius-card)] p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border text-center"
          style={{
            background: "var(--surface-2)",
            borderColor: "var(--border-soft)",
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <ShieldCheck size={22} style={{ color: "var(--success)" }} aria-hidden="true" />
            <span className="text-xs md:text-sm font-bold" style={{ color: "var(--ink)" }}>
              Data Residency in India (Mumbai)
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <WifiOff size={22} style={{ color: "var(--primary)" }} aria-hidden="true" />
            <span className="text-xs md:text-sm font-bold" style={{ color: "var(--ink)" }}>
              100% Offline-First Architecture
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Languages size={22} style={{ color: "var(--accent-dark)" }} aria-hidden="true" />
            <span className="text-xs md:text-sm font-bold" style={{ color: "var(--ink)" }}>
              6 North Eastern Languages
            </span>
          </div>
        </div>

        {/* Non-diagnostic disclaimer */}
        <p
          className="mt-6 text-xs text-center leading-relaxed max-w-xl mx-auto"
          style={{ color: "var(--ink-muted)" }}
        >
          {tCommon("disclaimer")}
        </p>
      </section>
    </div>
  );
}
