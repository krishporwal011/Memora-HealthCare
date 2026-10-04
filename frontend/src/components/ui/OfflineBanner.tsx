"use client";

import React, { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export interface OfflineBannerProps {
  forceVisible?: boolean;
  message?: string;
  className?: string;
}

export function OfflineBanner({
  forceVisible = false,
  message,
  className = "",
}: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !forceVisible) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className={`w-full py-2.5 px-4 text-center flex items-center justify-center gap-2.5 text-xs md:text-sm font-bold border-b shadow-xs select-none ${className}`}
      style={{
        background: "var(--accent-light)",
        color: "var(--accent-dark)",
        borderColor: "var(--accent)",
      }}
    >
      <WifiOff size={18} aria-hidden="true" className="shrink-0" />
      <span>
        {message || "Working offline — all memory activities and progress are safely saved on this device."}
      </span>
    </aside>
  );
}
