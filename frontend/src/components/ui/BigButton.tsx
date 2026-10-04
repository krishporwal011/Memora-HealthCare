"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface BigButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: React.ReactNode;
  variant?: "primary" | "accent" | "surface" | "outline" | "ghost";
  size?: "patient" | "large" | "default";
  loading?: boolean;
}

export function BigButton({
  label,
  icon,
  variant = "primary",
  size = "patient",
  loading = false,
  disabled,
  className = "",
  style,
  ...props
}: BigButtonProps) {
  const getVariantStyles = (): React.CSSProperties => {
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
      case "outline":
        return {
          background: "transparent",
          color: "var(--primary)",
          borderColor: "var(--primary)",
        };
      case "ghost":
        return {
          background: "transparent",
          color: "var(--ink)",
          borderColor: "transparent",
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

  const getSizeClasses = () => {
    switch (size) {
      case "patient":
        return "min-h-[var(--touch-target-patient)] text-xl font-bold px-6 py-4 rounded-[var(--radius-card)]";
      case "large":
        return "min-h-[56px] text-lg font-bold px-6 py-3 rounded-[var(--radius-md)]";
      case "default":
      default:
        return "min-h-[48px] text-base font-semibold px-4 py-2.5 rounded-[var(--radius-md)]";
    }
  };

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-3 border-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none ${getSizeClasses()} ${className}`}
      style={{
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin shrink-0" size={size === "patient" ? 28 : 22} aria-hidden="true" />
      ) : (
        icon && <span className="shrink-0 flex items-center justify-center" aria-hidden="true">{icon}</span>
      )}
      <span className="truncate">{label}</span>
    </button>
  );
}
