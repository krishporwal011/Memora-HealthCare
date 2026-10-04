"use client";

import React from "react";
import Link from "next/link";
import { FolderOpen } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      role="region"
      aria-label={title}
      className={`rounded-[var(--radius-card)] border-2 border-dashed p-8 md:p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto ${className}`}
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border"
        style={{
          background: "var(--primary-light)",
          borderColor: "var(--primary)",
          color: "var(--primary-dark)",
        }}
        aria-hidden="true"
      >
        {icon || <FolderOpen size={30} />}
      </div>

      <h3
        className="text-xl font-bold tracking-tight mb-2"
        style={{ color: "var(--ink)" }}
      >
        {title}
      </h3>

      <p
        className="text-sm md:text-base leading-relaxed mb-6"
        style={{ color: "var(--ink-soft)" }}
      >
        {description}
      </p>

      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center font-bold text-sm px-6 py-3 rounded-full text-white no-underline shadow-sm transition-transform active:scale-95"
            style={{
              background: "var(--primary)",
              minHeight: "48px",
            }}
          >
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center justify-center font-bold text-sm px-6 py-3 rounded-full text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
            style={{
              background: "var(--primary)",
              minHeight: "48px",
            }}
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
