interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  context?: string;
  variant?: "neutral" | "primary" | "accent" | "alert" | "success";
}

const VARIANT_STYLES: Record<
  NonNullable<StatCardProps["variant"]>,
  { valueColor: string; bg: string; border: string }
> = {
  neutral: {
    valueColor: "var(--ink)",
    bg: "var(--surface)",
    border: "var(--border)",
  },
  primary: {
    valueColor: "var(--primary)",
    bg: "var(--primary-light)",
    border: "var(--primary)",
  },
  accent: {
    valueColor: "var(--accent-dark)",
    bg: "var(--accent-light)",
    border: "var(--accent)",
  },
  alert: {
    valueColor: "var(--alert)",
    bg: "var(--alert-light)",
    border: "var(--alert)",
  },
  success: {
    valueColor: "var(--success)",
    bg: "var(--success-light)",
    border: "var(--success)",
  },
};

export function StatCard({
  label,
  value,
  unit,
  context,
  variant = "neutral",
}: StatCardProps) {
  const style = VARIANT_STYLES[variant];

  return (
    <div
      className="p-4 rounded-[var(--radius-card)] border"
      style={{ background: style.bg, borderColor: style.border }}
    >
      <span
        className="text-[11px] font-bold uppercase tracking-wider block mb-2"
        style={{ color: "var(--ink-muted)" }}
      >
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span
          className="text-3xl font-extrabold leading-none"
          style={{ color: style.valueColor }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--ink-soft)" }}
          >
            {unit}
          </span>
        )}
      </div>
      {context && (
        <p
          className="text-xs mt-2 leading-snug"
          style={{ color: "var(--ink-soft)" }}
        >
          {context}
        </p>
      )}
    </div>
  );
}
