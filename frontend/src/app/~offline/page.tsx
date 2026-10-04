import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline — Memora",
  description: "Memora is ready to use offline.",
};

export default function OfflineFallbackPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      <div
        className="w-full max-w-md rounded-[var(--radius-card)] p-8 space-y-6"
        style={{
          background: "var(--surface)",
          border: "2px solid var(--border)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl border-2"
          style={{
            background: "var(--primary-light)",
            borderColor: "var(--primary)",
            color: "var(--primary)",
          }}
          aria-hidden="true"
        >
          🌿
        </div>

        <div className="space-y-2">
          <span
            className="inline-block text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider"
            style={{
              background: "var(--surface-2)",
              color: "var(--ink-soft)",
              borderColor: "var(--border)",
            }}
          >
            Offline Mode Active
          </span>
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            Everything Still Works
          </h1>
          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--ink-soft)" }}
          >
            Memora is built for the North East and works safely without internet. Your memories, games, and activities are always ready on this device.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <a
            href="/"
            className="w-full inline-flex items-center justify-center font-bold text-lg rounded-[var(--radius-md)] text-white no-underline transition-colors"
            style={{
              background: "var(--primary)",
              minHeight: "56px",
              padding: "12px 24px",
            }}
          >
            Go to Home Screen
          </a>

          <a
            href="/en/play"
            className="w-full inline-flex items-center justify-center font-bold text-base rounded-[var(--radius-md)] no-underline transition-colors"
            style={{
              background: "var(--surface-2)",
              color: "var(--ink)",
              border: "1px solid var(--border)",
              minHeight: "48px",
              padding: "10px 20px",
            }}
          >
            Open Today's Activities
          </a>
        </div>
      </div>
    </div>
  );
}
