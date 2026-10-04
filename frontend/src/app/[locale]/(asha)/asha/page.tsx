"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Eye, Check, ArrowLeft, ArrowRight, Download, FileText } from "lucide-react";
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
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-[var(--alert-light)] text-[var(--alert)] border border-[var(--alert)] inline-flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
    }
    if (status === "watch") {
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-[var(--accent-light)] text-[var(--accent-dark)] border border-[var(--accent)] inline-flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-bold rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)] border border-[var(--border)] inline-flex items-center gap-1.5">
        <Check className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-4 space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {selectedPatient ? (
          <button
            type="button"
            onClick={() => setSelectedPatientId(null)}
            className="inline-flex items-center gap-2 text-base font-semibold text-[var(--primary)] p-2 hover:bg-[var(--surface-hover)] rounded-xl cursor-pointer"
            style={{ minHeight: "44px" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Assigned Households</span>
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-semibold text-[var(--primary)] p-2 hover:bg-[var(--surface-hover)] rounded-xl no-underline"
            style={{ minHeight: "44px" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{tCommon("back")}</span>
          </Link>
        )}

        <span className="text-sm font-semibold text-[var(--primary-dark)] bg-[var(--primary-light)] px-3 py-1.5 rounded-full border border-[var(--border)]">
          ASHA Portal • Sector 4
        </span>
      </div>

      {exportNotice && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--border)] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* VIEW 1: PATIENT DETAIL SCREEN */}
      {selectedPatient ? (
        <div className="space-y-6" role="region" aria-label="Elder Clinical Detail">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-[var(--primary)] shadow-xs space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--alert-light)] text-[var(--alert)] border border-[var(--alert)]">
                    [DEMO / SYNTHETIC DATA]
                  </span>
                  {getStatusChip(selectedPatient.status, selectedPatient.statusLabel)}
                </div>
                <h2 className="text-2xl font-bold text-[var(--ink)]">
                  {selectedPatient.name}
                </h2>
                <p className="text-sm text-[var(--ink-soft)]">
                  {selectedPatient.location} • Preferred Language: {selectedPatient.preferredLanguage}
                </p>
              </div>

              {/* PDF Export Action */}
              <button
                type="button"
                id="export-pdf-detail-btn"
                onClick={() => handleExportPdf(selectedPatient)}
                className="px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-2"
                style={{ minHeight: "44px" }}
              >
                <Download className="w-4 h-4" />
                <span>Download Report (PDF)</span>
              </button>
            </div>

            {/* Household Guardian Info */}
            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs space-y-1">
              <span className="font-bold text-[var(--ink)] block uppercase tracking-wider">
                Primary Caregiver Contact
              </span>
              <p className="text-[var(--ink-soft)]">
                Guardian: <strong>{selectedPatient.guardianName}</strong> ({selectedPatient.guardianRel})
              </p>
              <p className="text-[var(--ink-soft)]">
                Consent: Active verifiable guardian consent registered under DPDP Act 2023.
              </p>
            </div>
          </div>

          {/* Explainable Statistical Evidence */}
          <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-[var(--ink)]">
              Explainable Anomaly Evidence
            </h3>
            <p className="text-xs text-[var(--ink-soft)]">
              Objective numbers comparing current session against the 14-day rolling baseline.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
              <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">
                <span className="text-[11px] text-[var(--ink-soft)] block">Observed Score</span>
                <span className="text-lg font-bold text-[var(--alert)]">
                  {Math.round(selectedPatient.currentScore * 100)}%
                </span>
              </div>
              <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">
                <span className="text-[11px] text-[var(--ink-soft)] block">Baseline Median</span>
                <span className="text-lg font-bold text-[var(--primary)]">
                  {Math.round(selectedPatient.baselineMedian * 100)}%
                </span>
              </div>
              <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">
                <span className="text-[11px] text-[var(--ink-soft)] block">Robust Z-Score</span>
                <span className="text-lg font-bold text-[var(--alert)]">
                  {selectedPatient.robustZ}
                </span>
              </div>
              <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">
                <span className="text-[11px] text-[var(--ink-soft)] block">Sessions This Week</span>
                <span className="text-lg font-bold text-[var(--ink)]">
                  {selectedPatient.sessionsThisWeek}
                </span>
              </div>
            </div>

            {/* Domains Breakdown */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[var(--ink-soft)] block uppercase tracking-wider">
                Recent Domain Activity
              </span>
              <div className="space-y-2">
                {selectedPatient.domains.map((d) => (
                  <div
                    key={d.name}
                    className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-[var(--ink)]">{d.name}</span>
                    <span className="font-bold text-[var(--primary)]">{Math.round(d.score * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Advisory */}
            <div className="p-4 rounded-xl bg-[var(--surface-2)] border-2 border-[var(--border)] text-xs text-[var(--ink-soft)] space-y-1">
              <span className="font-bold text-[var(--ink)] block">Non-Diagnostic Guidance:</span>
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
                    ? "bg-[var(--primary-light)] text-[var(--primary)] border-[var(--border)]"
                    : "bg-[var(--primary)] text-white border-[var(--primary)]"
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
          <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[var(--ink)]">
                {t("title")}
              </h2>
              <p className="text-sm text-[var(--ink-soft)] mt-1">
                3 assigned households in Primary Health Centre sector. Ordered by triage priority.
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--alert-light)] text-[var(--alert)] border border-[var(--alert)] self-start md:self-auto">
              [DEMO / SYNTHETIC DATA]
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-[var(--ink)]">Assigned Elders ({patients.length})</h3>
              <span className="text-xs font-semibold text-[var(--ink-soft)]">
                Priority order: Urgent Check-in ➔ Watch ➔ Steady
              </span>
            </div>

            <div className="space-y-3" role="list" aria-label="Assigned elder households">
              {patients.map((elder) => (
                <div
                  key={elder.id}
                  className="p-5 bg-white rounded-2xl border-2 border-[var(--border)] hover:border-[var(--primary)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  role="listitem"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[var(--ink-soft)] bg-[var(--bg)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                        Priority {elder.triagePriority}
                      </span>
                      {getStatusChip(elder.status, elder.statusLabel)}
                    </div>

                    <h4 className="text-lg font-bold text-[var(--ink)]">{elder.name}</h4>
                    <p className="text-xs text-[var(--ink-soft)]">
                      {elder.location} • Guardian: {elder.guardianName} ({elder.guardianRel})
                    </p>
                    <span className="text-[11px] text-[var(--ink-soft)] block mt-1">
                      Last active: {elder.lastActive} • {elder.sessionsThisWeek} sessions this week
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {/* PDF Export Button */}
                    <button
                      type="button"
                      id={`export-pdf-${elder.id}`}
                      onClick={() => handleExportPdf(elder)}
                      className="px-3 py-2 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--ink)] transition-colors flex items-center gap-1.5"
                      style={{ minHeight: "40px" }}
                      aria-label={`Download PDF report for ${elder.name}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                    {/* View Details Button */}
                    <button
                      type="button"
                      id={`view-detail-${elder.id}`}
                      onClick={() => setSelectedPatientId(elder.id)}
                      className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5"
                      style={{ minHeight: "40px" }}
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
