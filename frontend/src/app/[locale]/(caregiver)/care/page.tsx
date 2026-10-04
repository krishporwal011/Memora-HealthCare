"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  ArrowLeft,
  ShieldCheck,
  Scale,
  Plus,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Settings,
} from "lucide-react";
import { OnboardingWizard } from "./OnboardingWizard";
import { MemoryUploadModal, type MemoryItem } from "./MemoryUploadModal";
import { QuizApprovalQueue } from "./QuizApprovalQueue";
import { CaregiverTrendDashboard } from "./CaregiverTrendDashboard";
import { ONBOARDING_STRINGS } from "./strings";
import { MemoryCard } from "@/components/ui/MemoryCard";
import { AlertCard } from "@/components/common/AlertCard";
import { SyncStatusChip } from "@/components/ui/SyncStatusChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Disclosure } from "@/components/ui/Disclosure";

export default function CaregiverDashboardPage() {
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const strings = ONBOARDING_STRINGS[locale] || ONBOARDING_STRINGS.en;

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardedElder, setOnboardedElder] = useState<string | null>("Bhaben Baruah");
  const [isUploadingMemory, setIsUploadingMemory] = useState(false);
  const [isAlertAcknowledged, setIsAlertAcknowledged] = useState(false);
  const [isUnwell, setIsUnwell] = useState(false);
  const [selectedMemoryIndex, setSelectedMemoryIndex] = useState<number | null>(null);

  const [memories, setMemories] = useState<MemoryItem[]>([
    {
      id: "mem-01",
      memory_type: "photo",
      caption: "Rongali Bihu harvest celebration at ancestral home in Tezpur",
      people: ["Grandmother", "Ranjit", "Jonali"],
      year: 1985,
      is_approved: true,
      created_at: "2026-09-28T10:00:00Z",
    },
    {
      id: "mem-02",
      memory_type: "song",
      caption: "Old Goalpariya folk song sung during family gatherings",
      people: ["Bhaben Baruah", "Pratima"],
      year: 1974,
      is_approved: true,
      created_at: "2026-09-29T14:30:00Z",
    },
    {
      id: "mem-03",
      memory_type: "story",
      caption: "Early morning Brahmaputra wooden ferry crossing near Silghat",
      people: ["Father", "Ranjit"],
      year: 1991,
      is_approved: true,
      created_at: "2026-09-30T09:15:00Z",
    },
  ]);

  const toggleApproval = (id: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_approved: !m.is_approved } : m))
    );
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setSelectedMemoryIndex(null);
  };

  if (isOnboarding) {
    return (
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 space-y-6">
        <OnboardingWizard
          onComplete={() => {
            setOnboardedElder("Bhaben Baruah");
            setIsOnboarding(false);
          }}
          onCancel={() => setIsOnboarding(false)}
        />
      </div>
    );
  }

  const showAlert = !isAlertAcknowledged && !isUnwell;
  const activeDetailMemory = selectedMemoryIndex !== null ? memories[selectedMemoryIndex] : null;

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-5 space-y-8">
      {/* ── Top Navigation Bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base font-semibold px-4 py-2 rounded-full border no-underline transition-colors hover:bg-[var(--surface-2)]"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--primary)",
            minHeight: "44px",
          }}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span>{tCommon("back")}</span>
        </Link>

        {/* Quick Portal Navigation Links */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/care/timeline"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border no-underline hover:bg-[var(--surface-2)] text-[var(--ink)] border-[var(--border)]"
          >
            <Calendar size={13} aria-hidden="true" />
            <span>Memory Timeline</span>
          </Link>
          <Link
            href="/care/people"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border no-underline hover:bg-[var(--surface-2)] text-[var(--ink)] border-[var(--border)]"
          >
            <Users size={13} aria-hidden="true" />
            <span>Family People</span>
          </Link>
          <SyncStatusChip />
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider text-[var(--accent-dark)] bg-[var(--accent-light)] border-[var(--accent)]"
          >
            Caregiver Portal
          </span>
        </div>
      </div>

      {/* ── At-a-Glance Header Strip (Restyled badges) ── */}
      <div
        className="rounded-[var(--radius-card)] p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-2 shadow-sm"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                background: "var(--success-light)",
                color: "var(--success)",
                borderColor: "var(--success)",
              }}
            >
              <ShieldCheck size={14} aria-hidden="true" />
              <span>DPDP 2023 Consent Active</span>
            </span>

            <span
              className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                background: "var(--alert-light)",
                color: "var(--alert)",
                borderColor: "var(--alert)",
              }}
            >
              <Scale size={14} aria-hidden="true" />
              <span>{strings.lawyerPending}</span>
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
            {onboardedElder ? `Elder: ${onboardedElder}` : "Onboard Elder & Consent"}
          </h1>
          <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {onboardedElder
              ? "Verifiable guardian consent active. Daily memory stimulation baseline established."
              : "Complete the 6-step plain-language guardian consent flow."}
          </p>
        </div>

        <button
          type="button"
          id="onboard-elder-btn"
          onClick={() => setIsOnboarding(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-bold border transition-colors shrink-0 hover:bg-[var(--surface-2)] cursor-pointer"
          style={{
            background: "var(--surface-2)",
            color: "var(--ink-soft)",
            borderColor: "var(--border)",
            minHeight: "48px",
          }}
        >
          <Settings size={16} aria-hidden="true" />
          <span>{onboardedElder ? "Re-evaluate Consent" : "Start Onboarding"}</span>
        </button>
      </div>

      {/* ── Active Alert Banner with Statistical Evidence Disclosure ── */}
      {showAlert && (
        <AlertCard
          patientName={onboardedElder || "Bhaben Baruah"}
          message="Activity accuracy dipped below the usual range over the last 3 sessions. Consider checking in with a doctor."
          observedValue={0.42}
          baselineMedian={0.82}
          robustZ={-2.85}
          onAcknowledge={() => setIsAlertAcknowledged(true)}
          onMarkUnwell={() => setIsUnwell(true)}
          isUnwell={isUnwell}
        />
      )}

      {/* ── Weekly Plain-Language Story Summary ── */}
      <div
        className="rounded-[var(--radius-card)] p-5 md:p-6 border space-y-3"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border-soft)",
        }}
      >
        <span className="text-xs font-bold uppercase tracking-wider block text-[var(--primary)]">
          Weekly Plain-Language Summary
        </span>
        <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--ink)" }}>
          Calm and active over the past week
        </h2>
        <p className="text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          Bhaben completed 6 out of 7 daily memory sessions with gentle focus. He engaged especially well with the Tezpur Rongali Bihu photos and Goalpariya folk songs. On Wednesday, a dip occurred which triggered a gentle rest break.
        </p>

        {/* Explainable AI Numbers Disclosure */}
        <Disclosure summary="Detailed mathematical indicators calculated over the 14-day rolling window:">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-[var(--surface)] rounded border" style={{ borderColor: "var(--border)" }}>
              <span className="text-xs font-bold uppercase text-[var(--ink-muted)] block">Observed Score</span>
              <span className="text-xl font-bold text-[var(--primary)]">42%</span>
            </div>
            <div className="p-3 bg-[var(--surface)] rounded border" style={{ borderColor: "var(--border)" }}>
              <span className="text-xs font-bold uppercase text-[var(--ink-muted)] block">Usual Range</span>
              <span className="text-xl font-bold text-[var(--ink)]">72% – 90%</span>
            </div>
            <div className="p-3 bg-[var(--surface)] rounded border" style={{ borderColor: "var(--border)" }}>
              <span className="text-xs font-bold uppercase text-[var(--ink-muted)] block">Robust Z-Score</span>
              <span className="text-xl font-bold text-[var(--alert)]">-2.85</span>
            </div>
            <div className="p-3 bg-[var(--surface)] rounded border" style={{ borderColor: "var(--border)" }}>
              <span className="text-xs font-bold uppercase text-[var(--ink-muted)] block">CUSUM S_t</span>
              <span className="text-xl font-bold text-[var(--alert)]">4.35 (h=4.0)</span>
            </div>
          </div>
          <p className="text-xs text-[var(--ink-muted)] pt-2 border-t" style={{ borderColor: "var(--border-soft)" }}>
            Z-score derived via median and MAD: (X - 0.82) / (1.4826 * 0.08) = -2.85. Consider consulting a doctor for comprehensive clinical evaluation.
          </p>
        </Disclosure>
      </div>

      {/* ── 14-Day Recharts Trend Dashboard ── */}
      <CaregiverTrendDashboard
        patientName={onboardedElder || "Bhaben Baruah"}
        initialUnwell={isUnwell}
      />

      {/* ── Family Memories Bank (Photo-Led Album Grid + Detail View) ── */}
      <section
        className="rounded-[var(--radius-card)] p-6 space-y-6 border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}
        aria-labelledby="memories-heading"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 id="memories-heading" className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
              Family Memories Bank
            </h3>
            <p className="text-sm mt-0.5" style={{ color: "var(--ink-soft)" }}>
              Private family photos, songs, and stories used in personalized cognitive stimulation activities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="upload-memory-btn"
              onClick={() => setIsUploadingMemory(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
              style={{
                background: "var(--accent)",
                minHeight: "44px",
              }}
            >
              <Plus size={16} aria-hidden="true" />
              <span>Add Memory</span>
            </button>
          </div>
        </div>

        {/* Grid of Photo-Led Cards */}
        {memories.length === 0 ? (
          <EmptyState
            title="No Memories Uploaded Yet"
            description="Add family photos, traditional regional songs, or stories to formulate gentle daily cognitive stimulation."
            action={{
              label: "Add First Memory",
              onClick: () => setIsUploadingMemory(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((mem, idx) => (
              <MemoryCard
                key={mem.id}
                memoryType={mem.memory_type as "photo" | "song" | "story"}
                caption={mem.caption}
                people={mem.people}
                year={mem.year}
                isApproved={mem.is_approved}
                isOfflinePending={mem.is_offline_pending}
                onClick={() => setSelectedMemoryIndex(idx)}
                onApprove={() => toggleApproval(mem.id)}
                onDelete={() => deleteMemory(mem.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Memory Detail View Modal (Spec-style table & 56px arrow navigation) ── */}
      {activeDetailMemory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeDetailMemory.caption}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div
            className="w-full max-w-2xl rounded-[var(--radius-card)] p-6 md:p-8 space-y-6 border-2 shadow-2xl overflow-y-auto max-h-[90vh]"
            style={{
              background: "var(--surface)",
              borderColor: "var(--primary)",
              color: "var(--ink)",
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border-soft)" }}>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                Memory Spec & Detail View
              </span>
              <button
                type="button"
                onClick={() => setSelectedMemoryIndex(null)}
                className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
                style={{ borderColor: "var(--border)" }}
                aria-label="Close detail modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Media representation */}
            <div
              className="w-full aspect-video rounded-[var(--radius-md)] flex flex-col items-center justify-center border"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
              }}
            >
              <Layers size={44} style={{ color: "var(--primary)" }} />
              <span className="text-xs font-bold uppercase tracking-wider mt-2 text-[var(--ink-muted)]">
                Synthetic Family Media Vault
              </span>
            </div>

            {/* Spec-style Table */}
            <div className="border rounded-[var(--radius-md)] overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <table className="w-full text-left text-sm">
                <tbody>
                  <tr className="border-b" style={{ borderColor: "var(--border-soft)" }}>
                    <th className="p-3 font-bold bg-[var(--surface-2)] w-1/3">Caption</th>
                    <td className="p-3 font-semibold">{activeDetailMemory.caption}</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: "var(--border-soft)" }}>
                    <th className="p-3 font-bold bg-[var(--surface-2)]">Memory Type</th>
                    <td className="p-3 capitalize">{activeDetailMemory.memory_type}</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: "var(--border-soft)" }}>
                    <th className="p-3 font-bold bg-[var(--surface-2)]">Estimated Year</th>
                    <td className="p-3">{activeDetailMemory.year || "Not specified"}</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: "var(--border-soft)" }}>
                    <th className="p-3 font-bold bg-[var(--surface-2)]">People Tagged</th>
                    <td className="p-3">{activeDetailMemory.people?.join(", ") || "None"}</td>
                  </tr>
                  <tr>
                    <th className="p-3 font-bold bg-[var(--surface-2)]">Approval Status</th>
                    <td className="p-3 font-bold" style={{ color: activeDetailMemory.is_approved ? "var(--success)" : "var(--accent-dark)" }}>
                      {activeDetailMemory.is_approved ? "Approved for Cognitive Activities" : "Pending Caregiver Approval"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Thumbnail Strip with 56px Navigation Arrows */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() =>
                  setSelectedMemoryIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : memories.length - 1
                  )
                }
                className="w-14 h-14 rounded-full border flex items-center justify-center transition-all active:scale-95 cursor-pointer hover:bg-[var(--surface-2)]"
                style={{
                  borderColor: "var(--border)",
                  minHeight: "56px",
                  minWidth: "56px",
                }}
                aria-label="Previous memory in archive"
              >
                <ChevronLeft size={24} />
              </button>

              <span className="text-xs font-bold text-[var(--ink-muted)]">
                Memory {selectedMemoryIndex! + 1} of {memories.length}
              </span>

              <button
                type="button"
                onClick={() =>
                  setSelectedMemoryIndex((prev) =>
                    prev !== null && prev < memories.length - 1 ? prev + 1 : 0
                  )
                }
                className="w-14 h-14 rounded-full border flex items-center justify-center transition-all active:scale-95 cursor-pointer hover:bg-[var(--surface-2)]"
                style={{
                  borderColor: "var(--border)",
                  minHeight: "56px",
                  minWidth: "56px",
                }}
                aria-label="Next memory in archive"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Question Approval Queue ── */}
      <QuizApprovalQueue patientId="patient-demo-ner" />

      {/* Upload Memory Modal */}
      {isUploadingMemory && (
        <MemoryUploadModal
          patientId="patient-demo-ner"
          onClose={() => setIsUploadingMemory(false)}
          onMemoryAdded={(newMem) => {
            setMemories((prev) => [newMem, ...prev]);
          }}
        />
      )}
    </div>
  );
}
