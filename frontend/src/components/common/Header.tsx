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

      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 no-underline shrink-0"
          aria-label="Memora — go to home"
        >
          {/* Logo mark: M with memory-loop curve via CSS */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-lg shrink-0 border-2"
            style={{
              background: "var(--accent)",
              color: "#fff",
              borderColor: "rgba(255,255,255,0.25)",
              letterSpacing: "-0.5px",
            }}
            aria-hidden="true"
          >
            M
          </div>
          <div>
            <span
              className="text-xl font-extrabold tracking-tight leading-none block"
              style={{ color: "#fff" }}
            >
              {t("appName")}
            </span>
            <span
              className="text-[10px] font-semibold tracking-widest uppercase block leading-tight opacity-70"
              style={{ color: "#fff" }}
            >
              SIH 2026 · NER
            </span>
          </div>
        </Link>

        {/* Language switcher — dropdown on mobile, pill tabs on sm+ */}
        <nav aria-label="Language selection">

          {/* Mobile: compact <select> */}
          <label className="sr-only" htmlFor="lang-select">Choose language</label>
          <select
            id="lang-select"
            className="sm:hidden text-sm font-semibold rounded-lg px-2 py-1.5 border focus-visible:outline-offset-2"
            style={{
              background: "var(--primary-dark)",
              color: "#fff",
              borderColor: "rgba(255,255,255,0.3)",
            }}
            value={locale}
            onChange={handleLocaleChange}
          >
            {LOCALES.map((loc) => (
              <option key={loc.code} value={loc.code}>
                {loc.full}
              </option>
            ))}
          </select>

          {/* Tablet+: pill tabs */}
          <div
            className="hidden sm:flex items-center gap-0.5 p-1 rounded-xl"
            style={{ background: "var(--primary-dark)" }}
          >
            {LOCALES.map((loc) => {
              const isActive = locale === loc.code;
              return (
                <Link
                  key={loc.code}
                  href={pathname}
                  locale={loc.code}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors no-underline ${
                    isActive ? "shadow-sm" : "opacity-70 hover:opacity-100"
                  }`}
                  style={
                    isActive
                      ? { background: "var(--accent)", color: "#fff" }
                      : { color: "#fff" }
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
