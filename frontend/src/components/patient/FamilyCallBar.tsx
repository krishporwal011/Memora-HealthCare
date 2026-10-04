"use client";

import React, { useState } from "react";
import { Phone, Check } from "lucide-react";

export interface FamilyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  avatarUrl?: string;
  initials: string;
}

export const DEFAULT_CONTACTS: FamilyContact[] = [
  {
    id: "c1",
    name: "Jonali",
    relation: "Daughter",
    phone: "tel:+919876543210",
    initials: "J",
  },
  {
    id: "c2",
    name: "Ranjit",
    relation: "Son",
    phone: "tel:+919876543211",
    initials: "R",
  },
];

interface FamilyCallBarProps {
  contacts?: FamilyContact[];
  className?: string;
  onCallInitiated?: (contact: FamilyContact) => void;
}

export function FamilyCallBar({
  contacts = DEFAULT_CONTACTS,
  className = "",
  onCallInitiated,
}: FamilyCallBarProps) {
  const [callingId, setCallingId] = useState<string | null>(null);

  const handleCall = (contact: FamilyContact) => {
    setCallingId(contact.id);
    if (onCallInitiated) {
      onCallInitiated(contact);
    }
    setTimeout(() => {
      setCallingId(null);
    }, 4000);
  };

  return (
    <nav
      aria-label="Family Speed Dial"
      className={`w-full rounded-[var(--radius-card)] p-3 md:p-4 border-2 shadow-md ${className}`}
      style={{
        background: "var(--surface)",
        borderColor: "var(--primary)",
      }}
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span
          className="text-xs font-bold uppercase tracking-wider block"
          style={{ color: "var(--ink-soft)" }}
        >
          Call Family Any Time
        </span>
        {callingId && (
          <span
            role="status"
            className="text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
            style={{
              background: "var(--success-light)",
              color: "var(--success)",
            }}
          >
            <Check size={12} aria-hidden="true" />
            Connecting call...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-md)] border"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border-soft)",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 border"
                style={{
                  background: "var(--primary-light)",
                  color: "var(--primary-dark)",
                  borderColor: "var(--primary)",
                }}
                aria-hidden="true"
              >
                {contact.initials}
              </div>
              <div className="truncate">
                <span
                  className="font-bold text-base md:text-lg block truncate"
                  style={{ color: "var(--ink)" }}
                >
                  {contact.name}
                </span>
                <span
                  className="text-xs md:text-sm block"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {contact.relation}
                </span>
              </div>
            </div>

            <a
              href={contact.phone}
              onClick={(e) => {
                handleCall(contact);
              }}
              className="inline-flex items-center justify-center gap-2 font-bold text-sm md:text-base px-4 py-3 rounded-full text-white no-underline shadow-sm transition-transform active:scale-95 shrink-0"
              style={{
                background: "var(--primary)",
                minHeight: "var(--touch-target-patient)",
                minWidth: "110px",
              }}
              aria-label={`Call ${contact.name}, ${contact.relation}`}
            >
              <Phone size={20} aria-hidden="true" />
              <span>Call</span>
            </a>
          </div>
        ))}
      </div>
    </nav>
  );
}
