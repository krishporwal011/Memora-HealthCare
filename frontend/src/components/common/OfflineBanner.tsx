"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const t = useTranslations("Common");
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-[var(--accent)] text-[var(--ink)] px-4 py-3 font-semibold text-center flex items-center justify-center gap-2 border-b-2 border-[var(--ink)]"
    >
      <WifiOff className="w-5 h-5 shrink-0" aria-hidden="true" />
      <span>{t("offlineNotice")}</span>
    </div>
  );
}
