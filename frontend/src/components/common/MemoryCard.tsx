interface MemoryCardProps {
  memoryType: "photo" | "song" | "story";
  caption: string;
  people?: string[];
  year?: number;
  isApproved: boolean;
  isOfflinePending?: boolean;
  onApprove?: () => void;
  onDelete?: () => void;
}

const MEMORY_ICON: Record<string, string> = {
  photo: "📸",
  song: "🎵",
  story: "📖",
};

const MEMORY_LABEL: Record<string, string> = {
  photo: "Photo",
  song: "Song",
  story: "Story",
};

export function MemoryCard({
  memoryType,
  caption,
  people = [],
  year,
  isApproved,
  isOfflinePending = false,
  onApprove,
  onDelete,
}: MemoryCardProps) {
  return (
    <article
      className="rounded-[var(--radius-card)] border p-5 flex flex-col gap-3 transition-shadow hover:shadow-[var(--shadow-md)]"
      style={{
        background: "var(--surface)",
        borderColor: isApproved ? "var(--border-soft)" : "var(--accent)",
      }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center text-xl shrink-0"
          style={{ background: "var(--primary-light)", color: "var(--primary)" }}
          aria-hidden="true"
        >
          {MEMORY_ICON[memoryType] ?? "📁"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: "var(--ink-muted)" }}
            >
              {MEMORY_LABEL[memoryType]}
            </span>
            {year && (
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md border"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--ink-soft)",
                  borderColor: "var(--border)",
                }}
              >
                {year}
              </span>
            )}
            {isOfflinePending && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
                style={{
                  background: "var(--accent-light)",
                  color: "var(--accent-dark)",
                  borderColor: "var(--accent)",
                }}
              >
                Saved locally
              </span>
            )}
          </div>
          <p
            className="text-sm font-semibold leading-snug"
            style={{ color: "var(--ink)" }}
          >
            {caption}
          </p>
          {people.length > 0 && (
            <p
              className="text-xs mt-1"
              style={{ color: "var(--ink-soft)" }}
            >
              With {people.join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: "var(--border-soft)" }}>
        {onApprove && (
          <button
            type="button"
            onClick={onApprove}
            className="flex-1 py-2 rounded-[var(--radius-md)] text-xs font-bold border transition-colors"
            style={
              isApproved
                ? {
                    background: "var(--success-light)",
                    color: "var(--success)",
                    borderColor: "var(--success)",
                  }
                : {
                    background: "var(--accent-light)",
                    color: "var(--accent-dark)",
                    borderColor: "var(--accent)",
                  }
            }
            aria-pressed={isApproved}
            aria-label={isApproved ? "Approved — click to unapprove" : "Pending — click to approve"}
          >
            {isApproved ? "✓ Approved" : "Pending approval"}
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-[var(--radius-md)] text-sm transition-colors"
            style={{ color: "var(--ink-muted)" }}
            aria-label="Delete memory"
          >
            🗑️
          </button>
        )}
      </div>
    </article>
  );
}
