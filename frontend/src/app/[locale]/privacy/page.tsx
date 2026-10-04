"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, ShieldCheck, Lock, Trash2, Download, EyeOff, FileText, CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function PrivacyPage() {
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

        <span className="text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider text-[var(--success)] bg-[var(--success-light)] border-[var(--success)]">
          DPDP Act 2023 · India
        </span>
      </div>

      {/* ── Section Header ── */}
      <SectionHeader
        eyebrow="Trust, Privacy & Ethical Governance"
        title="Privacy & Verifiable Consent"
        description="We believe elder care requires absolute privacy, strict data minimization, and plain-language transparency. Here is exactly what happens to your family's data."
      />

      <div className="space-y-6">
        {/* Core Principles Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="rounded-[var(--radius-card)] p-6 border space-y-3"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]">
              <Lock size={20} />
            </div>
            <h3 className="text-xl font-bold" style={{ color: "var(--ink)" }}>Only Your Family Can See This</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              Uploaded photographs, voice stories, and family memories are stored in private Supabase Storage buckets protected by Row Level Security (RLS). They are never shared publicly or used to train public AI models.
            </p>
          </div>

          <div
            className="rounded-[var(--radius-card)] p-6 border space-y-3"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary)]">
              <EyeOff size={20} />
            </div>
            <h3 className="text-xl font-bold" style={{ color: "var(--ink)" }}>Zero Biometric Tracking</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              Memora strictly forbids facial emotion recognition and always-on microphone listening. The microphone is activated only when an elder explicitly taps the speak button, and raw audio is discarded immediately after in-memory transcription.
            </p>
          </div>
        </div>

        {/* Detailed Plain-Language Breakdown */}
        <section
          className="rounded-[var(--radius-card)] p-6 md:p-8 border space-y-6"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
            What is stored and where
          </h3>

          <div className="space-y-4 text-sm" style={{ color: "var(--ink-soft)" }}>
            <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-2)] border space-y-1" style={{ borderColor: "var(--border-soft)" }}>
              <span className="font-bold block text-[var(--ink)]">1. Data Residency within India (Mumbai)</span>
              <p>
                In compliance with the Digital Personal Data Protection (DPDP) Act 2023, all backend infrastructure and database storage are hosted within India (ap-south-1 Mumbai region).
              </p>
            </div>

            <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-2)] border space-y-1" style={{ borderColor: "var(--border-soft)" }}>
              <span className="font-bold block text-[var(--ink)]">2. What We Store</span>
              <p>
                We store: game accuracy scores, response times in milliseconds, session timestamps, and caregiver-approved memory captions. We do NOT store continuous audio recordings or video feeds.
              </p>
            </div>

            <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-2)] border space-y-1" style={{ borderColor: "var(--border-soft)" }}>
              <span className="font-bold block text-[var(--ink)]">3. Your Right to Erasure & Export</span>
              <p>
                Caregivers and elders have the complete right to export all recorded activity at any time, or request complete cascading deletion of all photos, stories, and database records with one tap.
              </p>
            </div>

            <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-2)] border space-y-1" style={{ borderColor: "var(--border-soft)" }}>
              <span className="font-bold block text-[var(--ink)]">4. Non-Diagnostic Notice</span>
              <p>
                Memora provides cognitive stimulation and caregiver monitoring support. It is NOT a clinical diagnostic tool or medical device. All notices provide statistical trends and advise consulting a qualified doctor or healthcare professional.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
