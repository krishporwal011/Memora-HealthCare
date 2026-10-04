"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Calendar, Users, Camera, Sparkles, Filter } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface TimelineMemory {
  id: string;
  year: number;
  season?: string;
  location: string;
  title: string;
  story: string;
  people: string[];
  type: "photo" | "song" | "story";
}

const TIMELINE_DATA: TimelineMemory[] = [
  {
    id: "tl-1",
    year: 1974,
    season: "Autumn",
    location: "Guwahati Courtyard",
    title: "Old Folk Song & Family Gathering",
    story: "Mother and Pratima sang traditional Goalpariya folk songs during the evening courtyard gathering by the lantern.",
    people: ["Mother", "Pratima", "Bhaben Baruah"],
    type: "song",
  },
  {
    id: "tl-2",
    year: 1985,
    season: "Spring (Rongali Bihu)",
    location: "Ancestral Home in Tezpur",
    title: "Rongali Bihu Harvest & Blessings",
    story: "Grandmother presented the hand-woven phulam gamosa with sacred blessing prayers for the harvest and family prosperity.",
    people: ["Grandmother", "Jonali", "Ranjit"],
    type: "photo",
  },
  {
    id: "tl-3",
    year: 1991,
    season: "Monsoon",
    location: "Brahmaputra Ferry Crossing",
    title: "Ferry Journey across Silghat",
    story: "Taking the early morning wooden boat across the swollen river, watching the mist rise above the tea hills.",
    people: ["Father", "Ranjit"],
    type: "story",
  },
  {
    id: "tl-4",
    year: 1998,
    season: "Autumn",
    location: "Jorhat Tea Estate",
    title: "Tea Harvest Walk",
    story: "Walking through rows of tea bushes in Jorhat with uncle Hemen, plucking fresh morning leaves in cane baskets.",
    people: ["Uncle Hemen", "Jonali"],
    type: "photo",
  },
  {
    id: "tl-5",
    year: 2012,
    season: "Winter",
    location: "Family Verandah in Tezpur",
    title: "Granddaughter's First Folk Dance",
    story: "Jonali's daughter wore her first muga silk mekhela sador and performed the gentle Bihu dance on the verandah.",
    people: ["Jonali", "Granddaughter"],
    type: "photo",
  },
];

export default function CaregiverTimelinePage() {
  const [selectedType, setSelectedType] = useState<string>("all");

  const filtered = selectedType === "all"
    ? TIMELINE_DATA
    : TIMELINE_DATA.filter((m) => m.type === selectedType);

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-8">
      {/* ── Top Navigation Bar ── */}
      <div className="flex items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--border-soft)" }}>
        <Link
          href="/care"
          className="inline-flex items-center gap-2 text-base font-semibold px-4 py-2.5 rounded-full border no-underline transition-colors hover:bg-[var(--surface-2)]"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--primary)",
            minHeight: "44px",
          }}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back to Care Portal</span>
        </Link>

        <span className="text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider text-[var(--accent-dark)] bg-[var(--accent-light)] border-[var(--accent)]">
          Synthetic Life Story Archive
        </span>
      </div>

      {/* ── Section Header ── */}
      <SectionHeader
        eyebrow="Family Reminiscence Timeline"
        title="Chronological Life Story"
        description="A chronological journey through your loved one's cherished milestones, stories, and songs across the North East."
        action={
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[var(--ink-muted)]" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs font-bold rounded-lg px-3 py-2 border bg-[var(--surface)] text-[var(--ink)] border-[var(--border)] cursor-pointer"
            >
              <option value="all">All Memories</option>
              <option value="photo">Photos Only</option>
              <option value="song">Songs Only</option>
              <option value="story">Stories Only</option>
            </select>
          </div>
        }
      />

      {/* ── Vertical Timeline ── */}
      <div className="relative border-l-2 ml-4 md:ml-8 pl-6 md:pl-8 space-y-8" style={{ borderColor: "var(--primary-light)" }}>
        {filtered.map((item) => (
          <div key={item.id} className="relative group">
            {/* Timeline Milestone Dot */}
            <div
              className="absolute -left-[35px] md:-left-[43px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-xs"
              style={{
                background: "var(--accent)",
                borderColor: "var(--surface)",
              }}
              aria-hidden="true"
            >
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>

            {/* Timeline Card */}
            <article
              className="rounded-[var(--radius-card)] p-6 border-2 transition-all hover:shadow-md"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border-soft)",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-lg font-black tracking-tight"
                    style={{ color: "var(--primary)" }}
                  >
                    {item.year}
                  </span>
                  {item.season && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--ink-soft)] border border-[var(--border)]">
                      {item.season}
                    </span>
                  )}
                </div>

                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  {item.location}
                </span>
              </div>

              <h3 className="text-xl font-bold tracking-tight mb-2" style={{ color: "var(--ink)" }}>
                {item.title}
              </h3>

              <p className="text-base leading-relaxed mb-4" style={{ color: "var(--ink-soft)" }}>
                {item.story}
              </p>

              {/* People Tag Strip */}
              <div className="flex items-center gap-4 text-xs font-medium pt-3 border-t" style={{ borderColor: "var(--border-soft)", color: "var(--ink-soft)" }}>
                <span className="inline-flex items-center gap-1.5">
                  <Users size={14} aria-hidden="true" />
                  <span>With {item.people.join(", ")}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 ml-auto">
                  <Camera size={14} aria-hidden="true" />
                  <span className="capitalize">{item.type}</span>
                </span>
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}
