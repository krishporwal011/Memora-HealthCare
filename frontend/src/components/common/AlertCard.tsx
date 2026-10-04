interface AlertCardProps {
  patientName: string;
  message: string;
  observedValue: number;
  baselineMedian: number;
  robustZ: number;
  onAcknowledge: () => void;
  onMarkUnwell: () => void;
  isUnwell: boolean;
}

export function AlertCard({
  patientName,
  message,
  observedValue,
  baselineMedian,
  robustZ,
  onAcknowledge,
  onMarkUnwell,
  isUnwell,
}: AlertCardProps) {
  return (
    <div
      role="alert"
      className="rounded-[var(--radius-card)] border-2 p-5 space-y-4"
      style={{
        background: "var(--accent-light)",
        borderColor: "var(--accent)",
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span
          className="text-2xl shrink-0 mt-0.5"
          aria-hidden="true"
        >
          ⚠️
        </span>
        <div>
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--accent-dark)" }}
          >
            Gentle attention — {patientName}
          </p>
          <p
            className="text-sm font-semibold mt-0.5 leading-snug"
            style={{ color: "var(--ink)" }}
          >
            {message}
          </p>
        </div>
      </div>

      {/* Explainable numbers */}
      <div
        className="grid grid-cols-3 gap-2 rounded-[var(--radius-md)] p-3 border"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="text-center">
          <span
            className="block text-lg font-extrabold"
            style={{ color: "var(--alert)" }}
          >
            {Math.round(observedValue * 100)}%
          </span>
          <span
            className="block text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--ink-muted)" }}
          >
            Today
          </span>
        </div>
        <div className="text-center">
          <span
            className="block text-lg font-extrabold"
            style={{ color: "var(--primary)" }}
          >
            {Math.round(baselineMedian * 100)}%
          </span>
          <span
            className="block text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--ink-muted)" }}
          >
            Usual
          </span>
        </div>
        <div className="text-center">
          <span
            className="block text-lg font-extrabold"
            style={{ color: "var(--alert)" }}
          >
            {robustZ.toFixed(1)}
          </span>
          <span
            className="block text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--ink-muted)" }}
          >
            z-score
          </span>
        </div>
      </div>

      {/* Non-diagnostic guidance */}
      <p
        className="text-xs leading-relaxed"
        style={{ color: "var(--ink-soft)" }}
      >
        This is different from {patientName}&apos;s usual pattern. Temporary tiredness, poor sleep, or mild illness can cause this. Consider checking in with them or consulting a doctor if this continues.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        {!isUnwell && (
          <button
            type="button"
            onClick={onMarkUnwell}
            className="px-4 py-2 rounded-[var(--radius-md)] text-xs font-bold border transition-colors"
            style={{
              background: "var(--surface)",
              color: "var(--ink-soft)",
              borderColor: "var(--border)",
            }}
          >
            Mark as unwell today
          </button>
        )}
        <button
          type="button"
          onClick={onAcknowledge}
          className="px-4 py-2 rounded-[var(--radius-md)] text-xs font-bold border transition-colors"
          style={{
            background: "var(--accent)",
            color: "var(--accent-ink)",
            borderColor: "var(--accent)",
          }}
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}
