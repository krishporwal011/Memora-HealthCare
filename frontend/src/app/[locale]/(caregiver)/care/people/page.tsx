"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Phone, UserCheck, Heart, Users, Plus } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface FamilyPerson {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  memoriesCount: number;
  isPrimaryCaregiver?: boolean;
  notes: string;
}

const FAMILY_PEOPLE: FamilyPerson[] = [
  {
    id: "p1",
    name: "Jonali Baruah",
    relationship: "Daughter & Primary Caregiver",
    phone: "tel:+919876543210",
    memoriesCount: 14,
    isPrimaryCaregiver: true,
    notes: "Visits every morning and evening. Manages medication routines and daily photos.",
  },
  {
    id: "p2",
    name: "Ranjit Baruah",
    relationship: "Son",
    phone: "tel:+919876543211",
    memoriesCount: 8,
    isPrimaryCaregiver: false,
    notes: "Calls every Sunday evening from Guwahati. Loved fishing trips with father.",
  },
  {
    id: "p3",
    name: "Grandmother (Aita)",
    relationship: "Late Mother / Ancestor",
    phone: "",
    memoriesCount: 9,
    isPrimaryCaregiver: false,
    notes: "Appears in 1985 Bihu photos with phulam gamosa. Inspires calm reminiscence.",
  },
  {
    id: "p4",
    name: "Uncle Hemen",
    relationship: "Maternal Uncle",
    phone: "tel:+919876543212",
    memoriesCount: 5,
    isPrimaryCaregiver: false,
    notes: "Lives in Jorhat near the tea gardens. Frequent topic in daily questions.",
  },
];

export default function CaregiverPeoplePage() {
  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-8">
      {/* ── Top Bar ── */}
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
          Synthetic Family Directory
        </span>
      </div>

      {/* ── Section Header ── */}
      <SectionHeader
        eyebrow="Family & Loved Ones"
        title="People in Memory Activities"
        description="These family members and caregivers are tagged in memories and used to formulate gentle reminiscence questions."
        action={
          <button
            type="button"
            onClick={() => alert("Add family member feature is available for registered caregivers.")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
            style={{
              background: "var(--primary)",
              minHeight: "44px",
            }}
          >
            <Plus size={16} aria-hidden="true" />
            <span>Add Family Member</span>
          </button>
        }
      />

      {/* ── People Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FAMILY_PEOPLE.map((person) => (
          <article
            key={person.id}
            className="rounded-[var(--radius-card)] p-6 border-2 space-y-4 shadow-sm"
            style={{
              background: "var(--surface)",
              borderColor: person.isPrimaryCaregiver ? "var(--primary)" : "var(--border-soft)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-2"
                  style={{
                    background: person.isPrimaryCaregiver ? "var(--primary-light)" : "var(--surface-2)",
                    borderColor: person.isPrimaryCaregiver ? "var(--primary)" : "var(--border)",
                    color: person.isPrimaryCaregiver ? "var(--primary)" : "var(--ink)",
                  }}
                  aria-hidden="true"
                >
                  {person.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-tight" style={{ color: "var(--ink)" }}>
                    {person.name}
                  </h3>
                  <span className="text-xs font-semibold block mt-0.5" style={{ color: "var(--ink-soft)" }}>
                    {person.relationship}
                  </span>
                </div>
              </div>

              {person.isPrimaryCaregiver && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary)]">
                  <UserCheck size={12} aria-hidden="true" />
                  <span>Primary</span>
                </span>
              )}
            </div>

            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              {person.notes}
            </p>

            <div className="pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: "var(--border-soft)" }}>
              <span className="text-xs font-bold text-[var(--ink-muted)]">
                Tagged in {person.memoriesCount} memories
              </span>

              {person.phone && (
                <a
                  href={person.phone}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border no-underline text-[var(--primary)] hover:bg-[var(--primary-light)] cursor-pointer"
                  style={{ borderColor: "var(--primary)" }}
                  aria-label={`Call ${person.name}`}
                >
                  <Phone size={13} aria-hidden="true" />
                  <span>Call Now</span>
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
