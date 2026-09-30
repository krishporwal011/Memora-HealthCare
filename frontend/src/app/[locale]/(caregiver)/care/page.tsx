"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { OnboardingWizard } from "./OnboardingWizard";
import { ONBOARDING_STRINGS } from "./strings";

export default function CaregiverDashboardPage() {
  const t = useTranslations("Care");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const strings = ONBOARDING_STRINGS[locale] || ONBOARDING_STRINGS.en;

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardedElder, setOnboardedElder] = useState<string | null>("Bhaben Baruah");

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
          {onboardedElder ? "Re-evaluate Consent / Add Elder" : "Start Onboarding"}
        </button>
      </div>

      {/* Activity Overview */}
      <div className="bg-white rounded-2xl p-6 border border-[#D1CEC4] shadow-xs">
        <h3 className="text-xl font-bold text-[#1C1C1A] mb-4">
          {t("title")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#D1CEC4]">
            <span className="text-sm text-[#52504C] font-medium block">{t("todayStatus")}</span>
            <span className="text-3xl font-extrabold text-[#1B3B36] mt-1 block">1 Session</span>
            <span className="text-xs text-[#52504C] mt-2 block">Completed at 10:30 AM (Offline Synced)</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#D1CEC4]">
            <span className="text-sm text-[#52504C] font-medium block">{t("usualRange")}</span>
            <span className="text-3xl font-extrabold text-[#2D6A4F] mt-1 block">Steady</span>
            <span className="text-xs text-[#52504C] mt-2 block">Within 7-day personal baseline</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          className="p-5 rounded-2xl bg-white border-2 border-[#D1CEC4] hover:border-[#C85A32] text-left transition-colors flex items-center justify-between"
          style={{ minHeight: "64px" }}
        >
          <div>
            <span className="font-bold text-lg text-[#1C1C1A] block">{t("uploadMemory")}</span>
            <span className="text-xs text-[#52504C]">Photos, songs, and family stories</span>
          </div>
          <span className="text-2xl" aria-hidden="true">📸</span>
        </button>

        <button
          type="button"
          className="p-5 rounded-2xl bg-white border-2 border-[#D1CEC4] hover:border-[#1B3B36] text-left transition-colors flex items-center justify-between"
          style={{ minHeight: "64px" }}
        >
          <div>
            <span className="font-bold text-lg text-[#1C1C1A] block">{t("approvalQueue")}</span>
            <span className="text-xs text-[#52504C]">Review AI drafted questions</span>
          </div>
          <span className="text-2xl" aria-hidden="true">📝</span>
        </button>
      </div>

      {/* Unwell Toggle */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#D1CEC4] flex items-center justify-between">
        <div>
          <span className="font-semibold text-sm text-[#1C1C1A] block">{t("unwellToggle")}</span>
          <span className="text-xs text-[#52504C] block">{t("unwellExplanation")}</span>
        </div>
        <input
          type="checkbox"
          id="unwell-toggle"
          className="w-6 h-6 rounded accent-[#C85A32] cursor-pointer"
          aria-label={t("unwellToggle")}
        />
      </div>
    </div>
  );
}
