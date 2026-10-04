"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Bed, Check } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
} from "recharts";

export interface TrendDayData {
  date: string;
  score: number;
  median: number;
  usualMin: number;
  usualMax: number;
  isDip?: boolean;
}

export const FOURTEEN_DAY_DATA: TrendDayData[] = [
  { date: "Sep 17", score: 0.82, median: 0.82, usualMin: 0.72, usualMax: 0.90 },
  { date: "Sep 18", score: 0.85, median: 0.82, usualMin: 0.72, usualMax: 0.90 },
  { date: "Sep 19", score: 0.80, median: 0.82, usualMin: 0.72, usualMax: 0.90 },
  { date: "Sep 20", score: 0.79, median: 0.82, usualMin: 0.72, usualMax: 0.90 },
  { date: "Sep 21", score: 0.84, median: 0.82, usualMin: 0.72, usualMax: 0.90 },
  { date: "Sep 22", score: 0.81, median: 0.82, usualMin: 0.72, usualMax: 0.90 },
  { date: "Sep 23", score: 0.83, median: 0.82, usualMin: 0.72, usualMax: 0.90 },
  { date: "Sep 24", score: 0.85, median: 0.82, usualMin: 0.72, usualMax: 0.90 },
  { date: "Sep 25", score: 0.80, median: 0.82, usualMin: 0.72, usualMax: 0.90 },
  { date: "Sep 26", score: 0.82, median: 0.82, usualMin: 0.72, usualMax: 0.90 },
  { date: "Sep 27", score: 0.83, median: 0.82, usualMin: 0.72, usualMax: 0.90 },
  { date: "Sep 28", score: 0.81, median: 0.82, usualMin: 0.72, usualMax: 0.90 },
  { date: "Sep 29", score: 0.85, median: 0.82, usualMin: 0.72, usualMax: 0.90 },
  { date: "Sep 30", score: 0.42, median: 0.82, usualMin: 0.72, usualMax: 0.90, isDip: true },
];

interface CaregiverTrendDashboardProps {
  patientName?: string;
  initialUnwell?: boolean;
}

export function CaregiverTrendDashboard({
  patientName = "Bhaben Baruah",
  initialUnwell = false,
}: CaregiverTrendDashboardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isUnwell, setIsUnwell] = useState(initialUnwell);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [showDataTable, setShowDataTable] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const latestDay = FOURTEEN_DAY_DATA[FOURTEEN_DAY_DATA.length - 1];
  const hasTriggeredAlert = latestDay.score < latestDay.usualMin;
  const isAlertActive = hasTriggeredAlert && !isUnwell && !isAcknowledged;

  return (
    <div className="space-y-6">
      {/* 1. TODAY'S STATUS & USUAL RANGE OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Status */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--border)] shadow-xs">
          <span className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider block">
            Today's Activity
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[var(--primary)]">
              {Math.round(latestDay.score * 100)}%
            </span>
            <span className="text-xs text-[var(--ink-soft)]">accuracy</span>
          </div>
          <span className="text-xs text-[var(--ink-soft)] mt-2 block">
            1 session completed at 10:30 AM (Offline Synced)
          </span>
        </div>

        {/* Usual Range Baseline */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--border)] shadow-xs">
          <span className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider block">
            Usual Range
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[var(--primary-dark)]">
              {Math.round(latestDay.usualMin * 100)}% – {Math.round(latestDay.usualMax * 100)}%
            </span>
          </div>
          <span className="text-xs text-[var(--ink-soft)] mt-2 block">
            Median baseline: {Math.round(latestDay.median * 100)}% (14-day robust median)
          </span>
        </div>

        {/* Observation State */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--border)] shadow-xs">
          <span className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider block">
            Current Status
          </span>
          <div className="mt-2">
            {isUnwell ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent-light)] text-[var(--accent-dark)] border border-[var(--accent)]">
                <Bed className="w-3.5 h-3.5" />
                <span>Marked Unwell (Alerts Paused)</span>
              </span>
            ) : isAlertActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--alert-light)] text-[var(--alert)] border border-[var(--alert)]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Lower Than Usual</span>
              </span>
            ) : isAcknowledged ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--border)]">
                <Check className="w-3.5 h-3.5" />
                <span>Acknowledged</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--primary-light)] text-[var(--primary-dark)] border border-[var(--border)]">
                <Check className="w-3.5 h-3.5" />
                <span>Steady</span>
              </span>
            )}
          </div>
          <span className="text-xs text-[var(--ink-soft)] mt-2 block">
            {isUnwell
              ? "Change notifications paused for recovery."
              : isAlertActive
              ? "Noticeable shift from personal baseline."
              : "Within typical daily variation."}
          </span>
        </div>
      </div>

      {/* 2. UNWELL-TODAY CONTROL */}
      <div className="bg-[var(--bg)] p-5 rounded-2xl border-2 border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label htmlFor="unwell-control-toggle" className="font-bold text-sm text-[var(--ink)] block cursor-pointer">
            Mark {patientName} as feeling unwell today
          </label>
          <span className="text-xs text-[var(--ink-soft)] block mt-0.5">
            Pauses automated performance alerts so family isn't alarmed by temporary fever or tiredness.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="unwell-control-toggle"
            checked={isUnwell}
            onChange={(e) => {
              setIsUnwell(e.target.checked);
              if (e.target.checked) setIsAcknowledged(false);
            }}
            className="w-6 h-6 rounded accent-[var(--accent)] cursor-pointer"
            aria-label={`Mark ${patientName} as unwell today`}
          />
          <span className="text-xs font-bold text-[var(--ink)]">
            {isUnwell ? "Unwell (Alerts Paused)" : "Active Monitoring"}
          </span>
        </div>
      </div>

      {/* 3. ALERT CARD & EXPLAINABLE EVIDENCE */}
      {isAlertActive && (
        <div
          role="region"
          aria-label="Caregiver Attention Notice"
          className="bg-white rounded-2xl p-6 border-3 border-[var(--accent)] shadow-sm space-y-4"
        >
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-[var(--alert-light)] text-[var(--alert)]" aria-hidden="true">
              <AlertTriangle className="w-6 h-6" />
            </span>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--alert)] bg-[var(--alert-light)] px-2.5 py-0.5 rounded-md border border-[var(--alert)]">
                Check-in Suggested
              </span>
              <h3 className="text-lg font-bold text-[var(--ink)]">
                Activity Performance Lower than Usual Range
              </h3>
            </div>
          </div>

          <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
            Today's memory activity performance was lower than their usual range (score 0.42 vs typical 0.82). This can have many temporary causes such as tiredness, distraction, or mild fever. Consider a check-up with a doctor if this pattern continues.
          </p>

          {/* Triggering Numbers Evidence Accordion */}
          <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2 text-xs">
            <span className="font-bold text-[var(--ink)] block uppercase tracking-wider">
              Explainable Anomaly Evidence (Statistical Baseline)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-center sm:text-left">
              <div>
                <span className="text-[var(--ink-soft)] block">Observed Score:</span>
                <span className="font-bold text-[var(--alert)] text-sm">0.42 (42%)</span>
              </div>
              <div>
                <span className="text-[var(--ink-soft)] block">Baseline Median:</span>
                <span className="font-bold text-[var(--primary)] text-sm">0.82 (82%)</span>
              </div>
              <div>
                <span className="text-[var(--ink-soft)] block">Robust Z-Score:</span>
                <span className="font-bold text-[var(--alert)] text-sm">-2.85 (≤ -2.5)</span>
              </div>
              <div>
                <span className="text-[var(--ink-soft)] block">Sample Size:</span>
                <span className="font-bold text-[var(--ink)] text-sm">13 baseline sessions</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              id="acknowledge-alert-btn"
              onClick={() => setIsAcknowledged(true)}
              className="px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5"
              style={{ minHeight: "44px" }}
            >
              <Check className="w-4 h-4" />
              <span>Acknowledge Observation</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. 14-DAY LONGITUDINAL CHART & USUAL RANGE BAND */}
      <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-bold text-[var(--ink)]">14-Day Activity Trend</h3>
            <p className="text-xs text-[var(--ink-soft)]">
              Blue shaded band indicates typical personal range. Solid line shows daily accuracy.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDataTable((prev) => !prev)}
            className="text-xs text-[var(--primary)] hover:underline font-semibold p-1"
            aria-expanded={showDataTable}
            aria-controls="accessible-trend-table"
          >
            {showDataTable ? "Hide Data Table" : "Show Accessible Data Table"}
          </button>
        </div>

        {/* Visual Chart with Recharts */}
        <div className="w-full h-64 pt-2">
          {isMounted && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FOURTEEN_DAY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fill: "var(--ink-soft)", fontSize: 11 }} />
                <YAxis
                  domain={[0.0, 1.0]}
                  ticks={[0.2, 0.4, 0.6, 0.8, 1.0]}
                  tickFormatter={(val) => `${Math.round(val * 100)}%`}
                  tick={{ fill: "var(--ink-soft)", fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: any) => [`${Math.round(Number(value) * 100)}%`, "Score"]}
                  labelStyle={{ fontWeight: "bold", color: "var(--ink)" }}
                  contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)" }}
                />
                {/* Usual Range reference ribbon */}
                <ReferenceArea
                  y1={0.72}
                  y2={0.90}
                  fill="var(--primary-light)"
                  fillOpacity={0.6}
                  stroke="var(--border)"
                  strokeDasharray="2 2"
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--primary)" }}
                  activeDot={{ r: 6, fill: "var(--accent)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ACCESSIBLE TEXT ALTERNATIVE (Data Table for Screen Readers & Keyboard Users) */}
        <div
          id="accessible-trend-table"
          className={showDataTable ? "block pt-2" : "sr-only"}
          tabIndex={showDataTable ? 0 : -1}
        >
          <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
            <table className="w-full text-left text-xs" aria-label="14-day cognitive activity performance data">
              <caption className="sr-only">Longitudinal 14-day performance and usual range table</caption>
              <thead className="bg-[var(--bg)] text-[var(--ink-soft)] font-bold border-b border-[var(--border)]">
                <tr>
                  <th scope="col" className="p-2.5">Date</th>
                  <th scope="col" className="p-2.5">Observed Score</th>
                  <th scope="col" className="p-2.5">Usual Range</th>
                  <th scope="col" className="p-2.5">Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {FOURTEEN_DAY_DATA.map((row) => (
                  <tr key={row.date} className={row.isDip ? "bg-[var(--accent-light)]" : "bg-white"}>
                    <td className="p-2.5 font-medium">{row.date}</td>
                    <td className="p-2.5 font-bold">{Math.round(row.score * 100)}%</td>
                    <td className="p-2.5">{Math.round(row.usualMin * 100)}% – {Math.round(row.usualMax * 100)}%</td>
                    <td className="p-2.5">
                      {row.isDip ? (
                        <span className="text-[var(--alert)] font-bold">Lower than usual range</span>
                      ) : (
                        <span className="text-[var(--primary)]">Within usual range</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. WEEKLY SUMMARY */}
      <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--ink)]">Weekly Summary (Sep 24 – Sep 30)</h3>
          <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary-light)] px-2.5 py-1 rounded-full border border-[var(--border)]">
            6 active days
          </span>
        </div>
        <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
          Over the past week, {patientName} completed 7 activity sessions with an average response engagement time of 6.8 minutes per session. Activities included Memory Match (Cultural) and Family Photo Memories.
        </p>
        <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--ink-soft)]">
          <span className="font-bold text-[var(--ink)] block">Overall Observation:</span>
          Performance remained steady across 6 of the 7 days. Today's score was slightly lower than their usual baseline.
        </div>
      </div>
    </div>
  );
}
