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
  const variantStyles = {
    primary: "bg-[#1B3B36] text-white border-[#1B3B36] hover:bg-[#122824]",
    accent: "bg-[#C85A32] text-white border-[#C85A32] hover:bg-[#A64522]",
    surface: "bg-white text-[#1C1C1A] border-[#D1CEC4] hover:bg-[#F2EFE9]",
  };

  return (
    <button
      type="button"
      className={`btn-patient w-full flex items-center justify-center gap-4 text-xl font-bold rounded-2xl shadow-sm border-2 ${variantStyles[variant]} ${className}`}
      style={{ minHeight: "64px" }}
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
