"use client";

import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
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
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border"
        style={{
          background: "var(--primary-light)",
          borderColor: "var(--primary)",
          color: "var(--primary-dark)",
        }}
        aria-hidden="true"
      >
        {typeof icon === "string" ? (
          <span className="text-2xl">{icon}</span>
        ) : (
          icon || <FolderOpen size={28} />
        )}
      </div>
      <h3
        className="text-lg font-bold mb-1"
        style={{ color: "var(--ink)" }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm leading-relaxed max-w-xs"
          style={{ color: "var(--ink-soft)" }}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
