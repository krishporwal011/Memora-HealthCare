"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Menu, Activity, Globe } from "lucide-react";
import { useMemoraStore } from "@/lib/store/useMemoraStore";
import { FullscreenMenu } from "./FullscreenMenu";

const LOCALES = [
  { code: "en", label: "EN", full: "English" },
  { code: "hi", label: "हि", full: "हिन्दी" },
  { code: "as", label: "অস", full: "অসমীয়া" },
  { code: "bn", label: "বাং", full: "বাংলা" },
  { code: "brx", label: "बड़", full: "बड़ो" },
  { code: "mni", label: "ꯃꯩ", full: "মৈতৈলোন্" },
];

export function Header() {
  const t = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { calmMode, toggleCalmMode } = useMemoraStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isPatientRoute = pathname.includes("/play");

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full"
        style={{
          background: isPatientRoute ? "var(--primary)" : "var(--primary-dark)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Cultural woven motif */}
        <div className="woven-edge" />

        <div className="max-w-6xl mx-auto px-4 py-2 md:py-2.5 flex items-center justify-between gap-3">
          {/* ── Brand / Logo Mark ── */}
          <Link
            href="/"
            className="flex items-center gap-3 no-underline shrink-0"
            aria-label="Memora — home"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-base md:text-lg shrink-0 border-2"
              style={{
                background: "var(--accent)",
                color: "var(--accent-ink)",
                borderColor: "var(--accent-light)",
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
                style={{ color: "var(--primary-light)", opacity: 0.9 }}
              >
                North East India
              </span>
            </div>
          </Link>

          {/* ── Controls (Language + Calm Toggle + Menu) ── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher — 48px touch targets */}
            <nav aria-label="Language selection" className="flex items-center">
              {/* Mobile compact select (min 48px height) */}
              <div className="sm:hidden relative flex items-center">
                <label className="sr-only" htmlFor="lang-select">Choose language</label>
                <div className="flex items-center gap-1.5 px-3 rounded-full border"
                  style={{
                    background: "var(--primary)",
                    borderColor: "var(--primary-light)",
                    minHeight: "48px",
                  }}
                >
                  <Globe size={16} style={{ color: "var(--primary-ink)" }} aria-hidden="true" />
                  <select
                    id="lang-select"
                    className="text-xs font-bold bg-transparent outline-none cursor-pointer"
                    style={{ color: "var(--primary-ink)" }}
                    value={locale}
                    onChange={(e) => handleLocaleChange(e.target.value)}
                  >
                    {LOCALES.map((loc) => (
                      <option
                        key={loc.code}
                        value={loc.code}
                        style={{ background: "var(--surface)", color: "var(--ink)" }}
                      >
                        {loc.full}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tablet+ pill buttons with min 48px touch target */}
              <div
                className="hidden sm:flex items-center gap-1 p-1 rounded-full border"
                style={{
                  background: "var(--primary)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                }}
              >
                {LOCALES.map((loc) => {
                  const isActive = locale === loc.code;
                  return (
                    <button
                      key={loc.code}
                      type="button"
                      onClick={() => handleLocaleChange(loc.code)}
                      className={`px-3 font-bold rounded-full transition-all cursor-pointer ${
                        isActive ? "shadow-xs" : "opacity-80 hover:opacity-100"
                      }`}
                      style={{
                        minHeight: "44px",
                        minWidth: "44px",
                        background: isActive ? "var(--accent)" : "transparent",
                        color: isActive ? "var(--accent-ink)" : "var(--primary-ink)",
                      }}
                      aria-current={isActive ? "page" : undefined}
                      title={loc.full}
                    >
                      {loc.label}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Calm Mode Toggle (min 48px target, icon + text) */}
            <button
              type="button"
              onClick={toggleCalmMode}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 rounded-full border text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer"
              style={{
                minHeight: "48px",
                background: calmMode ? "var(--accent)" : "var(--primary)",
                color: calmMode ? "var(--accent-ink)" : "var(--primary-ink)",
                borderColor: calmMode ? "var(--accent-light)" : "var(--primary-light)",
              }}
              aria-pressed={calmMode}
              aria-label={`Calm mode: ${calmMode ? "Active" : "Inactive"}`}
            >
              <Activity size={16} aria-hidden="true" />
              <span>{calmMode ? "Calm On" : "Calm"}</span>
            </button>

            {/* Showcase Fullscreen Menu Toggle (min 48px target) */}
            {!isPatientRoute && (
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="w-12 h-12 rounded-full border flex items-center justify-center transition-colors hover:bg-white/10 cursor-pointer"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.25)",
                  color: "var(--primary-ink)",
                }}
                aria-label="Open full site menu"
              >
                <Menu size={22} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Fullscreen Showcase Menu */}
      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
