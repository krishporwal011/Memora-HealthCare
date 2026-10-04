"use client";

import React from "react";
import { Image as ImageIcon, Music, BookOpen, Users, Calendar, Check, Trash2, Play, HardDrive } from "lucide-react";

export type MemoryType = "photo" | "song" | "story";

export interface MemoryCardProps {
  id?: string;
  memoryType: MemoryType;
  caption: string;
  imageUrl?: string;
  people?: string[];
  year?: number;
  isApproved: boolean;
  isOfflinePending?: boolean;
  onApprove?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  onPlayAudio?: () => void;
  className?: string;
}

const TYPE_CONFIG = {
  photo: {
    icon: ImageIcon,
    label: "Photo",
  },
  song: {
    icon: Music,
    label: "Song",
  },
  story: {
    icon: BookOpen,
    label: "Story",
  },
};

export function MemoryCard({
  memoryType,
  caption,
  imageUrl,
  people = [],
  year,
  isApproved,
  isOfflinePending = false,
  onApprove,
  onDelete,
  onClick,
  onPlayAudio,
  className = "",
}: MemoryCardProps) {
  const config = TYPE_CONFIG[memoryType] || TYPE_CONFIG.photo;
  const TypeIcon = config.icon;

  return (
    <article
      className={`rounded-[var(--radius-card)] border overflow-hidden flex flex-col transition-all hover:shadow-[var(--shadow-md)] ${className}`}
      style={{
        background: "var(--surface)",
        borderColor: isApproved ? "var(--border)" : "var(--accent)",
      }}
    >
      {/* ── Photo-Led Media Window ── */}
      <div
        onClick={onClick}
        className={`relative w-full aspect-[4/3] overflow-hidden select-none ${
          onClick ? "cursor-pointer group" : ""
        }`}
        style={{ background: "var(--surface-2)" }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={caption}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          /* Elegant inline SVG photo representation with NER motif */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <svg
              className="w-20 h-20 mb-2 opacity-80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="80" height="80" rx="16" fill="var(--primary-light)" />
              <path
                d="M20 54L32 38L44 54L52 44L60 54H20Z"
                fill="var(--primary)"
                fillOpacity="0.8"
              />
              <circle cx="32" cy="28" r="6" fill="var(--accent)" />
            </svg>
            <span
              className="text-xs font-bold uppercase tracking-wider block"
              style={{ color: "var(--ink-muted)" }}
            >
              Synthetic Memory Archive
            </span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs"
            style={{
              background: "var(--surface)",
              color: "var(--ink)",
            }}
          >
            <TypeIcon size={14} aria-hidden="true" />
            <span>{config.label}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {isOfflinePending && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs border"
                style={{
                  background: "var(--surface)",
                  color: "var(--accent-dark)",
                  borderColor: "var(--accent)",
                }}
              >
                <HardDrive size={12} aria-hidden="true" />
                <span>Saved locally</span>
              </span>
            )}

            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs border"
              style={
                isApproved
                  ? {
                      background: "var(--success-light)",
                      color: "var(--success)",
                      borderColor: "var(--success)",
                    }
                  : {
                      background: "var(--accent-light)",
                      color: "var(--accent-dark)",
                      borderColor: "var(--accent)",
                    }
              }
            >
              {isApproved && <Check size={12} aria-hidden="true" />}
              <span>{isApproved ? "Approved" : "Needs Review"}</span>
            </span>
          </div>
        </div>

        {/* Audio Play Overlay for songs */}
        {memoryType === "song" && onPlayAudio && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlayAudio();
            }}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-transform active:scale-90"
            style={{ background: "var(--primary)" }}
            aria-label={`Play song: ${caption}`}
          >
            <Play size={18} fill="currentColor" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── Content & Spec Strip ── */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          <p
            onClick={onClick}
            className={`font-bold text-base md:text-lg leading-snug line-clamp-2 ${
              onClick ? "cursor-pointer hover:underline" : ""
            }`}
            style={{ color: "var(--ink)" }}
          >
            {caption}
          </p>

          {/* Metadata pill row */}
          <div className="flex items-center gap-3 text-xs font-medium flex-wrap" style={{ color: "var(--ink-soft)" }}>
            {year && (
              <span className="inline-flex items-center gap-1">
                <Calendar size={13} aria-hidden="true" />
                <span>{year}</span>
              </span>
            )}
            {people.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users size={13} aria-hidden="true" />
                <span>{people.join(", ")}</span>
              </span>
            )}
          </div>
        </div>

        {/* ── Actions Footer ── */}
        {(onApprove || onDelete) && (
          <div
            className="flex items-center justify-between gap-2 pt-3 border-t mt-auto"
            style={{ borderColor: "var(--border-soft)" }}
          >
            {onApprove && (
              <button
                type="button"
                onClick={onApprove}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-bold border transition-colors cursor-pointer"
                style={
                  isApproved
                    ? {
                        background: "var(--surface-2)",
                        color: "var(--ink-soft)",
                        borderColor: "var(--border)",
                      }
                    : {
                        background: "var(--primary)",
                        color: "var(--primary-ink)",
                        borderColor: "var(--primary)",
                      }
                }
                aria-pressed={isApproved}
              >
                <Check size={14} aria-hidden="true" />
                <span>{isApproved ? "Revoke Approval" : "Approve for Activities"}</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-2 rounded-full border transition-colors hover:bg-[var(--alert-light)] text-[var(--ink-muted)] hover:text-[var(--alert)] cursor-pointer"
                style={{ borderColor: "var(--border-soft)" }}
                aria-label="Delete memory permanently"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
