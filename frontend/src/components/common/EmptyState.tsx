import React from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = "✦",
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
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
        style={{
          background: "var(--primary-light)",
          color: "var(--primary)",
        }}
        aria-hidden="true"
      >
        {icon}
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
