"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { OnboardingWizard } from "./OnboardingWizard";
import { MemoryUploadModal, type MemoryItem } from "./MemoryUploadModal";
import { QuizApprovalQueue } from "./QuizApprovalQueue";
import { CaregiverTrendDashboard } from "./CaregiverTrendDashboard";
import { ONBOARDING_STRINGS } from "./strings";
import { MemoryCard } from "@/components/common/MemoryCard";
import { AlertCard } from "@/components/common/AlertCard";
import { SyncStatusChip } from "@/components/common/SyncStatusChip";
import { EmptyState } from "@/components/common/EmptyState";

export default function CaregiverDashboardPage() {
  const t = useTranslations("Care");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const strings = ONBOARDING_STRINGS[locale] || ONBOARDING_STRINGS.en;

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardedElder, setOnboardedElder] = useState<string | null>("Bhaben Baruah");
  const [isUploadingMemory, setIsUploadingMemory] = useState(false);
  const [isAlertAcknowledged, setIsAlertAcknowledged] = useState(false);
  const [isUnwell, setIsUnwell] = useState(false);

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
  ]);

  const toggleApproval = (id: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_approved: !m.is_approved } : m))
    );
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
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

  return (
    <div
      className="flex-1 max-w-6xl mx-auto w-full px-4 py-5 space-y-6"
    >
      {/* ── Top Navigation Bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base font-semibold p-2 rounded-xl no-underline transition-colors"
          style={{ color: "var(--primary)", minHeight: "44px" }}
        >
          <span aria-hidden="true">←</span>
          <span>{tCommon("back")}</span>
        </Link>
        <div className="flex items-center gap-2">
          <SyncStatusChip />
          <span
            className="text-sm font-bold px-3 py-1.5 rounded-full border"
            style={{
              background: "var(--accent-light)",
              color: "var(--accent-dark)",
              borderColor: "var(--accent)",
            }}
          >
            Caregiver Portal
          </span>
        </div>
      </div>

      {/* ── At-a-Glance Header Strip ── */}
      <div
        className="rounded-[var(--radius-card)] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full border"
              style={{
                background: "var(--success-light)",
                color: "var(--success)",
                borderColor: "var(--success)",
              }}
            >
              DPDP 2023 Consent ✓
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full border"
              style={{
                background: "var(--alert-light)",
                color: "var(--alert)",
                borderColor: "var(--alert)",
              }}
            >
              ⚖️ {strings.lawyerPending}
            </span>
          </div>
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--ink)" }}
          >
            {onboardedElder ? `Elder: ${onboardedElder}` : "Onboard Elder & Consent"}
          </h2>
          <p
            className="text-sm"
            style={{ color: "var(--ink-soft)" }}
          >
            {onboardedElder
              ? "Verifiable guardian consent active. Calibration baseline ready."
              : "Complete the 6-step plain-language guardian consent flow."}
          </p>
        </div>
        <button
          type="button"
          id="onboard-elder-btn"
          onClick={() => setIsOnboarding(true)}
          className="px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-bold transition-colors shrink-0"
          style={{
            background: "var(--surface-2)",
            color: "var(--ink-soft)",
            border: "1px solid var(--border)",
            minHeight: "44px",
          }}
        >
          {onboardedElder ? "⚙ Re-evaluate Consent" : "Start Onboarding"}
        </button>
      </div>

      {/* ── Alert (if active) ── */}
      {showAlert && (
        <AlertCard
          patientName={onboardedElder || "Bhaben Baruah"}
          message="Activity has been lower than usual over the last few days. This may be worth a check-in."
          observedValue={0.42}
          baselineMedian={0.82}
          robustZ={-2.85}
          onAcknowledge={() => setIsAlertAcknowledged(true)}
          onMarkUnwell={() => setIsUnwell(true)}
          isUnwell={isUnwell}
        />
      )}

      {/* ── Longitudinal 14-Day Trend ── */}
      <CaregiverTrendDashboard
        patientName={onboardedElder || "Bhaben Baruah"}
        initialUnwell={isUnwell}
      />

      {/* ── Memories Bank ── */}
      <section
        className="rounded-[var(--radius-card)] p-5 space-y-4"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}
        aria-labelledby="memories-heading"
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h3
              id="memories-heading"
              className="text-lg font-bold"
              style={{ color: "var(--ink)" }}
            >
              Family Memories Bank
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--ink-soft)" }}
            >
              Private photos, songs, and stories used in reminiscence activities.
            </p>
          </div>
          <button
            type="button"
            id="upload-memory-btn"
            onClick={() => setIsUploadingMemory(true)}
            className="px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-bold transition-colors flex items-center gap-1.5"
            style={{
              background: "var(--accent)",
              color: "var(--accent-ink)",
              border: "none",
              minHeight: "44px",
            }}
          >
            <span aria-hidden="true">+</span>
            <span>Add Memory</span>
          </button>
        </div>

        {/* Memory cards grid */}
        {memories.length === 0 ? (
          <EmptyState
            icon="📸"
            title="No memories yet"
            description="Add a photo, song, or story that your elder cherishes. It will be used in their personalised activities."
            action={
              <button
                type="button"
                onClick={() => setIsUploadingMemory(true)}
                className="px-5 py-2.5 rounded-[var(--radius-md)] text-sm font-bold"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-ink)",
                  border: "none",
                }}
              >
                Add a Memory
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {memories.map((mem) => (
              <MemoryCard
                key={mem.id}
                memoryType={mem.memory_type as "photo" | "song" | "story"}
                caption={mem.caption}
                people={mem.people}
                year={mem.year}
                isApproved={mem.is_approved}
                isOfflinePending={mem.is_offline_pending}
                onApprove={() => toggleApproval(mem.id)}
                onDelete={() => deleteMemory(mem.id)}
              />
            ))}
          </div>
        )}
      </section>

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
