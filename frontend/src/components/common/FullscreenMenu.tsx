"use client";

import React, { useEffect, useRef } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { X, Sparkles, Heart, Activity, ShieldCheck, Home, Eye, Wifi, Settings, Box } from "lucide-react";
import { useMemoraStore } from "@/lib/store/useMemoraStore";

interface FullscreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_LINKS = [
  { href: "/", label: "Home", icon: Home, badge: "Showcase" },
  { href: "/play", label: "Patient Activities", icon: Sparkles, badge: "Calm" },
  { href: "/care", label: "Caregiver Portal", icon: Heart, badge: "Family" },
  { href: "/asha", label: "ASHA Clinical Triage", icon: Eye, badge: "Community" },
  { href: "/house", label: "3D Memory House", icon: Box, badge: "Gallery" },
  { href: "/sync", label: "Offline & Sync Center", icon: Wifi, badge: "Local" },
  { href: "/settings", label: "Accessibility Settings", icon: Settings, badge: "Preferences" },
  { href: "/privacy", label: "Privacy & Consent", icon: ShieldCheck, badge: "DPDP 2023" },
];

export function FullscreenMenu({ isOpen, onClose }: FullscreenMenuProps) {
  const pathname = usePathname();
  const { calmMode, toggleCalmMode } = useMemoraStore();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      ref={dialogRef}
      className="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 transition-opacity duration-300"
      style={{
        background: "var(--ink)",
        color: "var(--bg)",
      }}
    >
      {/* ── Top Bar inside Menu ── */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "rgba(255, 255, 255, 0.15)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-lg border"
            style={{
              background: "var(--accent)",
              color: "var(--accent-ink)",
              borderColor: "var(--accent-light)",
            }}
          >
            M
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight block">Memora</span>
            <span className="text-xs uppercase tracking-wider block opacity-75">North East India</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Calm mode quick toggle */}
          <button
            type="button"
            onClick={toggleCalmMode}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold transition-colors cursor-pointer"
            style={{
              minHeight: "48px",
              background: calmMode ? "var(--primary)" : "transparent",
              color: "var(--bg)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
            aria-pressed={calmMode}
          >
            <Activity size={16} />
            <span>Calm Mode: {calmMode ? "ON" : "OFF"}</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-full border flex items-center justify-center transition-colors hover:bg-white/10 cursor-pointer"
            style={{ borderColor: "rgba(255, 255, 255, 0.3)", color: "var(--bg)" }}
            aria-label="Close menu"
          >
            <X size={26} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── Menu Links with Struck-Through Current Page ── */}
      <nav className="my-auto py-8 flex flex-col gap-2 max-w-3xl">
        {MENU_LINKS.map((item) => {
          const isCurrent =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center justify-between py-2 text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight transition-transform hover:translate-x-3 no-underline ${
                isCurrent ? "line-through opacity-50" : "opacity-95 hover:opacity-100"
              }`}
              style={{ color: "var(--bg)" }}
              aria-current={isCurrent ? "page" : undefined}
            >
              <div className="flex items-center gap-4">
                <Icon size={28} className="opacity-75 group-hover:opacity-100 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </div>
              <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-white/20 hidden sm:inline-block">
                {item.badge}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Footer within Menu ── */}
      <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-4 text-xs opacity-75" style={{ borderColor: "rgba(255, 255, 255, 0.15)" }}>
        <p>Offline-first · Zero facial tracking · DPDP Act 2023 compliant</p>
        <p>Built for North East India (SIH26003)</p>
      </div>
    </div>
  );
}
