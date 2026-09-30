"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

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
      className="bg-[#D99B26] text-[#1C1C1A] px-4 py-3 font-semibold text-center flex items-center justify-center gap-2 border-b-2 border-[#1C1C1A]"
    >
      <span className="text-xl" aria-hidden="true">📡</span>
      <span>{t("offlineNotice")}</span>
    </div>
  );
}
