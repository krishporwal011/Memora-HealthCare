"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { Home, PhoneCall, Check } from "lucide-react";

export function PatientBottomBar() {
  const [calling, setCalling] = useState(false);

  const handleCallFamily = () => {
    setCalling(true);
    if (typeof window !== "undefined") {
      window.location.assign("tel:+919876543210");
    }
    setTimeout(() => setCalling(false), 4000);
  };

  return (
    <nav
      aria-label="Patient Quick Navigation"
      className="sticky bottom-0 z-40 w-full border-t shadow-lg px-4 py-3"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        {/* Persistent Home Button — Min 64px */}
        <Link
          href="/"
          className="flex-1 inline-flex items-center justify-center gap-3 text-lg md:text-xl font-bold rounded-[var(--radius-card)] border-2 transition-transform active:scale-95 no-underline cursor-pointer"
          style={{
            background: "var(--surface-2)",
            borderColor: "var(--border)",
            color: "var(--primary-dark)",
            minHeight: "var(--touch-target-patient)",
          }}
          aria-label="Go to main home screen"
        >
          <Home size={26} aria-hidden="true" />
          <span>Home</span>
        </Link>

        {/* Persistent Call Family Button — Min 64px */}
        <button
          type="button"
          onClick={handleCallFamily}
          className="flex-1 inline-flex items-center justify-center gap-3 text-lg md:text-xl font-bold rounded-[var(--radius-card)] border-2 text-white shadow-md transition-transform active:scale-95 cursor-pointer"
          style={{
            background: calling ? "var(--success)" : "var(--accent)",
            borderColor: calling ? "var(--success)" : "var(--accent-dark)",
            minHeight: "var(--touch-target-patient)",
          }}
          aria-label="Call family member now"
        >
          {calling ? (
            <>
              <Check size={26} aria-hidden="true" />
              <span>Calling...</span>
            </>
          ) : (
            <>
              <PhoneCall size={26} aria-hidden="true" />
              <span>Call Family</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
