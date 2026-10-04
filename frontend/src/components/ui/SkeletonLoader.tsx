"use client";

import React from "react";

export interface SkeletonLoaderProps {
  variant?: "text" | "card" | "circle" | "image" | "button";
  className?: string;
  count?: number;
}

export function SkeletonLoader({
  variant = "text",
  className = "",
  count = 1,
}: SkeletonLoaderProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "circle":
        return "w-12 h-12 rounded-full";
      case "card":
        return "w-full h-48 rounded-[var(--radius-card)]";
      case "image":
        return "w-full aspect-[4/3] rounded-[var(--radius-md)]";
      case "button":
        return "w-full h-14 rounded-full";
      case "text":
      default:
        return "w-full h-5 rounded-[var(--radius-sm)]";
    }
  };

  const items = Array.from({ length: count });

  return (
    <div
      role="status"
      aria-label="Content is loading"
      className="w-full flex flex-col gap-2.5"
    >
      {items.map((_, i) => (
        <div
          key={i}
          className={`animate-pulse ${getVariantStyles()} ${className}`}
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-soft)",
          }}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
