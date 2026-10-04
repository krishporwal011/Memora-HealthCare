"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Download, FileText, CalendarCheck, CheckCircle2, UserCheck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { StatusChip, type StatusLevel } from "@/components/ui/StatusChip";
import { SyncStatusChip } from "@/components/ui/SyncStatusChip";
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

  const mapStatusLevel = (status: AshaPatient["status"]): StatusLevel => {
    if (status === "checkin_suggested") return "urgent";
    if (status === "watch") return "watch";
    return "steady";
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
      {/* ── Top Bar Navigation ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b pb-4" style={{ borderColor: "var(--border-soft)" }}>
        {selectedPatient ? (
          <button
            type="button"
            onClick={() => setSelectedPatientId(null)}
            className="inline-flex items-center gap-2 text-base font-semibold px-4 py-2 rounded-full border transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--primary)",
              minHeight: "44px",
            }}
          >
            <ArrowLeft size={18} aria-hidden="true" />
            <span>Back to Assigned Households</span>
          </button>
        ) : (
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
        )}

        <div className="flex items-center gap-3">
          <SyncStatusChip />
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider text-[var(--primary)] bg-[var(--primary-light)] border-[var(--primary)]"
          >
            ASHA Portal · PHC Sector 4
          </span>
        </div>
      </div>

      {exportNotice && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-[var(--radius-md)] px-4 py-3 text-xs font-bold flex items-center gap-2 border shadow-xs"
          style={{
            background: "var(--primary-light)",
            borderColor: "var(--primary)",
            color: "var(--primary-dark)",
          }}
        >
          <FileText size={18} aria-hidden="true" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* ── VIEW 1: PATIENT DETAIL SCREEN ── */}
      {selectedPatient ? (
        <div className="space-y-6" role="region" aria-label="Elder Clinical Detail">
          {/* Header Card */}
          <div
            className="rounded-[var(--radius-card)] p-6 md:p-8 border-2 shadow-sm space-y-4"
            style={{
              background: "var(--surface)",
              borderColor: "var(--primary)",
            }}
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--border)",
                      color: "var(--ink-soft)",
                    }}
                  >
                    SYNTHETIC DEMO PATIENT
                  </span>
                  <StatusChip
                    status={mapStatusLevel(selectedPatient.status)}
                    label={selectedPatient.statusLabel}
                  />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
                  {selectedPatient.name}
                </h1>
                <p className="text-sm font-medium" style={{ color: "var(--ink-soft)" }}>
                  {selectedPatient.location} · Preferred Language: {selectedPatient.preferredLanguage}
                </p>
              </div>

              {/* PDF Export Action */}
              <button
                type="button"
                id="export-pdf-detail-btn"
                onClick={() => handleExportPdf(selectedPatient)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-white text-xs md:text-sm font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
                style={{
                  background: "var(--primary)",
                  minHeight: "48px",
                }}
              >
                <Download size={18} aria-hidden="true" />
                <span>Export PDF Summary</span>
              </button>
            </div>

            {/* Household Guardian Info */}
            <div
              className="p-4 rounded-[var(--radius-md)] border text-xs md:text-sm space-y-1"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
              }}
            >
              <span className="font-bold block uppercase tracking-wider text-[var(--ink)]">
                Primary Caregiver Contact
              </span>
              <p style={{ color: "var(--ink-soft)" }}>
                Guardian: <strong>{selectedPatient.guardianName}</strong> ({selectedPatient.guardianRel})
              </p>
              <p style={{ color: "var(--ink-soft)" }}>
                Consent: Active verifiable guardian consent registered under DPDP Act 2023.
              </p>
            </div>
          </div>

          {/* Explainable Statistical Evidence */}
          <div
            className="rounded-[var(--radius-card)] p-6 md:p-8 border shadow-sm space-y-6"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                Explainable Anomaly Evidence
              </h2>
              <p className="text-xs md:text-sm" style={{ color: "var(--ink-soft)" }}>
                Mathematical evidence comparing current session against the 14-day rolling baseline (median and MAD).
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
              <div className="p-4 rounded-[var(--radius-md)] border" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                <span className="text-xs font-bold uppercase tracking-wider block text-[var(--ink-muted)]">Observed Score</span>
                <span className="text-2xl font-black mt-1 block" style={{ color: "var(--alert)" }}>
                  {Math.round(selectedPatient.currentScore * 100)}%
                </span>
              </div>
              <div className="p-4 rounded-[var(--radius-md)] border" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                <span className="text-xs font-bold uppercase tracking-wider block text-[var(--ink-muted)]">Baseline Median</span>
                <span className="text-2xl font-black mt-1 block" style={{ color: "var(--primary)" }}>
                  {Math.round(selectedPatient.baselineMedian * 100)}%
                </span>
              </div>
              <div className="p-4 rounded-[var(--radius-md)] border" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                <span className="text-xs font-bold uppercase tracking-wider block text-[var(--ink-muted)]">Robust Z-Score</span>
                <span className="text-2xl font-black mt-1 block" style={{ color: "var(--alert)" }}>
                  {selectedPatient.robustZ}
                </span>
              </div>
              <div className="p-4 rounded-[var(--radius-md)] border" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                <span className="text-xs font-bold uppercase tracking-wider block text-[var(--ink-muted)]">Weekly Sessions</span>
                <span className="text-2xl font-black mt-1 block" style={{ color: "var(--ink)" }}>
                  {selectedPatient.sessionsThisWeek}
                </span>
              </div>
            </div>

            {/* Domains Breakdown */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider block text-[var(--ink-muted)]">
                Recent Domain Activity
              </span>
              <div className="space-y-2">
                {selectedPatient.domains.map((d) => (
                  <div
                    key={d.name}
                    className="p-3.5 rounded-[var(--radius-md)] border flex items-center justify-between text-sm"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--border-soft)",
                    }}
                  >
                    <span className="font-semibold text-[var(--ink)]">{d.name}</span>
                    <span className="font-bold text-[var(--primary)]">{Math.round(d.score * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Advisory Guidance */}
            <div
              className="p-5 rounded-[var(--radius-md)] border space-y-1 text-xs md:text-sm"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
                color: "var(--ink-soft)",
              }}
            >
              <span className="font-bold block text-[var(--ink)]">Non-Diagnostic Guidance:</span>
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs md:text-sm font-bold border transition-colors cursor-pointer"
                style={
                  scheduledVisits[selectedPatient.id]
                    ? {
                        background: "var(--primary-light)",
                        color: "var(--primary-dark)",
                        borderColor: "var(--primary)",
                        minHeight: "48px",
                      }
                    : {
                        background: "var(--primary)",
                        color: "var(--primary-ink)",
                        borderColor: "var(--primary)",
                        minHeight: "48px",
                      }
                }
              >
                {scheduledVisits[selectedPatient.id] ? (
                  <>
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>Household Check-in Scheduled</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck size={18} aria-hidden="true" />
                    <span>Schedule Household Check-in</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── VIEW 2: PATIENT LIST SCREEN (ORDERED BY TRIAGE NEED) ── */
        <div className="space-y-6">
          <div
            className="rounded-[var(--radius-card)] p-6 md:p-8 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
                {t("title")}
              </h1>
              <p className="text-sm md:text-base font-normal mt-1" style={{ color: "var(--ink-soft)" }}>
                3 assigned households in Primary Health Centre sector. Ordered by triage priority.
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1.5 rounded-full border self-start md:self-auto uppercase tracking-wider text-[var(--ink-soft)] bg-[var(--surface-2)] border-[var(--border)]">
              SYNTHETIC DEMO PATIENTS
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
                Assigned Elders ({patients.length})
              </h2>
              <span className="text-xs font-semibold" style={{ color: "var(--ink-soft)" }}>
                Priority order: Urgent Check-in ➔ Watch ➔ Steady
              </span>
            </div>

            <div className="space-y-3" role="list" aria-label="Assigned elder households">
              {patients.map((elder) => (
                <div
                  key={elder.id}
                  className="p-5 md:p-6 rounded-[var(--radius-card)] border-2 transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                  style={{
                    background: "var(--surface)",
                    borderColor: elder.status === "checkin_suggested" ? "var(--alert)" : "var(--border)",
                  }}
                  role="listitem"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md border text-[var(--ink-soft)] bg-[var(--surface-2)] border-[var(--border)]">
                        Priority {elder.triagePriority}
                      </span>
                      <StatusChip
                        status={mapStatusLevel(elder.status)}
                        label={elder.statusLabel}
                        size="sm"
                      />
                    </div>

                    <h3 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
                      {elder.name}
                    </h3>
                    <p className="text-xs md:text-sm" style={{ color: "var(--ink-soft)" }}>
                      {elder.location} · Guardian: {elder.guardianName} ({elder.guardianRel})
                    </p>
                    <span className="text-xs text-[var(--ink-muted)] block">
                      Last active: {elder.lastActive} · {elder.sessionsThisWeek} sessions this week
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    {/* PDF Export Button */}
                    <button
                      type="button"
                      id={`export-pdf-${elder.id}`}
                      onClick={() => handleExportPdf(elder)}
                      className="px-4 py-2.5 rounded-full border text-xs font-bold transition-colors hover:bg-[var(--surface-2)] flex items-center gap-1.5 cursor-pointer"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--ink)",
                        minHeight: "44px",
                      }}
                      aria-label={`Download PDF report for ${elder.name}`}
                    >
                      <Download size={15} aria-hidden="true" />
                      <span>PDF</span>
                    </button>

                    {/* View Details Button */}
                    <button
                      type="button"
                      id={`view-detail-${elder.id}`}
                      onClick={() => setSelectedPatientId(elder.id)}
                      className="px-5 py-2.5 rounded-full text-white text-xs md:text-sm font-bold shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                      style={{
                        background: "var(--primary)",
                        minHeight: "44px",
                      }}
                    >
                      <span>View Details</span>
                      <ArrowRight size={15} aria-hidden="true" />
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
