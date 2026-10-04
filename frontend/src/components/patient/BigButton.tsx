"use client";

import React from "react";

interface BigButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: string;
  variant?: "primary" | "accent" | "surface";
}

export function BigButton({
  label,
  icon,
  variant = "primary",
  className = "",
  ...props
}: BigButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "accent":
        return {
          background: "var(--accent)",
          color: "var(--accent-ink)",
          borderColor: "var(--accent-dark)",
        };
      case "surface":
        return {
          background: "var(--surface)",
          color: "var(--ink)",
          borderColor: "var(--border)",
        };
      case "primary":
      default:
        return {
          background: "var(--primary)",
          color: "var(--primary-ink)",
          borderColor: "var(--primary-dark)",
        };
    }
  };

  return (
    <button
      type="button"
      className={`btn-patient w-full flex items-center justify-center gap-4 text-xl font-bold rounded-[var(--radius-md)] shadow-sm border-2 transition-transform active:scale-95 ${className}`}
      style={{
        minHeight: "var(--touch-target-patient)",
        ...getVariantStyles(),
      }}
      {...props}
    >
      {icon && (
        <span className="text-3xl" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{label}</span>
    </button>
  );
}
