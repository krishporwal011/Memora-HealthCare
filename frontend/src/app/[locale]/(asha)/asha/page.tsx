"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

import {
  type AshaPatient,
  INITIAL_ASHA_PATIENTS,
  buildSyntheticPdfBlob,
} from "./ashaModel";

export default function AshaDashboardPage() {
  const t = useTranslations("Asha");
  const tCommon = useTranslations("Common");

  const [patients] = useState<AshaPatient[]>(INITIAL_ASHA_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [scheduledVisits, setScheduledVisits] = useState<Record<string, boolean>>({});

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const handleExportPdf = (patient: AshaPatient) => {
    try {
      const blob = buildSyntheticPdfBlob(patient);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `memora-report-${patient.name.toLowerCase().replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportNotice(`Exported summary report for ${patient.name} (PDF).`);
      setTimeout(() => setExportNotice(null), 4000);
    } catch (e) {
      console.error("PDF download failed", e);
    }
  };

  const toggleVisitScheduled = (id: string) => {
    setScheduledVisits((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusChip = (status: AshaPatient["status"], label: string) => {
    if (status === "checkin_suggested") {
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#FDF1EC] text-[#9A3412] border border-[#F5C2B1] inline-flex items-center gap-1.5">
          <span aria-hidden="true">⚠️</span>
          <span>{label}</span>
        </span>
      );
    }
    if (status === "watch") {
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#FFF8E7] text-[#7A5800] border border-[#E0D0A0] inline-flex items-center gap-1.5">
          <span aria-hidden="true">👁️</span>
          <span>{label}</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#EAF3EE] text-[#2D6A4F] border border-[#A7D1B9] inline-flex items-center gap-1.5">
        <span aria-hidden="true">✓</span>
        <span>{label}</span>
      </span>
    );
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full py-4 space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {selectedPatient ? (
          <button
            type="button"
            onClick={() => setSelectedPatientId(null)}
            className="inline-flex items-center gap-2 text-base font-semibold text-[#1B3B36] p-2 hover:bg-[#F2EFE9] rounded-xl cursor-pointer"
            style={{ minHeight: "44px" }}
          >
            <span aria-hidden="true">⬅️</span>
            <span>Back to Assigned Households</span>
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-semibold text-[#1B3B36] p-2 hover:bg-[#F2EFE9] rounded-xl no-underline"
            style={{ minHeight: "44px" }}
          >
            <span aria-hidden="true">⬅️</span>
            <span>{tCommon("back")}</span>
          </Link>
        )}

        <span className="text-sm font-semibold text-[#2D6A4F] bg-[#EAF3EE] px-3 py-1.5 rounded-full border border-[#A7D1B9]">
          ASHA Portal • Sector 4
        </span>
      </div>

      {exportNotice && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#EAF3EE] text-[#1B3B36] border border-[#A7D1B9] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"
        >
          <span aria-hidden="true">📄</span>
          <span>{exportNotice}</span>
        </div>
      )}

      {/* VIEW 1: PATIENT DETAIL SCREEN */}
      {selectedPatient ? (
        <div className="space-y-6" role="region" aria-label="Elder Clinical Detail">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-[#1B3B36] shadow-xs space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FDF1EC] text-[#9A3412] border border-[#F5C2B1]">
                    [DEMO / SYNTHETIC DATA]
                  </span>
                  {getStatusChip(selectedPatient.status, selectedPatient.statusLabel)}
                </div>
                <h2 className="text-2xl font-bold text-[#1C1C1A]">
                  {selectedPatient.name}
                </h2>
                <p className="text-sm text-[#52504C]">
                  {selectedPatient.location} • Preferred Language: {selectedPatient.preferredLanguage}
                </p>
              </div>

              {/* PDF Export Action */}
              <button
                type="button"
                id="export-pdf-detail-btn"
                onClick={() => handleExportPdf(selectedPatient)}
                className="px-4 py-2.5 rounded-xl bg-[#1B3B36] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-2"
                style={{ minHeight: "44px" }}
              >
                <span aria-hidden="true">📥</span>
                <span>Download Report (PDF)</span>
              </button>
            </div>

            {/* Household Guardian Info */}
            <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#D1CEC4] text-xs space-y-1">
              <span className="font-bold text-[#1C1C1A] block uppercase tracking-wider">
                Primary Caregiver Contact
              </span>
              <p className="text-[#52504C]">
                Guardian: <strong>{selectedPatient.guardianName}</strong> ({selectedPatient.guardianRel})
              </p>
              <p className="text-[#52504C]">
                Consent: Active verifiable guardian consent registered under DPDP Act 2023.
              </p>
            </div>
          </div>

          {/* Explainable Statistical Evidence */}
          <div className="bg-white rounded-2xl p-6 border border-[#D1CEC4] shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-[#1C1C1A]">
              Explainable Anomaly Evidence
            </h3>
            <p className="text-xs text-[#52504C]">
              Objective numbers comparing current session against the 14-day rolling baseline.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D1CEC4]">
                <span className="text-[11px] text-[#52504C] block">Observed Score</span>
                <span className="text-lg font-bold text-[#9A3412]">
                  {Math.round(selectedPatient.currentScore * 100)}%
                </span>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D1CEC4]">
                <span className="text-[11px] text-[#52504C] block">Baseline Median</span>
                <span className="text-lg font-bold text-[#1B3B36]">
                  {Math.round(selectedPatient.baselineMedian * 100)}%
                </span>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D1CEC4]">
                <span className="text-[11px] text-[#52504C] block">Robust Z-Score</span>
                <span className="text-lg font-bold text-[#9A3412]">
                  {selectedPatient.robustZ}
                </span>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D1CEC4]">
                <span className="text-[11px] text-[#52504C] block">Sessions This Week</span>
                <span className="text-lg font-bold text-[#1C1C1A]">
                  {selectedPatient.sessionsThisWeek}
                </span>
              </div>
            </div>

            {/* Domains Breakdown */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[#52504C] block uppercase tracking-wider">
                Recent Domain Activity
              </span>
              <div className="space-y-2">
                {selectedPatient.domains.map((d) => (
                  <div
                    key={d.name}
                    className="p-3 rounded-xl bg-[#F8F6F0] border border-[#D1CEC4] flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-[#1C1C1A]">{d.name}</span>
                    <span className="font-bold text-[#1B3B36]">{Math.round(d.score * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Advisory */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border-2 border-[#D1CEC4] text-xs text-[#52504C] space-y-1">
              <span className="font-bold text-[#1C1C1A] block">Non-Diagnostic Guidance:</span>
              <p>
                Memora is an offline cognitive stimulation platform and not a medical device. Variations in scores occur due to temporary tiredness, poor sleep, or mild illness. Consider a check-up with a doctor if this pattern continues.
              </p>
            </div>

            {/* Visit Action Control */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                id="toggle-visit-btn"
                onClick={() => toggleVisitScheduled(selectedPatient.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  scheduledVisits[selectedPatient.id]
                    ? "bg-[#EAF3EE] text-[#1B3B36] border-[#A7D1B9]"
                    : "bg-[#1B3B36] text-white border-[#1B3B36]"
                }`}
                style={{ minHeight: "44px" }}
              >
                {scheduledVisits[selectedPatient.id]
                  ? "✓ Household Check-in Scheduled"
                  : "Schedule Household Check-in"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: PATIENT LIST SCREEN (ORDERED BY TRIAGE NEED) */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#D1CEC4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1C1C1A]">
                {t("title")}
              </h2>
              <p className="text-sm text-[#52504C] mt-1">
                3 assigned households in Primary Health Centre sector. Ordered by triage priority.
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#FDF1EC] text-[#9A3412] border border-[#F5C2B1] self-start md:self-auto">
              [DEMO / SYNTHETIC DATA]
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-[#1C1C1A]">Assigned Elders ({patients.length})</h3>
              <span className="text-xs font-semibold text-[#52504C]">
                Priority order: Urgent Check-in ➔ Watch ➔ Steady
              </span>
            </div>

            <div className="space-y-3" role="list" aria-label="Assigned elder households">
              {patients.map((elder) => (
                <div
                  key={elder.id}
                  className="p-5 bg-white rounded-2xl border-2 border-[#D1CEC4] hover:border-[#1B3B36] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  role="listitem"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#52504C] bg-[#F8F6F0] px-2 py-0.5 rounded-md border border-[#D1CEC4]">
                        Priority {elder.triagePriority}
                      </span>
                      {getStatusChip(elder.status, elder.statusLabel)}
                    </div>

                    <h4 className="text-lg font-bold text-[#1C1C1A]">{elder.name}</h4>
                    <p className="text-xs text-[#52504C]">
                      {elder.location} • Guardian: {elder.guardianName} ({elder.guardianRel})
                    </p>
                    <span className="text-[11px] text-[#52504C] block mt-1">
                      Last active: {elder.lastActive} • {elder.sessionsThisWeek} sessions this week
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {/* PDF Export Button */}
                    <button
                      type="button"
                      id={`export-pdf-${elder.id}`}
                      onClick={() => handleExportPdf(elder)}
                      className="px-3 py-2 rounded-xl border border-[#D1CEC4] hover:bg-[#F2EFE9] text-xs font-bold text-[#1C1C1A] transition-colors flex items-center gap-1.5"
                      style={{ minHeight: "40px" }}
                      aria-label={`Download PDF report for ${elder.name}`}
                    >
                      <span aria-hidden="true">📥</span>
                      <span>PDF</span>
                    </button>

                    {/* View Details Button */}
                    <button
                      type="button"
                      id={`view-detail-${elder.id}`}
                      onClick={() => setSelectedPatientId(elder.id)}
                      className="px-4 py-2 rounded-xl bg-[#1B3B36] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-xs transition-colors"
                      style={{ minHeight: "40px" }}
                    >
                      View Details ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
