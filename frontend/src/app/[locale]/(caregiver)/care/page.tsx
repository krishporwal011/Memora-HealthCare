"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { OnboardingWizard } from "./OnboardingWizard";
import { MemoryUploadModal, type MemoryItem } from "./MemoryUploadModal";
import { QuizApprovalQueue } from "./QuizApprovalQueue";
import { CaregiverTrendDashboard } from "./CaregiverTrendDashboard";
import { ONBOARDING_STRINGS } from "./strings";

export default function CaregiverDashboardPage() {
  const t = useTranslations("Care");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const strings = ONBOARDING_STRINGS[locale] || ONBOARDING_STRINGS.en;

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardedElder, setOnboardedElder] = useState<string | null>("Bhaben Baruah");
  const [isUploadingMemory, setIsUploadingMemory] = useState(false);

  // Initial memories bank with NER cultural artifacts
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
      <div className="flex-1 max-w-2xl mx-auto w-full py-4 space-y-6">
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

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full py-4 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base font-semibold text-[#1B3B36] p-2 hover:bg-[#F2EFE9] rounded-xl no-underline"
          style={{ minHeight: "44px" }}
        >
          <span aria-hidden="true">⬅️</span>
          <span>{tCommon("back")}</span>
        </Link>
        <span className="text-sm font-semibold text-[#C85A32] bg-[#FDF1EC] px-3 py-1.5 rounded-full border border-[#C85A32]">
          Caregiver Portal
        </span>
      </div>

      {/* Onboarding Callout Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-[#1B3B36] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EAF3EE] text-[#1B3B36] border border-[#A7D1B9]">
              DPDP 2023 Consent
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FDF1EC] text-[#9A3412] border border-[#F5C2B1]">
              ⚖️ {strings.lawyerPending}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#1C1C1A]">
            {onboardedElder ? `Registered Elder: ${onboardedElder}` : "Onboard Elder & Consent"}
          </h2>
          <p className="text-sm text-[#52504C]">
            {onboardedElder
              ? "Verifiable guardian consent active. Calibration baseline ready."
              : "Complete the 6-step plain-language guardian consent flow."}
          </p>
        </div>
        <button
          type="button"
          id="onboard-elder-btn"
          onClick={() => setIsOnboarding(true)}
          className="px-5 py-3 rounded-2xl bg-[#1B3B36] hover:bg-[#2D6A4F] text-white text-sm font-bold shadow-xs transition-colors shrink-0"
          style={{ minHeight: "48px" }}
        >
          {onboardedElder ? "Re-evaluate Consent" : "Start Onboarding"}
        </button>
      </div>

      {/* Longitudinal Caregiver Trend Dashboard (B19) */}
      <CaregiverTrendDashboard patientName={onboardedElder || "Bhaben Baruah"} />

      {/* Memories Bank Management Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#D1CEC4] shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-xl font-bold text-[#1C1C1A]">Family Memories Bank</h3>
            <p className="text-xs text-[#52504C]">
              Private photos, songs, and family stories used to personalize reminiscence activities.
            </p>
          </div>
          <button
            type="button"
            id="upload-memory-btn"
            onClick={() => setIsUploadingMemory(true)}
            className="px-4 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B04C28] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            style={{ minHeight: "44px" }}
          >
            <span aria-hidden="true">➕</span>
            <span>Add Memory</span>
          </button>
        </div>

        {/* List of Memories */}
        <div className="space-y-3 pt-2">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#D1CEC4] flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl p-2 bg-white rounded-xl border border-[#D1CEC4]" aria-hidden="true">
                  {mem.memory_type === "photo" ? "📸" : mem.memory_type === "song" ? "🎵" : "📖"}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#52504C]">
                      {mem.memory_type}
                    </span>
                    {mem.year && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-[#D1CEC4] text-[#1C1C1A]">
                        {mem.year}
                      </span>
                    )}
                    {mem.is_offline_pending && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFF8E7] text-[#7A5800] border border-[#E0D0A0]">
                        Saved locally
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm md:text-base font-bold text-[#1C1C1A] leading-snug">
                    {mem.caption}
                  </h4>
                  {mem.people.length > 0 && (
                    <span className="text-xs text-[#52504C] block">
                      With: {mem.people.join(", ")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                {/* Approval toggle */}
                <button
                  type="button"
                  onClick={() => toggleApproval(mem.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    mem.is_approved
                      ? "bg-[#EAF3EE] text-[#1B3B36] border-[#A7D1B9]"
                      : "bg-[#FDF1EC] text-[#9A3412] border-[#F5C2B1]"
                  }`}
                  style={{ minHeight: "36px" }}
                >
                  {mem.is_approved ? "✓ Approved" : "Pending"}
                </button>
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => deleteMemory(mem.id)}
                  aria-label="Delete memory"
                  className="p-2 text-[#52504C] hover:text-[#9A3412] text-sm rounded-lg"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Question Approval Queue (B15/B16) */}
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
