import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function HomePage() {
  const t = useTranslations("Roles");
  const tCommon = useTranslations("Common");

  return (
    <div className="flex-1 flex flex-col">

      {/* ── Hero Section ── */}
      <section
        className="relative overflow-hidden px-4 pt-12 pb-10 md:pt-16 md:pb-14 text-center"
        style={{ background: "var(--primary)" }}
        aria-labelledby="hero-heading"
      >
        {/* Decorative floating memory cards (CSS, no JS) */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
          style={{ opacity: 0.12 }}
        >
          {/* Card 1 */}
          <div
            className="absolute w-28 h-36 rounded-2xl border-2 border-white rotate-[-12deg] top-6 left-[5%]"
            style={{ background: "rgba(255,255,255,0.15)" }}
          />
          {/* Card 2 */}
          <div
            className="absolute w-24 h-32 rounded-2xl border-2 border-white rotate-[8deg] top-10 right-[8%]"
            style={{ background: "rgba(255,255,255,0.10)" }}
          />
          {/* Card 3 */}
          <div
            className="absolute w-20 h-28 rounded-xl border-2 border-white rotate-[-5deg] bottom-4 left-[20%]"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          {/* Card 4 */}
          <div
            className="absolute w-32 h-24 rounded-2xl border-2 border-white rotate-[14deg] bottom-2 right-[15%]"
            style={{ background: "rgba(255,255,255,0.10)" }}
          />
        </div>

        {/* Hero content */}
        <div className="relative max-w-xl mx-auto">
          {/* Brand mark */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-4 border-2"
            style={{
              background: "var(--accent)",
              color: "#fff",
              borderColor: "rgba(255,255,255,0.3)",
            }}
            aria-hidden="true"
          >
            M
          </div>

          <h1
            id="hero-heading"
            className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-3"
            style={{ color: "#fff" }}
          >
            Memora
          </h1>
          <p
            className="text-xl md:text-2xl font-semibold mb-2"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            Memories that stay close.
          </p>
          <p
            className="text-sm md:text-base leading-relaxed max-w-sm mx-auto"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            A calm digital companion for remembering, connecting, and supporting everyday cognitive wellbeing — in your language, offline, always.
          </p>
        </div>
      </section>

      {/* Woven cultural stripe */}
      <div className="woven-edge" aria-hidden="true" />

      {/* ── Role Selection ── */}
      <section
        className="flex-1 px-4 py-8 max-w-xl w-full mx-auto"
        aria-label="Choose your role"
      >
        <h2
          className="text-base font-bold uppercase tracking-widest text-center mb-6"
          style={{ color: "var(--ink-muted)" }}
        >
          {t("selectRole")}
        </h2>

        <div className="space-y-4">
          {/* Patient */}
          <Link
            href="/play"
            className="group flex items-stretch rounded-[var(--radius-card)] overflow-hidden no-underline transition-all"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
            style-hover="box-shadow: var(--shadow-md);"
          >
            <div
              className="w-1.5 shrink-0 transition-all group-hover:w-2"
              style={{ background: "var(--primary)" }}
              aria-hidden="true"
            />
            <div className="flex items-center gap-4 p-5 w-full">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-105"
                style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                aria-hidden="true"
              >
                🌸
              </div>
              <div>
                <span
                  className="text-xl font-bold block leading-snug"
                  style={{ color: "var(--ink)" }}
                >
                  {t("patientTitle")}
                </span>
                <span
                  className="text-sm block mt-0.5"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {t("patientSubtitle")}
                </span>
              </div>
              <span
                className="ml-auto text-xl opacity-40 group-hover:opacity-80 transition-opacity"
                aria-hidden="true"
                style={{ color: "var(--primary)" }}
              >
                →
              </span>
            </div>
          </Link>

          {/* Caregiver */}
          <Link
            href="/care"
            className="group flex items-stretch rounded-[var(--radius-card)] overflow-hidden no-underline transition-all"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              className="w-1.5 shrink-0 transition-all group-hover:w-2"
              style={{ background: "var(--accent)" }}
              aria-hidden="true"
            />
            <div className="flex items-center gap-4 p-5 w-full">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-105"
                style={{ background: "var(--accent-light)", color: "var(--accent-dark)" }}
                aria-hidden="true"
              >
                🏡
              </div>
              <div>
                <span
                  className="text-xl font-bold block leading-snug"
                  style={{ color: "var(--ink)" }}
                >
                  {t("caregiverTitle")}
                </span>
                <span
                  className="text-sm block mt-0.5"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {t("caregiverSubtitle")}
                </span>
              </div>
              <span
                className="ml-auto text-xl opacity-40 group-hover:opacity-80 transition-opacity"
                aria-hidden="true"
                style={{ color: "var(--accent)" }}
              >
                →
              </span>
            </div>
          </Link>

          {/* ASHA */}
          <Link
            href="/asha"
            className="group flex items-stretch rounded-[var(--radius-card)] overflow-hidden no-underline transition-all"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              className="w-1.5 shrink-0 transition-all group-hover:w-2"
              style={{ background: "var(--success)" }}
              aria-hidden="true"
            />
            <div className="flex items-center gap-4 p-5 w-full">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-105"
                style={{ background: "var(--success-light)", color: "var(--success)" }}
                aria-hidden="true"
              >
                🩺
              </div>
              <div>
                <span
                  className="text-xl font-bold block leading-snug"
                  style={{ color: "var(--ink)" }}
                >
                  {t("ashaTitle")}
                </span>
                <span
                  className="text-sm block mt-0.5"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {t("ashaSubtitle")}
                </span>
              </div>
              <span
                className="ml-auto text-xl opacity-40 group-hover:opacity-80 transition-opacity"
                aria-hidden="true"
                style={{ color: "var(--success)" }}
              >
                →
              </span>
            </div>
          </Link>
        </div>

        {/* Trust & Privacy strip */}
        <div
          className="mt-8 rounded-[var(--radius-md)] p-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-center"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-soft)",
            color: "var(--ink-soft)",
          }}
        >
          <span>🔒 Data stays in India (Mumbai)</span>
          <span aria-hidden="true">·</span>
          <span>📵 Works offline</span>
          <span aria-hidden="true">·</span>
          <span>🗣️ 6 local languages</span>
          <span aria-hidden="true">·</span>
          <span>🚫 Not a diagnostic tool</span>
        </div>

        {/* Disclaimer */}
        <p
          className="mt-4 text-xs text-center leading-relaxed"
          style={{ color: "var(--ink-muted)" }}
        >
          {tCommon("disclaimer")}
        </p>
      </section>
    </div>
  );
}
