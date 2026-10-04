"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";

const LOCALES = [
  { code: "en",  label: "EN",       full: "English" },
  { code: "hi",  label: "हि",       full: "हिन्दी" },
  { code: "as",  label: "অস",       full: "অসমীয়া" },
  { code: "bn",  label: "বাং",      full: "বাংলা" },
  { code: "brx", label: "बड़",      full: "बड़ो" },
  { code: "mni", label: "ꯃꯩ",      full: "মৈতৈলোন্" },
];

export function Header() {
  const t = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.replace(pathname, { locale: e.target.value });
  };

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{ background: "var(--primary)", boxShadow: "var(--shadow-md)" }}
    >
      {/* NER cultural woven stripe */}
      <div className="woven-edge" />

      <div className="max-w-6xl mx-auto px-4 py-2 md:py-2.5 flex items-center justify-between gap-3">

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 no-underline shrink-0"
          aria-label="Memora — go to home"
        >
          {/* Logo mark */}
          <div
            className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-extrabold text-base md:text-lg shrink-0 border-2"
            style={{
              background: "var(--accent)",
              color: "var(--accent-ink)",
              borderColor: "var(--accent-light)",
              letterSpacing: "-0.5px",
            }}
            aria-hidden="true"
          >
            M
          </div>
          <div>
            <span
              className="text-lg md:text-xl font-extrabold tracking-tight leading-none block"
              style={{ color: "var(--primary-ink)" }}
            >
              {t("appName")}
            </span>
            <span
              className="text-[10px] font-semibold tracking-widest uppercase block leading-tight mt-0.5"
              style={{ color: "var(--primary-light)", opacity: 0.85 }}
            >
              North East India
            </span>
          </div>
        </Link>

        {/* Language switcher — dropdown on mobile, pill tabs on sm+ */}
        <nav aria-label="Language selection">
          {/* Mobile: compact <select> */}
          <label className="sr-only" htmlFor="lang-select">Choose language</label>
          <select
            id="lang-select"
            className="sm:hidden text-xs font-bold rounded-lg px-2.5 py-1.5 border focus-visible:outline-offset-2"
            style={{
              background: "var(--primary-dark)",
              color: "var(--primary-ink)",
              borderColor: "var(--primary-light)",
            }}
            value={locale}
            onChange={handleLocaleChange}
          >
            {LOCALES.map((loc) => (
              <option key={loc.code} value={loc.code} style={{ background: "var(--primary-dark)", color: "var(--primary-ink)" }}>
                {loc.full}
              </option>
            ))}
          </select>

          {/* Tablet+: pill tabs */}
          <div
            className="hidden sm:flex items-center gap-1 p-1 rounded-xl"
            style={{ background: "var(--primary-dark)" }}
          >
            {LOCALES.map((loc) => {
              const isActive = locale === loc.code;
              return (
                <Link
                  key={loc.code}
                  href={pathname}
                  locale={loc.code}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors no-underline ${
                    isActive ? "shadow-xs" : "opacity-80 hover:opacity-100"
                  }`}
                  style={
                    isActive
                      ? { background: "var(--accent)", color: "var(--accent-ink)" }
                      : { color: "var(--primary-ink)" }
                  }
                  aria-current={isActive ? "page" : undefined}
                  title={loc.full}
                >
                  {loc.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
