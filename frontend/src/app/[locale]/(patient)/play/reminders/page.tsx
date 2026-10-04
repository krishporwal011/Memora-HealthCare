"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Bell } from "lucide-react";
import { DayHeader } from "@/components/ui/DayHeader";
import { ReminderCard, type ReminderType } from "@/components/patient/ReminderCard";

interface PatientReminder {
  id: string;
  type: ReminderType;
  title: string;
  timeText: string;
  instructions: string;
}

const DEMO_REMINDERS: PatientReminder[] = [
  {
    id: "r1",
    type: "medicine",
    title: "Morning Blood Pressure Tablet",
    timeText: "8:00 AM (Morning)",
    instructions: "Take one tablet with a full glass of warm water after eating light breakfast.",
  },
  {
    id: "r2",
    type: "meal",
    title: "Afternoon Warm Herbal Tea",
    timeText: "4:30 PM (Evening)",
    instructions: "Enjoy a warm cup of Assam tea with grandmother in the verandah.",
  },
  {
    id: "r3",
    type: "appointment",
    title: "ASHA Health Worker Visit",
    timeText: "Tomorrow at 10:30 AM",
    instructions: "Didi Priyanka will visit to check your blood pressure and share gentle activities.",
  },
];

export default function PatientRemindersPage() {
  const [reminders, setReminders] = useState(DEMO_REMINDERS);

  const handlePostpone = (id: string) => {
    alert("Reminder postponed by 30 minutes. We will remind you calmly.");
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-2xl mx-auto w-full px-4 py-5 pb-8">
      {/* ── Orientation Header ── */}
      <DayHeader patientName="Bhaben" />

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/play"
          className="inline-flex items-center gap-2 text-base md:text-lg font-bold px-4 py-2.5 rounded-full border no-underline transition-all active:scale-95 shadow-xs"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--primary)",
            minHeight: "56px",
          }}
          aria-label="Return to patient activities"
        >
          <ArrowLeft size={22} aria-hidden="true" />
          <span>Back to Activities</span>
        </Link>
      </div>

      {/* ── Title ── */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
          Today's Routine & Reminders
        </h1>
        <p className="text-lg font-medium" style={{ color: "var(--ink-soft)" }}>
          Gentle reminders for medicine, meals, and family appointments.
        </p>
      </div>

      {/* ── Reminders List ── */}
      <div className="space-y-4">
        {reminders.map((r) => (
          <ReminderCard
            key={r.id}
            id={r.id}
            type={r.type}
            title={r.title}
            timeText={r.timeText}
            instructions={r.instructions}
            onPostpone={() => handlePostpone(r.id)}
          />
        ))}
      </div>
    </div>
  );
}
