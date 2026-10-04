"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  WifiOff,
  Languages,
  BookOpen,
  Activity,
  Heart,
  Eye,
  Camera,
  Layers,
  ChevronDown,
  Flower2,
} from "lucide-react";
import { useMemoraStore } from "@/lib/store/useMemoraStore";

interface LandingGalleryViewProps {
  onToggleAlbum: () => void;
}

export function LandingGalleryView({ onToggleAlbum }: LandingGalleryViewProps) {
  const { calmMode, toggleCalmMode } = useMemoraStore();
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsFinePointer(window.matchMedia("(pointer: fine)").matches);
    }

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: calmMode ? "auto" : "smooth" });
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden transition-colors duration-500"
      style={{
        background: "var(--ink)",
        color: "var(--bg)",
      }}
    >
      {/* ── Persistent Corner HUD ── */}
      <aside
        aria-label="Experience HUD"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 p-2 rounded-full border shadow-xl backdrop-blur-md"
        style={{
          background: "rgba(26, 25, 23, 0.85)",
          borderColor: "rgba(230, 244, 243, 0.2)",
        }}
      >
        <button
          type="button"
          onClick={() => scrollToSection("roles-chapter")}
          className="px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer"
          style={{
            background: "var(--primary)",
            color: "var(--primary-ink)",
            minHeight: "44px",
          }}
          aria-label="Jump directly to role cards"
        >
          Choose Role
        </button>

        <button
          type="button"
          onClick={onToggleAlbum}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 cursor-pointer"
          style={{
            background: "transparent",
            borderColor: "rgba(255, 255, 255, 0.2)",
            color: "var(--bg)",
            minHeight: "44px",
          }}
          aria-label="Switch to Album Mode"
        >
          <BookOpen size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Album Mode</span>
        </button>

        <button
          type="button"
          onClick={toggleCalmMode}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 cursor-pointer"
          style={{
            background: calmMode ? "var(--accent)" : "transparent",
            borderColor: calmMode ? "var(--accent-light)" : "rgba(255, 255, 255, 0.2)",
            color: calmMode ? "var(--accent-ink)" : "var(--bg)",
            minHeight: "44px",
          }}
          aria-pressed={calmMode}
          aria-label={`Calm mode: ${calmMode ? "On" : "Off"}`}
        >
          <Activity size={14} aria-hidden="true" />
          <span>{calmMode ? "Calm On" : "Calm"}</span>
        </button>
      </aside>

      {/* ── Optional Cursor Follower on Desktop (Fine Pointer Only) ── */}
      {isFinePointer && !calmMode && (
        <div
          className="fixed pointer-events-none z-30 transition-transform duration-75 ease-out hidden lg:block"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="w-10 h-10 rounded-full border flex items-center justify-center text-[10px] font-extrabold uppercase tracking-widest shadow-lg"
            style={{
              borderColor: "var(--accent)",
              background: "rgba(232, 163, 61, 0.2)",
              color: "var(--accent)",
              backdropFilter: "blur(2px)",
            }}
          >
            Explore
          </div>
        </div>
      )}

      {/* ── CHAPTER 1: The Memory Gap (Hero <= 45vh) ── */}
      <section
        className="relative min-h-[44vh] flex flex-col justify-center items-center text-center px-4 py-12 md:py-16 border-b"
        style={{ borderColor: "rgba(230, 244, 243, 0.15)" }}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider"
            style={{
              borderColor: "rgba(232, 163, 61, 0.4)",
              background: "rgba(232, 163, 61, 0.1)",
              color: "var(--accent)",
            }}
          >
            <Sparkles size={14} aria-hidden="true" />
            <span>Chapter I · The Memory Gap</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Memories are fragile.{" "}
            <span style={{ color: "var(--accent)" }}>Connection is not.</span>
          </h1>

          <p className="text-base sm:text-xl font-normal leading-relaxed max-w-xl mx-auto opacity-90">
            For older adults living with memory difficulties in North East India, dignity begins with familiar faces, local languages, and family memories that stay close.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => scrollToSection("roles-chapter")}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-base shadow-md transition-transform active:scale-95 cursor-pointer"
              style={{
                background: "var(--accent)",
                color: "var(--accent-ink)",
                minHeight: "56px",
              }}
            >
              <span>Explore Roles</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("memories-chapter")}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm border transition-colors hover:bg-white/10 cursor-pointer"
              style={{
                borderColor: "rgba(255, 255, 255, 0.2)",
                color: "var(--bg)",
                minHeight: "48px",
              }}
            >
              <span>Read the Story</span>
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* ── CHAPTER 2: Your Own Memories (Cultural Reminiscence) ── */}
      <section
        id="memories-chapter"
        className="px-4 py-16 md:py-24 max-w-6xl mx-auto border-b"
        style={{ borderColor: "rgba(230, 244, 243, 0.15)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span
              className="text-xs font-bold uppercase tracking-wider block"
              style={{ color: "var(--accent)" }}
            >
              Chapter II · Personal Reminiscence
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              A familiar song. A courtyard photo. A woven gamosa.
            </h2>
            <p className="text-base md:text-lg leading-relaxed opacity-85">
              Generic memory games feel like hospital tests. Memora uses family-uploaded photos, grandmother's Borgeet prayers, and childhood harvest stories as the stimulation activities.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link
                href="/house"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold border transition-transform active:scale-95 no-underline"
                style={{
                  background: "rgba(47, 111, 107, 0.3)",
                  borderColor: "var(--primary-light)",
                  color: "var(--bg)",
                  minHeight: "48px",
                }}
              >
                <Layers size={18} aria-hidden="true" />
                <span>Visit 3D Memory House</span>
              </Link>
            </div>
          </div>

          {/* Framed Media Visual */}
          <div
            className="rounded-[var(--radius-card)] p-6 border-2 shadow-2xl space-y-4"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderColor: "rgba(230, 244, 243, 0.2)",
            }}
          >
            <div
              className="w-full aspect-[4/3] rounded-[var(--radius-md)] flex flex-col items-center justify-center p-6 text-center border"
              style={{
                background: "rgba(47, 111, 107, 0.2)",
                borderColor: "rgba(47, 111, 107, 0.4)",
              }}
            >
              <Camera size={44} style={{ color: "var(--accent)" }} className="mb-2" />
              <span className="text-sm font-bold block">Rongali Bihu (1985) · Tezpur</span>
              <span className="text-xs opacity-75 mt-1">Caregiver-approved family reminiscence memory</span>
            </div>
            <div className="flex items-center justify-between text-xs opacity-75">
              <span>Personalized Adaptive Difficulty</span>
              <span>1-PL IRT & Elo in pure Python</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHAPTER 3: Three Connected Roles (The Hub) ── */}
      <section
        id="roles-chapter"
        className="px-4 py-16 md:py-24 max-w-6xl w-full mx-auto border-b"
        style={{ borderColor: "rgba(230, 244, 243, 0.15)" }}
      >
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span
            className="text-xs font-bold uppercase tracking-wider block"
            style={{ color: "var(--accent)" }}
          >
            Chapter III · Connected Ecosystem
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">
            Three roles. One circle of care.
          </h2>
          <p className="text-base md:text-lg opacity-85">
            Choose your portal below to enter the live experience.
          </p>
        </div>

        {/* 3 Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient Card */}
          <Link
            href="/play"
            className="group flex flex-col justify-between p-6 sm:p-8 rounded-[var(--radius-card)] border-2 transition-all hover:-translate-y-1 hover:shadow-2xl no-underline"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              borderColor: "var(--primary-light)",
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border"
                  style={{
                    background: "var(--primary)",
                    borderColor: "var(--primary-light)",
                    color: "var(--primary-ink)",
                  }}
                  aria-hidden="true"
                >
                  <Flower2 size={28} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                  Patient Mode
                </span>
              </div>
              <h3 className="text-2xl font-bold" style={{ color: "var(--bg)" }}>
                Older Adult & Elder
              </h3>
              <p className="text-sm leading-relaxed opacity-85">
                5–10 minutes of calm memory match and reminiscence activities. 64px touch targets, zero timers, zero patronizing praise.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t flex items-center justify-between text-sm font-bold" style={{ borderColor: "rgba(255, 255, 255, 0.15)", color: "var(--accent)" }}>
              <span>Enter Activities</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Caregiver Card */}
          <Link
            href="/care"
            className="group flex flex-col justify-between p-6 sm:p-8 rounded-[var(--radius-card)] border-2 transition-all hover:-translate-y-1 hover:shadow-2xl no-underline"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              borderColor: "var(--accent)",
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border"
                  style={{
                    background: "var(--accent-dark)",
                    borderColor: "var(--accent-light)",
                    color: "var(--accent-ink)",
                  }}
                  aria-hidden="true"
                >
                  <Heart size={28} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                  Family Care
                </span>
              </div>
              <h3 className="text-2xl font-bold" style={{ color: "var(--bg)" }}>
                Family & Caregiver
              </h3>
              <p className="text-sm leading-relaxed opacity-85">
                Upload photos and songs into the private vault, approve AI quiz questions, and observe 14-day longitudinal trend curves with statistical evidence.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t flex items-center justify-between text-sm font-bold" style={{ borderColor: "rgba(255, 255, 255, 0.15)", color: "var(--accent)" }}>
              <span>Open Care Portal</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* ASHA Card */}
          <Link
            href="/asha"
            className="group flex flex-col justify-between p-6 sm:p-8 rounded-[var(--radius-card)] border-2 transition-all hover:-translate-y-1 hover:shadow-2xl no-underline"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              borderColor: "var(--success)",
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border"
                  style={{
                    background: "var(--success)",
                    borderColor: "var(--success-light)",
                    color: "var(--primary-ink)",
                  }}
                  aria-hidden="true"
                >
                  <Eye size={28} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                  Clinical Triage
                </span>
              </div>
              <h3 className="text-2xl font-bold" style={{ color: "var(--bg)" }}>
                ASHA Health Worker
              </h3>
              <p className="text-sm leading-relaxed opacity-85">
                Monitor 20–30 community households. Ordered by triage priority with robust z-score, CUSUM drift detection, and pure-Python PDF export.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t flex items-center justify-between text-sm font-bold" style={{ borderColor: "rgba(255, 255, 255, 0.15)", color: "var(--accent)" }}>
              <span>Open ASHA Triage</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* ── CHAPTER 4: Offline & Private (DPDP 2023) ── */}
      <section
        className="px-4 py-16 md:py-20 max-w-5xl mx-auto text-center space-y-6"
      >
        <span
          className="text-xs font-bold uppercase tracking-wider block"
          style={{ color: "var(--accent)" }}
        >
          Chapter IV · Trust & Integrity
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Built for the North Eastern Region of India
        </h2>
        <p className="text-base md:text-lg max-w-xl mx-auto opacity-85">
          SIH26003. Strict data minimization. Zero facial emotion recognition. Zero raw audio persistence.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
          <div className="p-5 rounded-[var(--radius-md)] border border-white/10 bg-white/5 space-y-2">
            <ShieldCheck size={24} style={{ color: "var(--success)" }} />
            <h4 className="font-bold text-base">DPDP Act 2023 Compliant</h4>
            <p className="text-xs opacity-75">All patient data stays within India (Mumbai region) with strict guardian consent gating.</p>
          </div>

          <div className="p-5 rounded-[var(--radius-md)] border border-white/10 bg-white/5 space-y-2">
            <WifiOff size={24} style={{ color: "var(--primary-light)" }} />
            <h4 className="font-bold text-base">Offline-First PWA</h4>
            <p className="text-xs opacity-75">IndexedDB client queue with idempotent UUIDv7 events. Never stops when network drops.</p>
          </div>

          <div className="p-5 rounded-[var(--radius-md)] border border-white/10 bg-white/5 space-y-2">
            <Languages size={24} style={{ color: "var(--accent)" }} />
            <h4 className="font-bold text-base">6 Regional Languages</h4>
            <p className="text-xs opacity-75">English, Hindi, Assamese, Bengali, Bodo, and Manipuri with regional Noto script fonts.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
