type StatusVariant = "checkin" | "watch" | "steady";

interface StatusBadgeProps {
  status: StatusVariant;
  label: string;
}

const STATUS_CONFIG: Record<
  StatusVariant,
  { icon: string; bg: string; color: string; border: string }
> = {
  checkin: {
    icon: "⚠",
    bg: "var(--alert-light)",
    color: "var(--alert)",
    border: "var(--alert)",
  },
  watch: {
    icon: "👁",
    bg: "var(--accent-light)",
    color: "var(--accent-dark)",
    border: "var(--accent)",
  },
  steady: {
    icon: "✓",
    bg: "var(--success-light)",
    color: "var(--success)",
    border: "var(--success)",
  },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
      style={{
        background: cfg.bg,
        color: cfg.color,
        borderColor: cfg.border,
      }}
    >
      <span aria-hidden="true">{cfg.icon}</span>
      <span>{label}</span>
    </span>
  );
}
