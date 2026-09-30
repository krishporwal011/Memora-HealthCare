"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

export function Header() {
  const t = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();

  const locales = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "as", label: "অসমীয়া" },
    { code: "bn", label: "বাংলা" },
    { code: "brx", label: "बड़ो" },
    { code: "mni", label: "মৈতৈলোন্" },
  ];

  return (
    <header className="bg-[#1B3B36] text-white shadow-sm">
      <div className="woven-edge" />
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline text-white">
          <div className="w-10 h-10 rounded-full bg-[#C85A32] flex items-center justify-center font-bold text-lg text-white border-2 border-[#F8F6F0]">
            M
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-tight m-0">
              {t("appName")}
            </h1>
            <span className="text-xs text-[#D1CEC4] block">SIH26003 • NER</span>
          </div>
        </Link>

        {/* Accessible Language Switcher */}
        <nav aria-label="Language selection" className="flex items-center gap-1 bg-[#122824] p-1 rounded-lg border border-[#3E5C56]">
          {locales.map((loc) => {
            const isActive = locale === loc.code;
            return (
              <Link
                key={loc.code}
                href={pathname}
                locale={loc.code}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-[#C85A32] text-white font-bold"
                    : "text-[#D1CEC4] hover:text-white"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {loc.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
