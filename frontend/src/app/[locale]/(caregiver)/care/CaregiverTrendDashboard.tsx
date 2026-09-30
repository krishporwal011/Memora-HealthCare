"use client";

import { useState, useEffect } from "react";
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
        <div className="p-5 rounded-2xl bg-white border border-[#D1CEC4] shadow-xs">
          <span className="text-xs font-bold text-[#52504C] uppercase tracking-wider block">
            Today's Activity
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#1B3B36]">
              {Math.round(latestDay.score * 100)}%
            </span>
            <span className="text-xs text-[#52504C]">accuracy</span>
          </div>
          <span className="text-xs text-[#52504C] mt-2 block">
            1 session completed at 10:30 AM (Offline Synced)
          </span>
        </div>

        {/* Usual Range Baseline */}
        <div className="p-5 rounded-2xl bg-white border border-[#D1CEC4] shadow-xs">
          <span className="text-xs font-bold text-[#52504C] uppercase tracking-wider block">
            Usual Range
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#2D6A4F]">
              {Math.round(latestDay.usualMin * 100)}% – {Math.round(latestDay.usualMax * 100)}%
            </span>
          </div>
          <span className="text-xs text-[#52504C] mt-2 block">
            Median baseline: {Math.round(latestDay.median * 100)}% (14-day robust median)
          </span>
        </div>

        {/* Observation State */}
        <div className="p-5 rounded-2xl bg-white border border-[#D1CEC4] shadow-xs">
          <span className="text-xs font-bold text-[#52504C] uppercase tracking-wider block">
            Current Status
          </span>
          <div className="mt-2">
            {isUnwell ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF8E7] text-[#7A5800] border border-[#E0D0A0]">
                🛌 Marked Unwell (Alerts Paused)
              </span>
            ) : isAlertActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FDF1EC] text-[#9A3412] border border-[#F5C2B1]">
                ⚠️ Lower Than Usual
              </span>
            ) : isAcknowledged ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF3EE] text-[#1B3B36] border border-[#A7D1B9]">
                ✓ Acknowledged
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF3EE] text-[#2D6A4F] border border-[#A7D1B9]">
                ✓ Steady
              </span>
            )}
          </div>
          <span className="text-xs text-[#52504C] mt-2 block">
            {isUnwell
              ? "Change notifications paused for recovery."
              : isAlertActive
              ? "Noticeable shift from personal baseline."
              : "Within typical daily variation."}
          </span>
        </div>
      </div>

      {/* 2. UNWELL-TODAY CONTROL */}
      <div className="bg-[#FAF8F5] p-5 rounded-2xl border-2 border-[#D1CEC4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label htmlFor="unwell-control-toggle" className="font-bold text-sm text-[#1C1C1A] block cursor-pointer">
            Mark {patientName} as feeling unwell today
          </label>
          <span className="text-xs text-[#52504C] block mt-0.5">
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
            className="w-6 h-6 rounded accent-[#C85A32] cursor-pointer"
            aria-label={`Mark ${patientName} as unwell today`}
          />
          <span className="text-xs font-bold text-[#1C1C1A]">
            {isUnwell ? "Unwell (Alerts Paused)" : "Active Monitoring"}
          </span>
        </div>
      </div>

      {/* 3. ALERT CARD & EXPLAINABLE EVIDENCE */}
      {isAlertActive && (
        <div
          role="region"
          aria-label="Caregiver Attention Notice"
          className="bg-white rounded-2xl p-6 border-3 border-[#C85A32] shadow-sm space-y-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl p-2 rounded-xl bg-[#FDF1EC] text-[#9A3412]" aria-hidden="true">
              ⚠️
            </span>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9A3412] bg-[#FDF1EC] px-2.5 py-0.5 rounded-md border border-[#F5C2B1]">
                Check-in Suggested
              </span>
              <h3 className="text-lg font-bold text-[#1C1C1A]">
                Activity Performance Lower than Usual Range
              </h3>
            </div>
          </div>

          <p className="text-sm text-[#52504C] leading-relaxed">
            Today's memory activity performance was lower than their usual range (score 0.42 vs typical 0.82). This can have many temporary causes such as tiredness, distraction, or mild fever. Consider a check-up with a doctor if this pattern continues.
          </p>

          {/* Triggering Numbers Evidence Accordion */}
          <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#D1CEC4] space-y-2 text-xs">
            <span className="font-bold text-[#1C1C1A] block uppercase tracking-wider">
              Explainable Anomaly Evidence (Statistical Baseline)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-center sm:text-left">
              <div>
                <span className="text-[#52504C] block">Observed Score:</span>
                <span className="font-bold text-[#9A3412] text-sm">0.42 (42%)</span>
              </div>
              <div>
                <span className="text-[#52504C] block">Baseline Median:</span>
                <span className="font-bold text-[#1B3B36] text-sm">0.82 (82%)</span>
              </div>
              <div>
                <span className="text-[#52504C] block">Robust Z-Score:</span>
                <span className="font-bold text-[#9A3412] text-sm">-2.85 (≤ -2.5)</span>
              </div>
              <div>
                <span className="text-[#52504C] block">Sample Size:</span>
                <span className="font-bold text-[#1C1C1A] text-sm">13 baseline sessions</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              id="acknowledge-alert-btn"
              onClick={() => setIsAcknowledged(true)}
              className="px-5 py-2.5 rounded-xl bg-[#1B3B36] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-xs transition-colors"
              style={{ minHeight: "44px" }}
            >
              ✓ Acknowledge Observation
            </button>
          </div>
        </div>
      )}

      {/* 4. 14-DAY LONGITUDINAL CHART & USUAL RANGE BAND */}
      <div className="bg-white rounded-2xl p-6 border border-[#D1CEC4] shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-bold text-[#1C1C1A]">14-Day Activity Trend</h3>
            <p className="text-xs text-[#52504C]">
              Blue shaded band indicates typical personal range. Solid line shows daily accuracy.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDataTable((prev) => !prev)}
            className="text-xs text-[#1B3B36] hover:underline font-semibold p-1"
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
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E2DA" />
                <XAxis dataKey="date" tick={{ fill: "#52504C", fontSize: 11 }} />
                <YAxis
                  domain={[0.0, 1.0]}
                  ticks={[0.2, 0.4, 0.6, 0.8, 1.0]}
                  tickFormatter={(val) => `${Math.round(val * 100)}%`}
                  tick={{ fill: "#52504C", fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: any) => [`${Math.round(Number(value) * 100)}%`, "Score"]}
                  labelStyle={{ fontWeight: "bold", color: "#1C1C1A" }}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #D1CEC4" }}
                />
                {/* Usual Range reference ribbon */}
                <ReferenceArea
                  y1={0.72}
                  y2={0.90}
                  fill="#EAF3EE"
                  fillOpacity={0.6}
                  stroke="#A7D1B9"
                  strokeDasharray="2 2"
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#1B3B36"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#1B3B36" }}
                  activeDot={{ r: 6, fill: "#C85A32" }}
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
          <div className="overflow-x-auto border border-[#D1CEC4] rounded-xl">
            <table className="w-full text-left text-xs" aria-label="14-day cognitive activity performance data">
              <caption className="sr-only">Longitudinal 14-day performance and usual range table</caption>
              <thead className="bg-[#F8F6F0] text-[#52504C] font-bold border-b border-[#D1CEC4]">
                <tr>
                  <th scope="col" className="p-2.5">Date</th>
                  <th scope="col" className="p-2.5">Observed Score</th>
                  <th scope="col" className="p-2.5">Usual Range</th>
                  <th scope="col" className="p-2.5">Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DA]">
                {FOURTEEN_DAY_DATA.map((row) => (
                  <tr key={row.date} className={row.isDip ? "bg-[#FFF8E7]" : "bg-white"}>
                    <td className="p-2.5 font-medium">{row.date}</td>
                    <td className="p-2.5 font-bold">{Math.round(row.score * 100)}%</td>
                    <td className="p-2.5">{Math.round(row.usualMin * 100)}% – {Math.round(row.usualMax * 100)}%</td>
                    <td className="p-2.5">
                      {row.isDip ? (
                        <span className="text-[#9A3412] font-bold">Lower than usual range</span>
                      ) : (
                        <span className="text-[#2D6A4F]">Within usual range</span>
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
      <div className="bg-white rounded-2xl p-6 border border-[#D1CEC4] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1C1C1A]">Weekly Summary (Sep 24 – Sep 30)</h3>
          <span className="text-xs font-bold text-[#1B3B36] bg-[#EAF3EE] px-2.5 py-1 rounded-full border border-[#A7D1B9]">
            6 active days
          </span>
        </div>
        <p className="text-sm text-[#52504C] leading-relaxed">
          Over the past week, {patientName} completed 7 activity sessions with an average response engagement time of 6.8 minutes per session. Activities included Memory Match (Cultural) and Family Photo Memories.
        </p>
        <div className="p-3.5 rounded-xl bg-[#F8F6F0] border border-[#D1CEC4] text-xs text-[#52504C]">
          <span className="font-bold text-[#1C1C1A] block">Overall Observation:</span>
          Performance remained steady across 6 of the 7 days. Today's score was slightly lower than their usual baseline.
        </div>
      </div>
    </div>
  );
}
